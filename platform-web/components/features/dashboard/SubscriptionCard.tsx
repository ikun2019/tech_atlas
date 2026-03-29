'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createPortal } from '@/lib/api/user'
import type { SubscriptionStatus } from '@/lib/api/user'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'アクティブ',
  TRIALING: 'トライアル中',
  CANCELED: 'キャンセル済み',
  PAST_DUE: '支払い遅延',
  INCOMPLETE: '未完了',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  TRIALING: 'bg-blue-100 text-blue-700',
  CANCELED: 'bg-gray-100 text-gray-600',
  PAST_DUE: 'bg-red-100 text-red-700',
  INCOMPLETE: 'bg-yellow-100 text-yellow-700',
}

export function SubscriptionCard({ subscription }: { subscription: SubscriptionStatus }) {
  const [loading, setLoading] = useState(false)

  async function handlePortal() {
    setLoading(true)
    try {
      const url = await createPortal()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  if (!subscription.hasSubscription) {
    return (
      <div className="border-border rounded-xl border p-6 text-center space-y-3">
        <p className="font-medium">サブスクリプション未登録</p>
        <p className="text-muted-foreground text-sm">プランに登録してすべてのコンテンツにアクセスしましょう</p>
        <Button asChild><Link href="/dashboard/subscription">プランを見る</Link></Button>
      </div>
    )
  }

  return (
    <div className="border-border rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">現在のプラン</h3>
        {subscription.status && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[subscription.status] ?? ''}`}>
            {STATUS_LABELS[subscription.status] ?? subscription.status}
          </span>
        )}
      </div>
      <div className="text-muted-foreground space-y-1 text-sm">
        <p>プラン: {subscription.plan === 'MONTHLY' ? '月額 ¥1,980' : '年額 ¥19,800'}</p>
        {subscription.currentPeriodEnd && (
          <p>
            {subscription.cancelAtPeriodEnd ? '解約予定日' : '次回更新日'}:{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')}
          </p>
        )}
        {subscription.cancelAtPeriodEnd && (
          <p className="text-yellow-600 dark:text-yellow-400">期間終了後に解約されます</p>
        )}
      </div>
      <Button variant="outline" onClick={handlePortal} disabled={loading}>
        {loading ? '処理中...' : 'プランを管理する'}
      </Button>
    </div>
  )
}
