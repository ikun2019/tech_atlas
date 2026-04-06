import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { stripe } from '../lib/stripe.js';
import { env, readEnvOrFile } from '../utils/env.js';
import * as subscriptionRepository from '../repositories/subscription.repository.js';
import type { SubscriptionStatus } from '@prisma/client';

const SUB_CACHE_TTL = 300;

export async function hasActiveSubscription(userId: string): Promise<boolean> {
	const cacheKey = `sub:${userId}`;
	const cached = await redis.get(cacheKey);
	if (cached !== null) {
		return cached === 'ACTIVE' || cached === 'TRIALING';
	}

	const subscription = await prisma.subscription.findFirst({
		where: { userId },
		select: { status: true },
	});

	const status = subscription?.status ?? null;
	if (status !== null) {
		await redis.setex(cacheKey, SUB_CACHE_TTL, status);
	}

	return status === 'ACTIVE' || status === 'TRIALING';
}

export async function getStatus(userId: string): Promise<SubscriptionStatus | null> {
	const cacheKey = `sub:${userId}`;
	const cached = await redis.get(cacheKey);
	if (cached !== null) {
		return cached as SubscriptionStatus;
	}

	const subscription = await prisma.subscription.findFirst({
		where: { userId },
		select: { status: true },
	});

	const status = subscription?.status ?? null;
	if (status !== null) {
		await redis.setex(cacheKey, SUB_CACHE_TTL, status);
	}

	return status;
}

export async function getFullStatus(userId: string): Promise<{
	hasSubscription: boolean;
	status: SubscriptionStatus | null;
	plan: import('@prisma/client').Plan | null;
	currentPeriodEnd: Date | null;
	cancelAtPeriodEnd: boolean;
}> {
	const subscription = await subscriptionRepository.findByUserId(userId);
	if (!subscription) {
		return { hasSubscription: false, status: null, plan: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
	}
	return {
		hasSubscription: true,
		status: subscription.status,
		plan: subscription.plan,
		currentPeriodEnd: subscription.currentPeriodEnd,
		cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
	};
}

export async function createCheckoutSession(
	userId: string,
	plan: 'MONTHLY' | 'YEARLY',
): Promise<string> {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		throw Object.assign(new Error('ユーザーが見つかりません'), {
			code: 'USER_NOT_FOUND',
			statusCode: 404,
		});
	}

	let stripeCustomerId = user.stripeCustomerId;
	if (!stripeCustomerId) {
		const customer = await stripe.customers.create({
			email: user.email,
			name: user.name,
			metadata: { userId },
		});
		stripeCustomerId = customer.id;
		await prisma.user.update({
			where: { id: userId },
			data: { stripeCustomerId },
		});
	}
	const stripePriceMonthly = readEnvOrFile('STRIPE_PRICE_MONTHLY');
	const stripePriceYearly = readEnvOrFile('STRIPE_PRICE_YEARLY');

	const priceId = plan === 'MONTHLY' ? stripePriceMonthly : stripePriceYearly;

	const session = await stripe.checkout.sessions.create({
		customer: stripeCustomerId,
		mode: 'subscription',
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: (env.APP_URL ?? '') + '/dashboard/subscription?success=true',
		cancel_url: (env.APP_URL ?? '') + '/dashboard/subscription',
		metadata: { userId },
	});

	if (!session.url) {
		throw Object.assign(new Error('Checkout セッションの作成に失敗しました'), {
			code: 'CHECKOUT_SESSION_FAILED',
			statusCode: 500,
		});
	}

	return session.url;
}

export async function createPortalSession(userId: string): Promise<string> {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		throw Object.assign(new Error('ユーザーが見つかりません'), {
			code: 'USER_NOT_FOUND',
			statusCode: 404,
		});
	}

	if (!user.stripeCustomerId) {
		throw Object.assign(new Error('Stripe 顧客情報が見つかりません'), {
			code: 'STRIPE_CUSTOMER_NOT_FOUND',
			statusCode: 404,
		});
	}

	const portalSession = await stripe.billingPortal.sessions.create({
		customer: user.stripeCustomerId,
		return_url: (env.APP_URL ?? '') + '/dashboard/subscription',
	});

	return portalSession.url;
}

export { subscriptionRepository };
