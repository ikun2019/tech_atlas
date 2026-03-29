import type { ApiResponse, Category, Course, CourseDetail, PaginatedResponse } from '@/types/api'
import { env } from '@/lib/env'

// Server Components (Node) should use an internal URL (e.g. http://api:4000/api/v1 in Docker).
const API_URL = env.API_INTERNAL_URL

export async function getCourses(params?: {
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}): Promise<PaginatedResponse<Course>> {
  const searchParams = new URLSearchParams()
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit ?? 12))

  const query = searchParams.toString()
  const res = await fetch(`${API_URL}/courses${query ? `?${query}` : ''}`, {
    next: { revalidate: 60, tags: ['courses'] },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Failed to fetch courses: ${res.status} ${res.statusText} url=${API_URL}/courses${query ? `?${query}` : ''} body=${body.slice(0, 500)}`
    )
  }
  const json: ApiResponse<PaginatedResponse<Course>> = await res.json()
  return json.data
}

export async function getCourse(courseId: string): Promise<CourseDetail | null> {
  const res = await fetch(`${API_URL}/courses/${courseId}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch course')
  const json: ApiResponse<CourseDetail> = await res.json()
  return json.data
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, {
    next: { revalidate: 3600, tags: ['categories'] },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return []
  const json: ApiResponse<Category[]> = await res.json()
  return json.data
}
