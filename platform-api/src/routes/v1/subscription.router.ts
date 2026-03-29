import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import {
  createCheckout,
  createPortal,
  getSubscriptionStatus,
} from '../../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.post('/subscriptions/checkout', authenticate, createCheckout);
subscriptionRouter.post('/subscriptions/portal', authenticate, createPortal);
subscriptionRouter.get('/subscriptions/status', authenticate, getSubscriptionStatus);

export default subscriptionRouter;
