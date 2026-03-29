import * as adminRepository from '../repositories/admin.repository.js';
import type { User, Course, Role } from '@prisma/client';

export async function listUsers(
  page: number,
  limit: number,
): Promise<{ items: User[]; total: number; totalPages: number }> {
  const { items, total } = await adminRepository.findAllUsers(page, limit);
  return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function changeUserRole(
  userId: string,
  role: Role,
  requestingUserId: string,
): Promise<User> {
  if (userId === requestingUserId) {
    throw Object.assign(new Error('自分自身のロールは変更できません'), {
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  }
  return adminRepository.updateUserRole(userId, role);
}

export async function listCourses(
  page: number,
  limit: number,
): Promise<{ items: Course[]; total: number; totalPages: number }> {
  const { items, total } = await adminRepository.findAllCourses(page, limit);
  return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function publishCourse(courseId: string, isPublished: boolean): Promise<Course> {
  return adminRepository.toggleCoursePublish(courseId, isPublished);
}

export async function getStats(): Promise<{
  totalUsers: number;
  activeSubscriptions: number;
  totalCourses: number;
  publishedCourses: number;
  newUsersThisMonth: number;
}> {
  return adminRepository.getStats();
}
