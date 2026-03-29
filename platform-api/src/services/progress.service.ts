import { prisma } from '../lib/prisma.js';
import * as progressRepository from '../repositories/progress.repository.js';

export async function getUserProgress(userId: string): Promise<{
  completedCount: number;
  completedLessonIds: string[];
}> {
  const progresses = await progressRepository.findByUser(userId);
  return {
    completedCount: progresses.length,
    completedLessonIds: progresses.map((p) => p.lessonId),
  };
}

export async function getCourseProgress(
  userId: string,
  courseId: string,
): Promise<{
  completedCount: number;
  totalCount: number;
  percentage: number;
  completedLessonIds: string[];
}> {
  const totalCount = await prisma.lesson.count({
    where: {
      chapter: { courseId },
    },
  });

  const { completedCount, completedLessonIds } = await progressRepository.findByCourse(
    userId,
    courseId,
  );

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return { completedCount, totalCount, percentage, completedLessonIds };
}
