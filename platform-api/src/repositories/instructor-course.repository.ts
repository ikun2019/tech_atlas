import { prisma } from '../lib/prisma.js';
import type { Course, Chapter, Lesson } from '@prisma/client';

export async function findByInstructor(instructorId: string): Promise<Course[]> {
  return prisma.course.findMany({
    where: { instructorId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findByIdForInstructor(
  courseId: string,
  instructorId: string,
  isAdmin = false,
): Promise<(Course & { chapters: (Chapter & { lessons: Lesson[] })[] }) | null> {
  return prisma.course.findFirst({
    where: isAdmin ? { id: courseId } : { id: courseId, instructorId },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
      },
    },
  }) as Promise<(Course & { chapters: (Chapter & { lessons: Lesson[] })[] }) | null>;
}

export async function create(
  instructorId: string,
  data: { title: string; description: string; categoryId: string; thumbnailUrl?: string },
): Promise<Course> {
  return prisma.course.create({
    data: {
      ...data,
      thumbnailUrl: data.thumbnailUrl ?? null,
      instructorId,
      isPublished: false,
    },
  });
}

export async function update(
  courseId: string,
  instructorId: string,
  data: Partial<{ title: string; description: string; categoryId: string; thumbnailUrl: string | null }>,
): Promise<Course | null> {
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return null;
  return prisma.course.update({ where: { id: courseId }, data });
}

export async function hardDelete(courseId: string, instructorId: string): Promise<boolean> {
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return false;
  await prisma.course.delete({ where: { id: courseId } });
  return true;
}

export async function isOwner(courseId: string, instructorId: string): Promise<boolean> {
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId } });
  return course !== null;
}

export async function isOwnerOfChapter(chapterId: string, instructorId: string): Promise<boolean> {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, course: { instructorId } },
  });
  return chapter !== null;
}

export async function addChapter(
  courseId: string,
  data: { title: string; order: number },
): Promise<Chapter> {
  return prisma.chapter.create({ data: { ...data, courseId } });
}

export async function updateChapter(
  chapterId: string,
  instructorId: string,
  data: Partial<{ title: string; order: number }>,
): Promise<Chapter | null> {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, course: { instructorId } },
  });
  if (!chapter) return null;
  return prisma.chapter.update({ where: { id: chapterId }, data });
}

export async function addLesson(
  chapterId: string,
  data: { title: string; notionPageId: string; order: number; isFree: boolean },
): Promise<Lesson> {
  return prisma.lesson.create({ data: { ...data, chapterId } });
}

export async function updateLesson(
  lessonId: string,
  instructorId: string,
  data: Partial<{ title: string; notionPageId: string; order: number; isFree: boolean }>,
): Promise<Lesson | null> {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, chapter: { course: { instructorId } } },
  });
  if (!lesson) return null;
  return prisma.lesson.update({ where: { id: lessonId }, data });
}

export async function deleteChapter(chapterId: string, instructorId: string): Promise<boolean> {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, course: { instructorId } },
  });
  if (!chapter) return false;
  await prisma.chapter.delete({ where: { id: chapterId } });
  return true;
}

export async function hardDeleteLesson(lessonId: string, instructorId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, chapter: { course: { instructorId } } },
  });
  if (!lesson) return false;
  await prisma.lesson.delete({ where: { id: lessonId } });
  return true;
}
