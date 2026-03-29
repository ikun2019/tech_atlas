import { redis } from '../lib/redis.js';
import { createNotionClient, getPageMarkdown } from '../lib/notion.js';
import { decryptToken } from '../lib/crypto.js';
import * as courseRepository from '../repositories/course.repository.js';
import * as instructorTokenRepository from '../repositories/instructor-token.repository.js';
import { checkLessonAccess } from './course.service.js';
import type { User } from '@prisma/client';

const LESSON_CACHE_TTL = 3600;

export interface LessonContentResult {
	lesson: {
		id: string;
		title: string;
		notionPageId: string;
		order: number;
		isFree: boolean;
		chapterId: string;
		createdAt: Date;
		updatedAt: Date;
	};
	content: string;
}

export async function getLessonContent(
	lessonId: string,
	user?: User,
): Promise<LessonContentResult> {
	// 1. DB からレッスン取得
	const lesson = await courseRepository.findLessonById(lessonId);
	if (!lesson) {
		throw Object.assign(new Error('レッスンが見つかりません'), {
			code: 'LESSON_NOT_FOUND',
			statusCode: 404,
		});
	}

	// 2. アクセス権チェック
	await checkLessonAccess(lesson, user);

	// 3. Redis キャッシュ確認（Redis が利用不能でもフォールバックして続行）
	const cacheKey = `lesson:${lessonId}`;
	let cached: string | null = null;
	try {
		cached = await redis.get(cacheKey);
	} catch {
		// Redis unavailable — skip cache, fetch from Notion directly
	}
	if (cached !== null) {
		return {
			lesson: {
				id: lesson.id,
				title: lesson.title,
				notionPageId: lesson.notionPageId,
				order: lesson.order,
				isFree: lesson.isFree,
				chapterId: lesson.chapterId,
				createdAt: lesson.createdAt,
				updatedAt: lesson.updatedAt,
			},
			content: cached,
		};
	}

	// 4. インストラクタートークン取得
	const instructorId = lesson.chapter.course.instructorId;
	const tokenRecord = await instructorTokenRepository.findByInstructorId(instructorId);
	console.log('tokenRecord =>', tokenRecord);
	if (!tokenRecord) {
		throw Object.assign(new Error('講師の Notion トークンが設定されていません'), {
			code: 'NOTION_TOKEN_NOT_FOUND',
			statusCode: 500,
		});
	}

	// 5. トークン復号 → Notion API でコンテンツ取得
	const plainToken = decryptToken(tokenRecord.encryptedToken);
	const notionClient = createNotionClient(plainToken);
	const content = await getPageMarkdown(notionClient, lesson.notionPageId);

	// 6. Redis にキャッシュ保存（利用不能でもエラーにしない）
	try {
		await redis.setex(cacheKey, LESSON_CACHE_TTL, content);
	} catch {
		// Redis unavailable — continue without caching
	}

	return {
		lesson: {
			id: lesson.id,
			title: lesson.title,
			notionPageId: lesson.notionPageId,
			order: lesson.order,
			isFree: lesson.isFree,
			chapterId: lesson.chapterId,
			createdAt: lesson.createdAt,
			updatedAt: lesson.updatedAt,
		},
		content,
	};
}

export async function purgeCache(lessonId: string): Promise<void> {
	await redis.del(`lesson:${lessonId}`);
}
