import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authService from '../services/auth.service.js';

const UpdateMeSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

export const syncUserHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = req.user!;
    const result = await authService.syncUser(
      user.supabaseId,
      user.email,
      user.name,
      user.avatarUrl ?? undefined,
    );
    res.status(200).json({ success: true, data: result });
  },
);

export const getMeHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = req.user!;
    const result = await authService.getMe(user.id);
    res.status(200).json({ success: true, data: result });
  },
);

export const updateMeHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = req.user!;
    const body = UpdateMeSchema.parse(req.body);
    const updateData: Partial<{ name: string; avatarUrl: string | null }> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    const result = await authService.updateMe(user.id, updateData);
    res.status(200).json({ success: true, data: result });
  },
);
