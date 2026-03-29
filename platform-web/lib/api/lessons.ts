import type { ApiResponse } from '@/types/api'
import { api } from '@/lib/api'
import { env } from '@/lib/env'

export interface LessonDetail {
  id: string
  title: string
  notionPageId: string
  order: number
  isFree: boolean
  chapterId: string
  content: string // Markdown コンテンツ
  createdAt: string
  updatedAt: string
}

export interface ProgressData {
  courseId: string
  completedLessonIds: string[]
  totalLessons: number
  completedCount: number
  progressPercent: number
}

// 認証付き API 呼び出し（クライアント側 ky）
export async function completeLesson(lessonId: string): Promise<void> {
  await api.post(`lessons/${lessonId}/complete`)
}

export async function uncompleteLesson(lessonId: string): Promise<void> {
  await api.delete(`lessons/${lessonId}/complete`)
}

export async function getProgress(courseId: string): Promise<ProgressData> {
  const res = await api.get(`progress/courses/${courseId}`)
  const json: ApiResponse<ProgressData> = await res.json()
  return json.data
}

// サーバー側フェッチ（Server Component 用）
const SERVER_API = env.API_INTERNAL_URL

export async function getLessonServer(
  lessonId: string,
  accessToken?: string
): Promise<LessonDetail | null> {
  const headers: Record<string, string> = {}
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${SERVER_API}/lessons/${lessonId}`, {
    headers,
    // 認証付きリクエストはユーザー固有のコンテンツのためキャッシュしない
    // 未認証（無料レッスンプレビュー等）は短時間キャッシュ可
    ...(accessToken ? { cache: 'no-store' } : { next: { revalidate: 60 } }),
    signal: AbortSignal.timeout(20000),
  })

  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Failed to fetch lessons: ${res.status} ${res.statusText} /api/lessons body=${body}`
    )
  }
  const json: ApiResponse<LessonDetail> = await res.json()
  return json.data
}
