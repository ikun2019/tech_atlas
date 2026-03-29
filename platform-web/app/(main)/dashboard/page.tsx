import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProgressServer, getSubscriptionStatusServer } from '@/lib/api/user'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'ダッシュボード | TechAtlas' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/dashboard')

  const [progressListRaw, subscription] = await Promise.all([
    getProgressServer(session.access_token),
    getSubscriptionStatusServer(session.access_token),
  ])

  const progressList = Array.isArray(progressListRaw)
    ? progressListRaw
    : (progressListRaw as any)?.data && Array.isArray((progressListRaw as any).data)
      ? (progressListRaw as any).data
      : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">学習の進捗を確認しましょう</p>
      </div>

      {/* サブスクリプション状態 */}
      <div className="border-border rounded-xl border p-4">
        <h2 className="font-semibold">Subscription</h2>
        {subscription.hasSubscription ? (
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  subscription.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {subscription.status}
              </span>
              <p className="text-muted-foreground mt-1 text-sm">
                プラン: {subscription.plan === 'MONTHLY' ? '月額' : '年額'}
                {subscription.currentPeriodEnd &&
                  ` · 次回更新: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')}`}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/subscription">管理する</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">サブスクリプション未登録</p>
            <Button size="sm" asChild>
              <Link href="/dashboard/subscription">プランを見る</Link>
            </Button>
          </div>
        )}
      </div>

      {/* 受講中コース */}
      <div>
        <h2 className="mb-4 font-semibold">受講中のコース</h2>
        {progressList.length === 0 ? (
          <div className="border-border rounded-xl border p-8 text-center">
            <p className="text-muted-foreground text-sm">受講中のコースはありません</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/">コースを探す</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {progressList.map((p: any) => (
              <div key={p.courseId} className="border-border rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium">{p.courseTitle}</p>
                    <div className="space-y-1">
                      <div className="text-muted-foreground flex justify-between text-xs">
                        <span>進捗</span>
                        <span>
                          {p.completedCount} / {p.totalLessons}
                        </span>
                      </div>
                      <Progress value={p.progressPercent} className="h-2" />
                    </div>
                  </div>
                  {p.lastLessonId && p.lastChapterId && (
                    <Button size="sm" asChild>
                      <Link
                        href={`/courses/${p.courseId}/chapters/${p.lastChapterId}/lessons/${p.lastLessonId}`}
                      >
                        続ける
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
