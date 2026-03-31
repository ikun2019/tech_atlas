import { api } from '@/lib/api'
import type { ApiResponse, Course, Chapter, Lesson } from '@/types/api'

const SERVER_API = process.env.API_INTERNAL_URL ?? 'http://api:4000/api/v1'

// サーバー側
export async function getOwnCoursesServer(accessToken: string): Promise<Course[]> {
  const res = await fetch(`${SERVER_API}/instructor/courses`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return []
  const json: ApiResponse<Course[]> = await res.json()
  return json.data
}

export async function getOwnCourseDetailServer(
  accessToken: string,
  courseId: string
): Promise<import('@/types/api').CourseDetail | null> {
  const res = await fetch(`${SERVER_API}/instructor/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (res.status === 404) return null
  if (!res.ok) return null
  const json: import('@/types/api').ApiResponse<import('@/types/api').CourseDetail> =
    await res.json()
  return json.data
}

// クライアント側
export async function createCourse(data: {
  title: string
  description: string
  categoryId: string
  thumbnailUrl?: string
}): Promise<Course> {
  const res = await api.post('instructor/courses', { json: data })
  const json: ApiResponse<Course> = await res.json()
  return json.data
}

export async function updateCourse(
  courseId: string,
  data: { title?: string; description?: string; categoryId?: string; thumbnailUrl?: string }
): Promise<Course> {
  const res = await api.put(`instructor/courses/${courseId}`, { json: data })
  const json: ApiResponse<Course> = await res.json()
  return json.data
}

export async function deleteCourse(courseId: string): Promise<void> {
  await api.delete(`instructor/courses/${courseId}`)
}

export async function addChapter(
  courseId: string,
  data: { title: string; order: number }
): Promise<Chapter> {
  const res = await api.post(`instructor/courses/${courseId}/chapters`, { json: data })
  const json: ApiResponse<Chapter> = await res.json()
  return json.data
}

export async function updateChapter(
  chapterId: string,
  data: { title?: string; order?: number }
): Promise<Chapter> {
  const res = await api.put(`instructor/chapters/${chapterId}`, { json: data })
  const json: ApiResponse<Chapter> = await res.json()
  return json.data
}

export async function addLesson(
  chapterId: string,
  data: { title: string; notionPageId: string; order: number; isFree: boolean }
): Promise<Lesson> {
  const res = await api.post(`instructor/chapters/${chapterId}/lessons`, { json: data })
  const json: ApiResponse<Lesson> = await res.json()
  return json.data
}

export async function updateLesson(
  lessonId: string,
  data: { title?: string; notionPageId?: string; order?: number; isFree?: boolean }
): Promise<Lesson> {
  const res = await api.put(`instructor/lessons/${lessonId}`, { json: data })
  const json: ApiResponse<Lesson> = await res.json()
  return json.data
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await api.delete(`instructor/chapters/${chapterId}`)
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await api.delete(`instructor/lessons/${lessonId}`)
}

// クライアント側: Notion OAuth URL を取得してリダイレクト
export async function getNotionOAuthUrl(): Promise<string> {
  const res = await api.get('instructor/notion/oauth/url')
  const json: ApiResponse<{ url: string }> = await res.json()
  return json.data.url
}

// サーバー側（OAuth コールバックページから呼ぶ）
export async function notionOAuthCallbackServer(
  code: string,
  state: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${SERVER_API}/instructor/notion/oauth/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ code, state }),
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(body?.error?.message ?? 'Notion OAuth callback failed')
  }
}

export async function disconnectNotion(): Promise<void> {
  await api.delete('instructor/notion/token')
}
