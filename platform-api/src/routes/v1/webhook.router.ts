import { Router } from 'express';
import { handleWebhook } from '../../controllers/subscription.controller.js';

const webhookRouter = Router();

// express.raw は server.ts で /api/v1/webhooks/stripe に対して設定済み
webhookRouter.post('/webhooks/stripe', handleWebhook);

export default webhookRouter;
