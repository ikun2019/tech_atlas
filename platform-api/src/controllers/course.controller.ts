import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as courseService from '../services/course.service.js';
import * as courseRepository from '../repositories/course.repository.js';

const CourseListQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});

export const listCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const categories = await courseRepository.findAllCategories();
    res.status(200).json({ success: true, data: categories });
  },
);

export const listCourses = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const raw = CourseListQuerySchema.parse(req.query);
    const query = {
      page: raw.page,
      limit: raw.limit,
      ...(raw.categoryId ? { categoryId: raw.categoryId } : {}),
      ...(raw.search ? { search: raw.search } : {}),
    };
    const result = await courseService.getCourses(query);
    res.status(200).json({ success: true, data: result });
  },
);

export const getCourse = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;
    const course = await courseService.getCourse(id);
    res.status(200).json({ success: true, data: course });
  },
);

export const getChapters = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;
    const chapters = await courseService.getChapters(id);
    res.status(200).json({ success: true, data: chapters });
  },
);

export const markComplete = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = req.user!;
    const id = req.params['id'] as string;
    const result = await courseService.markComplete(user.id, id);
    res.status(200).json({ success: true, data: result });
  },
);

export const unmarkComplete = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = req.user!;
    const id = req.params['id'] as string;
    await courseService.unmarkComplete(user.id, id);
    res.status(200).json({ success: true, data: null });
  },
);

export const purgeCache = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = req.user!;
    const id = req.params['id'] as string;
    await courseService.purgeCache(id, user);
    res.status(200).json({ success: true, data: null });
  },
);
