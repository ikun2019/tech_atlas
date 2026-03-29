import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as adminService from '../services/admin.service.js';
import type { Role } from '@prisma/client';

const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

const RoleUpdateSchema = z.object({
	role: z.enum(['USER', 'INSTRUCTOR', 'ADMIN']),
});

const PublishToggleSchema = z.object({
	isPublished: z.boolean(),
});

export const listUsers = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const { page, limit } = PaginationSchema.parse(req.query);
		const result = await adminService.listUsers(page, limit);
		res.status(200).json({ success: true, data: result });
	},
);

export const changeRole = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const userId = req.params['userId'] as string;
		const { role } = RoleUpdateSchema.parse(req.body);
		const updated = await adminService.changeUserRole(userId, role as Role, req.user!.id);
		res.status(200).json({ success: true, data: updated });
	},
);

export const listCourses = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const { page, limit } = PaginationSchema.parse(req.query);
		const result = await adminService.listCourses(page, limit);
		res.status(200).json({ success: true, data: result });
	},
);

export const publishCourse = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const courseId = req.params['courseId'] as string;
		const { isPublished } = PublishToggleSchema.parse(req.body);
		const course = await adminService.publishCourse(courseId, isPublished);
		res.status(200).json({ success: true, data: course });
	},
);

export const getStats = asyncHandler(
	async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const stats = await adminService.getStats();
		res.status(200).json({ success: true, data: stats });
	},
);
