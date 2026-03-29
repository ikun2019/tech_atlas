import { prisma } from '../lib/prisma.js';
import type { Subscription, SubscriptionStatus, Plan } from '@prisma/client';

export async function findByUserId(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function upsertByStripeSubscriptionId(
  stripeSubscriptionId: string,
  data: {
    userId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    plan: Plan;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  },
): Promise<Subscription> {
  return prisma.subscription.upsert({
    where: { stripeSubscriptionId },
    create: {
      stripeSubscriptionId,
      userId: data.userId,
      stripePriceId: data.stripePriceId,
      status: data.status,
      plan: data.plan,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    },
    update: {
      stripePriceId: data.stripePriceId,
      status: data.status,
      plan: data.plan,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    },
  });
}

export async function findByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
}
