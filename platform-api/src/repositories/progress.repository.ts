import { prisma } from '../lib/prisma.js';
import type { Progress } from '@prisma/client';

export async function findByUserAndLesson(
  userId: string,
  lessonId: string,
): Promise<Progress | null> {
  return prisma.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
}

export async function create(userId: string, lessonId: string): Promise<Progress> {
  return prisma.progress.create({ data: { userId, lessonId } });
}

export async function deleteProgress(userId: string, lessonId: string): Promise<Progress> {
  return prisma.progress.delete({
    where: { userId_lessonId: { userId, lessonId } },
  });
}

export async function findByUser(userId: string): Promise<Progress[]> {
  return prisma.progress.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
  });
}

export async function findByCourse(
  userId: string,
  courseId: string,
): Promise<{ completedCount: number; completedLessonIds: string[] }> {
  const progresses = await prisma.progress.findMany({
    where: {
      userId,
      lesson: {
        chapter: { courseId },
      },
    },
    select: { lessonId: true },
  });

  return {
    completedCount: progresses.length,
    completedLessonIds: progresses.map((p) => p.lessonId),
  };
}
