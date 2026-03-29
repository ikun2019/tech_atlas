import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as subscriptionService from '../services/subscription.service.js';
import * as webhookService from '../services/webhook.service.js';

export const createCheckout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { plan } = req.body as { plan: 'MONTHLY' | 'YEARLY' };

    if (plan !== 'MONTHLY' && plan !== 'YEARLY') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'plan は MONTHLY または YEARLY を指定してください',
          statusCode: 400,
        },
      });
      return;
    }

    const url = await subscriptionService.createCheckoutSession(userId, plan);
    res.status(200).json({ success: true, data: { url } });
  },
);

export const createPortal = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const url = await subscriptionService.createPortalSession(userId);
    res.status(200).json({ success: true, data: { url } });
  },
);

export const getSubscriptionStatus = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const status = await subscriptionService.getStatus(userId);
    res.status(200).json({ success: true, data: { status } });
  },
);

export const handleWebhook = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Stripe-Signature ヘッダーが必要です',
          statusCode: 400,
        },
      });
      return;
    }

    // req.body is Buffer (set via express.raw in server.ts)
    await webhookService.handleStripeWebhook(req.body as Buffer, signature);
    res.status(200).json({ success: true, data: { received: true } });
  },
);
