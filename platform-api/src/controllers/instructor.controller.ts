import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as instructorCourseService from '../services/instructor-course.service.js';
import * as instructorNotionService from '../services/instructor-notion.service.js';

const CourseCreateSchema = z.object({
	title: z.string().min(1, 'タイトルは必須です'),
	description: z.string().optional().default(''),
	categoryId: z.string().min(1, 'カテゴリは必須です'),
	thumbnailUrl: z.string().url().optional(),
});

const CourseUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	categoryId: z.string().optional(),
	thumbnailUrl: z.string().url().nullable().optional(),
});

const ChapterCreateSchema = z.object({
	title: z.string().min(1, 'タイトルは必須です'),
	order: z.number().int().min(1),
});

const ChapterUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	order: z.number().int().min(1).optional(),
});

const LessonCreateSchema = z.object({
	title: z.string().min(1, 'タイトルは必須です'),
	notionPageId: z.string().min(1, 'Notion ページ ID は必須です'),
	order: z.number().int().min(1),
	isFree: z.boolean(),
});

const LessonUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	notionPageId: z.string().optional(),
	order: z.number().int().min(1).optional(),
	isFree: z.boolean().optional(),
});

const NotionOAuthCallbackSchema = z.object({
	code: z.string().min(1),
	state: z.string().min(1),
});

export const getCourseDetail = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const courseId = req.params['courseId'] as string;
		const isAdmin = req.user!.role === 'ADMIN';
		const course = await instructorCourseService.getCourseDetail(req.user!.id, courseId, isAdmin);
		if (!course) {
			const err = Object.assign(new Error('講座が見つかりません'), {
				code: 'COURSE_NOT_FOUND',
				statusCode: 404,
			});
			throw err;
		}
		res.status(200).json({ success: true, data: course });
	},
);

export const listCourses = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const courses = await instructorCourseService.getOwnCourses(req.user!.id);
		res.status(200).json({ success: true, data: courses });
	},
);

export const createCourse = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const body = CourseCreateSchema.parse(req.body);
		const data = {
			title: body.title,
			description: body.description ?? '',
			categoryId: body.categoryId,
			...(body.thumbnailUrl ? { thumbnailUrl: body.thumbnailUrl } : {}),
		};
		const course = await instructorCourseService.createCourse(req.user!.id, data);
		res.status(201).json({ success: true, data: course });
	},
);

export const updateCourse = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const body = CourseUpdateSchema.parse(req.body);
		const courseId = req.params['courseId'] as string;
		const data: Record<string, string | null | undefined> = {};
		if (body.title !== undefined) data['title'] = body.title;
		if (body.description !== undefined) data['description'] = body.description;
		if (body.categoryId !== undefined) data['categoryId'] = body.categoryId;
		if ('thumbnailUrl' in body) data['thumbnailUrl'] = body.thumbnailUrl ?? null;
		const course = await instructorCourseService.updateCourse(req.user!.id, courseId, data);
		res.status(200).json({ success: true, data: course });
	},
);

export const deleteCourse = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const courseId = req.params['courseId'] as string;
		await instructorCourseService.deleteCourse(req.user!.id, courseId);
		res.status(200).json({ success: true, data: null });
	},
);

export const addChapter = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const body = ChapterCreateSchema.parse(req.body);
		const courseId = req.params['courseId'] as string;
		const chapter = await instructorCourseService.addChapter(req.user!.id, courseId, body);
		res.status(201).json({ success: true, data: chapter });
	},
);

export const updateChapter = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const body = ChapterUpdateSchema.parse(req.body);
		const chapterId = req.params['chapterId'] as string;
		const data: { title?: string; order?: number } = {};
		if (body.title !== undefined) data.title = body.title;
		if (body.order !== undefined) data.order = body.order;
		const chapter = await instructorCourseService.updateChapter(req.user!.id, chapterId, data);
		res.status(200).json({ success: true, data: chapter });
	},
);

export const addLesson = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const body = LessonCreateSchema.parse(req.body);
		const chapterId = req.params['chapterId'] as string;
		const lesson = await instructorCourseService.addLesson(req.user!.id, chapterId, body);
		res.status(201).json({ success: true, data: lesson });
	},
);

export const updateLesson = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const body = LessonUpdateSchema.parse(req.body);
		const lessonId = req.params['lessonId'] as string;
		const data: { title?: string; notionPageId?: string; order?: number; isFree?: boolean } = {};
		if (body.title !== undefined) data.title = body.title;
		if (body.notionPageId !== undefined) data.notionPageId = body.notionPageId;
		if (body.order !== undefined) data.order = body.order;
		if (body.isFree !== undefined) data.isFree = body.isFree;
		const lesson = await instructorCourseService.updateLesson(req.user!.id, lessonId, data);
		res.status(200).json({ success: true, data: lesson });
	},
);

export const deleteChapter = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const chapterId = req.params['chapterId'] as string;
		await instructorCourseService.deleteChapter(req.user!.id, chapterId);
		res.status(200).json({ success: true, data: null });
	},
);

export const deleteLesson = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const lessonId = req.params['lessonId'] as string;
		await instructorCourseService.deleteLesson(req.user!.id, lessonId);
		res.status(200).json({ success: true, data: null });
	},
);

export const getNotionOAuthUrl = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const url = instructorNotionService.getOAuthUrl(req.user!.id);
		res.status(200).json({ success: true, data: { url } });
	},
);

export const notionOAuthCallback = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const { code, state } = NotionOAuthCallbackSchema.parse(req.body);
		await instructorNotionService.exchangeOAuthCode(code, state, req.user!.id);
		res.status(200).json({ success: true, data: null });
	},
);

export const disconnectNotion = asyncHandler(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		await instructorNotionService.disconnectNotion(req.user!.id);
		res.status(200).json({ success: true, data: null });
	},
);
