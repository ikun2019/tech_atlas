import { prisma } from '../lib/prisma.js';
import type { User, Course, Role } from '@prisma/client';

export async function findAllUsers(
  page: number,
  limit: number,
): Promise<{ items: User[]; total: number }> {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);
  return { items, total };
}

export async function updateUserRole(userId: string, role: Role): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function findAllCourses(
  page: number,
  limit: number,
): Promise<{ items: Course[]; total: number }> {
  const [items, total] = await Promise.all([
    prisma.course.findMany({
      include: { instructor: { select: { id: true, name: true } }, category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.course.count(),
  ]);
  return { items, total };
}

export async function toggleCoursePublish(
  courseId: string,
  isPublished: boolean,
): Promise<Course> {
  return prisma.course.update({ where: { id: courseId }, data: { isPublished } });
}

export async function getStats(): Promise<{
  totalUsers: number;
  activeSubscriptions: number;
  totalCourses: number;
  publishedCourses: number;
  newUsersThisMonth: number;
}> {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, activeSubscriptions, totalCourses, publishedCourses, newUsersThisMonth] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.subscription.count({ where: { status: { in: ['ACTIVE', 'TRIALING'] } } }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: firstOfMonth } } }),
    ]);

  return { totalUsers, activeSubscriptions, totalCourses, publishedCourses, newUsersThisMonth };
}
