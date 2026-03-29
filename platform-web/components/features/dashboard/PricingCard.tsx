'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCheckout } from '@/lib/api/user'

const FEATURES = [
  'すべての有料コースへのアクセス',
  '新着コースの即時受講',
  '進捗管理・修了証',
  'コメント・質問機能',
]

export function PricingCard({ currentPlan }: { currentPlan?: 'MONTHLY' | 'YEARLY' | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'MONTHLY' | 'YEARLY' | null>(null)

  async function handleCheckout(plan: 'MONTHLY' | 'YEARLY') {
    setLoading(plan)
    try {
      const url = await createCheckout(plan)
      router.push(url)
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* 月額プラン */}
      <div className="border-border rounded-xl border p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">月額プラン</h3>
            {currentPlan === 'MONTHLY' && (
              <span className="bg-brand-600 rounded-full px-2 py-0.5 text-xs text-white">現在のプラン</span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold">¥1,980<span className="text-muted-foreground text-sm font-normal">/月</span></p>
        </div>
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="text-brand-600 mt-0.5 size-4 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={currentPlan === 'MONTHLY' ? 'outline' : 'default'}
          onClick={() => handleCheckout('MONTHLY')} disabled={!!loading || currentPlan === 'MONTHLY'}>
          {loading === 'MONTHLY' ? '処理中...' : currentPlan === 'MONTHLY' ? '契約中' : '月額で始める'}
        </Button>
      </div>

      {/* 年額プラン */}
      <div className="border-brand-600 relative rounded-xl border-2 p-6 space-y-4">
        <span className="bg-brand-600 absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs text-white">おすすめ・2ヶ月分お得</span>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">年額プラン</h3>
            {currentPlan === 'YEARLY' && (
              <span className="bg-brand-600 rounded-full px-2 py-0.5 text-xs text-white">現在のプラン</span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold">¥19,800<span className="text-muted-foreground text-sm font-normal">/年</span></p>
          <p className="text-muted-foreground text-xs">月換算 ¥1,650（約17%オフ）</p>
        </div>
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="text-brand-600 mt-0.5 size-4 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={currentPlan === 'YEARLY' ? 'outline' : 'default'}
          onClick={() => handleCheckout('YEARLY')} disabled={!!loading || currentPlan === 'YEARLY'}>
          {loading === 'YEARLY' ? '処理中...' : currentPlan === 'YEARLY' ? '契約中' : '年額で始める'}
        </Button>
      </div>
    </div>
  )
}
