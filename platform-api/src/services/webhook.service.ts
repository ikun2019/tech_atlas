import { stripe } from '../lib/stripe.js';
import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { readEnvOrFile } from '../utils/env.js';
import * as subscriptionRepository from '../repositories/subscription.repository.js';
import { sendWelcomeMail, sendPaymentFailedMail } from '../lib/resend.js';
import type { Plan, SubscriptionStatus } from '@prisma/client';
import type Stripe from 'stripe';

function planFromPriceId(priceId: string): Plan {
	const stripePriceYearly = readEnvOrFile('STRIPE_PRICE_YEARLY');
	if (priceId === stripePriceYearly) {
		return 'YEARLY';
	}
	return 'MONTHLY';
}

async function invalidateSubCache(userId: string): Promise<void> {
	await redis.del(`sub:${userId}`);
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
	const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
	return user?.id ?? null;
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
	const webhookSecret = readEnvOrFile('STRIPE_WEBHOOK_SECRET');

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
	} catch {
		throw Object.assign(new Error('Webhook 署名の検証に失敗しました'), {
			code: 'WEBHOOK_SIGNATURE_INVALID',
			statusCode: 400,
		});
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			if (session.mode !== 'subscription') break;

			const stripeSubscriptionId =
				typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

			if (!stripeSubscriptionId) break;

			const userId =
				(session.metadata?.['userId'] as string | undefined) ??
				(await getUserIdFromCustomer(
					typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? ''),
				));

			if (!userId) break;

			const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
			const priceId = stripeSub.items.data[0]?.price.id ?? '';

			await subscriptionRepository.upsertByStripeSubscriptionId(stripeSubscriptionId, {
				userId,
				stripePriceId: priceId,
				status: stripeSub.status.toUpperCase() as SubscriptionStatus,
				plan: planFromPriceId(priceId),
				currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
				cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
			});

			await invalidateSubCache(userId);

			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (user) {
				await sendWelcomeMail(user.email, user.name);
			}
			break;
		}

		case 'customer.subscription.updated': {
			const stripeSub = event.data.object as Stripe.Subscription;
			const priceId = stripeSub.items.data[0]?.price.id ?? '';

			const existing = await subscriptionRepository.findByStripeSubscriptionId(stripeSub.id);
			if (!existing) break;

			await subscriptionRepository.upsertByStripeSubscriptionId(stripeSub.id, {
				userId: existing.userId,
				stripePriceId: priceId,
				status: stripeSub.status.toUpperCase() as SubscriptionStatus,
				plan: planFromPriceId(priceId),
				currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
				cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
			});

			await invalidateSubCache(existing.userId);
			break;
		}

		case 'customer.subscription.deleted': {
			const stripeSub = event.data.object as Stripe.Subscription;
			const priceId = stripeSub.items.data[0]?.price.id ?? '';

			const existing = await subscriptionRepository.findByStripeSubscriptionId(stripeSub.id);
			if (!existing) break;

			await subscriptionRepository.upsertByStripeSubscriptionId(stripeSub.id, {
				userId: existing.userId,
				stripePriceId: priceId,
				status: 'CANCELED',
				plan: planFromPriceId(priceId),
				currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
				cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
			});

			await invalidateSubCache(existing.userId);
			break;
		}

		case 'invoice.payment_failed': {
			const invoice = event.data.object as Stripe.Invoice;

			const stripeSubscriptionId =
				typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

			if (!stripeSubscriptionId) break;

			const existing =
				await subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);
			if (!existing) break;

			const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
			const priceId = stripeSub.items.data[0]?.price.id ?? '';

			await subscriptionRepository.upsertByStripeSubscriptionId(stripeSubscriptionId, {
				userId: existing.userId,
				stripePriceId: priceId,
				status: 'PAST_DUE',
				plan: planFromPriceId(priceId),
				currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
				cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
			});

			await invalidateSubCache(existing.userId);

			const user = await prisma.user.findUnique({ where: { id: existing.userId } });
			if (user) {
				await sendPaymentFailedMail(user.email, user.name);
			}
			break;
		}

		default:
			// 未処理イベントは無視（エラーにしない）
			break;
	}
}
