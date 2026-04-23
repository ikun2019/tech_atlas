import crypto from 'crypto';
import { redis } from '../lib/redis.js';
import * as courseRepository from '../repositories/course.repository.js';
import * as progressRepository from '../repositories/progress.repository.js';
import { hasActiveSubscription, getActiveSubscriptionType } from './subscription.service.js';
import type { User } from '@prisma/client';
import type { LessonWithCourseInstructor } from '../repositories/course.repository.js';

const COURSES_LIST_TTL = 300;
const COURSE_TTL = 1800;

function makeCourseListCacheKey(query: object): string {
	const hash = crypto.createHash('md5').update(JSON.stringify(query)).digest('hex');
	return `courses:list:${hash}`;
}

export async function getCourses(query: {
	page: number;
	limit: number;
	categoryId?: string;
	search?: string;
}): Promise<{ items: unknown[]; total: number }> {
	const cacheKey = makeCourseListCacheKey(query);
	const cached = await redis.get(cacheKey);
	if (cached !== null) {
		return JSON.parse(cached) as { items: unknown[]; total: number };
	}

	const result = await courseRepository.findMany(query);
	await redis.setex(cacheKey, COURSES_LIST_TTL, JSON.stringify(result));
	return result;
}

export async function getCourse(courseId: string): Promise<unknown> {
	const cacheKey = `course:${courseId}`;
	const cached = await redis.get(cacheKey);
	if (cached !== null) {
		return JSON.parse(cached) as unknown;
	}

	const course = await courseRepository.findById(courseId);
	if (!course) {
		throw Object.assign(new Error('講座が見つかりません'), {
			code: 'COURSE_NOT_FOUND',
			statusCode: 404,
		});
	}

	await redis.setex(cacheKey, COURSE_TTL, JSON.stringify(course));
	return course;
}

export async function getChapters(courseId: string): Promise<unknown[]> {
	const chapters = await courseRepository.findChapters(courseId);
	return chapters;
}

export async function checkLessonAccess(
	lesson: LessonWithCourseInstructor,
	user?: User,
): Promise<void> {
	if (lesson.isFree) return;

	if (!user) {
		throw Object.assign(new Error('このレッスンの閲覧にはログインが必要です'), {
			code: 'FORBIDDEN',
			statusCode: 403,
		});
	}

	if (user.role === 'ADMIN') return;
	if (user.role === 'INSTRUCTOR' && lesson.chapter.course.instructorId === user.id) return;

	const active = await hasActiveSubscription(user.id);
	if (!active) {
		throw Object.assign(new Error('このレッスンの閲覧にはサブスクリプションが必要です'), {
			code: 'SUBSCRIPTION_REQUIRED',
			statusCode: 403,
		});
	}

	// INSTRUCTOR サブスクの場合、そのインストラクターのコースのみアクセス可能
	const sub = await getActiveSubscriptionType(user.id);
	if (sub?.type === 'INSTRUCTOR' && sub.instructorId !== lesson.chapter.course.instructorId) {
		throw Object.assign(new Error('このレッスンの閲覧にはサブスクリプションが必要です'), {
			code: 'SUBSCRIPTION_REQUIRED',
			statusCode: 403,
		});
	}
}

export async function markComplete(
	userId: string,
	lessonId: string,
): Promise<{ lessonId: string; completedAt: Date }> {
	const existing = await progressRepository.findByUserAndLesson(userId, lessonId);
	if (existing) {
		return { lessonId: existing.lessonId, completedAt: existing.completedAt };
	}

	try {
		const progress = await progressRepository.create(userId, lessonId);
		return { lessonId: progress.lessonId, completedAt: progress.completedAt };
	} catch (err) {
		// Prisma unique constraint violation (P2002) - 冪等性対応
		if (
			err !== null &&
			typeof err === 'object' &&
			'code' in err &&
			(err as { code: string }).code === 'P2002'
		) {
			const existing2 = await progressRepository.findByUserAndLesson(userId, lessonId);
			if (existing2) {
				return { lessonId: existing2.lessonId, completedAt: existing2.completedAt };
			}
		}
		throw err;
	}
}

export async function unmarkComplete(userId: string, lessonId: string): Promise<void> {
	const existing = await progressRepository.findByUserAndLesson(userId, lessonId);
	if (!existing) {
		throw Object.assign(new Error('進捗が見つかりません'), {
			code: 'PROGRESS_NOT_FOUND',
			statusCode: 404,
		});
	}
	await progressRepository.deleteProgress(userId, lessonId);
}

export async function purgeCache(lessonId: string, requestingUser: User): Promise<void> {
	if (requestingUser.role === 'ADMIN') {
		await redis.del(`lesson:${lessonId}`);
		return;
	}

	if (requestingUser.role === 'INSTRUCTOR') {
		const lesson = await courseRepository.findLessonById(lessonId);
		if (!lesson) {
			throw Object.assign(new Error('レッスンが見つかりません'), {
				code: 'LESSON_NOT_FOUND',
				statusCode: 404,
			});
		}
		if (lesson.chapter.course.instructorId !== requestingUser.id) {
			throw Object.assign(new Error('このレッスンのキャッシュを削除する権限がありません'), {
				code: 'FORBIDDEN',
				statusCode: 403,
			});
		}
		await redis.del(`lesson:${lessonId}`);
		return;
	}

	throw Object.assign(new Error('このリソースへのアクセス権限がありません'), {
		code: 'FORBIDDEN',
		statusCode: 403,
	});
}
