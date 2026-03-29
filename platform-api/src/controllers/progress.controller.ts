import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as progressService from '../services/progress.service.js';

export const getUserProgress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const result = await progressService.getUserProgress(userId);
    res.status(200).json({ success: true, data: result });
  },
);

export const getCourseProgress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const courseId = req.params['courseId'] as string;
    const result = await progressService.getCourseProgress(userId, courseId);
    res.status(200).json({ success: true, data: result });
  },
);
