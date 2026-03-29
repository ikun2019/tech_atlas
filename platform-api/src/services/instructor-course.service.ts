import * as repo from '../repositories/instructor-course.repository.js';
import type { Course, Chapter, Lesson } from '@prisma/client';

function notFound(msg: string, code = 'NOT_FOUND'): never {
  throw Object.assign(new Error(msg), { code, statusCode: 404 });
}
function forbidden(msg: string): never {
  throw Object.assign(new Error(msg), { code: 'FORBIDDEN', statusCode: 403 });
}

export async function getOwnCourses(instructorId: string): Promise<Course[]> {
  return repo.findByInstructor(instructorId);
}

export async function getCourseDetail(
  instructorId: string,
  courseId: string,
  isAdmin = false,
): Promise<(Course & { chapters: (Chapter & { lessons: Lesson[] })[] }) | null> {
  return repo.findByIdForInstructor(courseId, instructorId, isAdmin);
}

export async function createCourse(
  instructorId: string,
  data: { title: string; description: string; categoryId: string; thumbnailUrl?: string },
): Promise<Course> {
  return repo.create(instructorId, data);
}

export async function updateCourse(
  instructorId: string,
  courseId: string,
  data: Partial<{ title: string; description: string; categoryId: string; thumbnailUrl: string | null }>,
): Promise<Course> {
  const result = await repo.update(courseId, instructorId, data);
  if (!result) forbidden('この講座を編集する権限がありません');
  return result;
}

export async function deleteCourse(instructorId: string, courseId: string): Promise<void> {
  const ok = await repo.hardDelete(courseId, instructorId);
  if (!ok) forbidden('この講座を削除する権限がありません');
}

export async function addChapter(
  instructorId: string,
  courseId: string,
  data: { title: string; order: number },
): Promise<Chapter> {
  const owns = await repo.isOwner(courseId, instructorId);
  if (!owns) forbidden('この講座を編集する権限がありません');
  return repo.addChapter(courseId, data);
}

export async function updateChapter(
  instructorId: string,
  chapterId: string,
  data: Partial<{ title: string; order: number }>,
): Promise<Chapter> {
  const result = await repo.updateChapter(chapterId, instructorId, data);
  if (!result) forbidden('このチャプターを編集する権限がありません');
  return result;
}

export async function addLesson(
  instructorId: string,
  chapterId: string,
  data: { title: string; notionPageId: string; order: number; isFree: boolean },
): Promise<Lesson> {
  const owns = await repo.isOwnerOfChapter(chapterId, instructorId);
  if (!owns) forbidden('このチャプターを編集する権限がありません');
  return repo.addLesson(chapterId, data);
}

export async function updateLesson(
  instructorId: string,
  lessonId: string,
  data: Partial<{ title: string; notionPageId: string; order: number; isFree: boolean }>,
): Promise<Lesson> {
  const result = await repo.updateLesson(lessonId, instructorId, data);
  if (!result) forbidden('このレッスンを編集する権限がありません');
  return result;
}

export async function deleteChapter(instructorId: string, chapterId: string): Promise<void> {
  const ok = await repo.deleteChapter(chapterId, instructorId);
  if (!ok) forbidden('このチャプターを削除する権限がありません');
}

export async function deleteLesson(instructorId: string, lessonId: string): Promise<void> {
  const ok = await repo.hardDeleteLesson(lessonId, instructorId);
  if (!ok) forbidden('このレッスンを削除する権限がありません');
}
