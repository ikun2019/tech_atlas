import { api } from '@/lib/api'
import type { ApiResponse, User } from '@/types/api'
import { env } from '@/lib/env'

export interface ProgressSummary {
  courseId: string
  courseTitle: string
  courseThumbnailUrl: string | null
  completedCount: number
  totalLessons: number
  progressPercent: number
  lastLessonId: string | null
  lastChapterId: string | null
}

export interface SubscriptionStatus {
  hasSubscription: boolean
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'TRIALING' | null
  plan: 'MONTHLY' | 'YEARLY' | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

const SERVER_API = env.API_INTERNAL_URL

export async function getMeServer(accessToken: string): Promise<User | null> {
  const res = await fetch(`${SERVER_API}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return null
  const json: ApiResponse<User> = await res.json()
  return json.data
}

export async function getProgressServer(accessToken: string): Promise<ProgressSummary[]> {
  const res = await fetch(`${SERVER_API}/progress`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return []
  const json: ApiResponse<ProgressSummary[]> = await res.json()
  return json.data
}

export async function getSubscriptionStatusServer(accessToken: string): Promise<SubscriptionStatus> {
  const res = await fetch(`${SERVER_API}/subscriptions/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return { hasSubscription: false, status: null, plan: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }
  const json: ApiResponse<SubscriptionStatus> = await res.json()
  return json.data
}

// クライアント側
export async function updateProfile(data: { name?: string; avatarUrl?: string }): Promise<User> {
  const res = await api.patch('auth/me', { json: data })
  const json: ApiResponse<User> = await res.json()
  return json.data
}

export async function createCheckout(plan: 'MONTHLY' | 'YEARLY'): Promise<string> {
  const res = await api.post('subscriptions/checkout', { json: { plan } })
  const json: ApiResponse<{ url: string }> = await res.json()
  return json.data.url
}

export async function createPortal(): Promise<string> {
  const res = await api.post('subscriptions/portal')
  const json: ApiResponse<{ url: string }> = await res.json()
  return json.data.url
}
