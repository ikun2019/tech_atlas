import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as lessonContentService from '../services/lesson-content.service.js';

export const getLesson = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const lessonId = req.params['lessonId'] as string;
		const result = await lessonContentService.getLessonContent(lessonId, req.user);
		res.status(200).json({ success: true, data: result });
	},
);
