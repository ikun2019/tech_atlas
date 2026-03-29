import { api } from '@/lib/api'
import type { ApiResponse, User, Course, PaginatedResponse } from '@/types/api'
import type { Role } from '@/types/api'
import { env } from '@/lib/env'

const SERVER_API = env.API_INTERNAL_URL

export interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  totalCourses: number
  publishedCourses: number
  newUsersThisMonth: number
}

export async function getStatsServer(accessToken: string): Promise<AdminStats> {
  const res = await fetch(`${SERVER_API}/admin/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok)
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      totalCourses: 0,
      publishedCourses: 0,
      newUsersThisMonth: 0,
    }
  const json: ApiResponse<AdminStats> = await res.json()
  return json.data
}

export async function getUsersServer(
  accessToken: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<User>> {
  const res = await fetch(`${SERVER_API}/admin/users?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) return { items: [], total: 0, page: 1, limit, totalPages: 0 }
  const json: ApiResponse<PaginatedResponse<User>> = await res.json()
  return json.data
}

export async function getAdminCoursesServer(
  accessToken: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Course>> {
  const res = await fetch(`${SERVER_API}/admin/courses?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) return { items: [], total: 0, page: 1, limit, totalPages: 0 }
  const json: ApiResponse<PaginatedResponse<Course>> = await res.json()
  return json.data
}

// クライアント側
export async function updateUserRole(userId: string, role: Role): Promise<void> {
  await api.patch(`admin/users/${userId}/role`, { json: { role } })
}

export async function toggleCoursePublish(courseId: string, isPublished: boolean): Promise<void> {
  await api.put(`admin/courses/${courseId}/publish`, { json: { isPublished } })
}
