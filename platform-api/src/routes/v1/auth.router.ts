import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { syncUserHandler, getMeHandler, updateMeHandler } from '../../controllers/auth.controller.js';
import { z } from 'zod';

const UpdateMeSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

const authRouter = Router();

authRouter.post('/sync', authenticate, syncUserHandler);
authRouter.get('/me', authenticate, getMeHandler);
authRouter.patch('/me', authenticate, validate(UpdateMeSchema), updateMeHandler);

export default authRouter;
