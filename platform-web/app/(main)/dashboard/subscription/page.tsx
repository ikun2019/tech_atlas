import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionStatusServer } from '@/lib/api/user'
import { SubscriptionCard } from '@/components/features/dashboard/SubscriptionCard'
import { PricingCard } from '@/components/features/dashboard/PricingCard'

export const metadata: Metadata = { title: 'サブスクリプション管理 | TechAtlas' }

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/dashboard/subscription')

  const subscription = await getSubscriptionStatusServer(session.access_token)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">サブスクリプション管理</h1>
        <p className="text-muted-foreground mt-1 text-sm">プランの確認・変更ができます</p>
      </div>
      <SubscriptionCard subscription={subscription} />
      {!subscription.hasSubscription && (
        <>
          <h2 className="text-xl font-semibold">プランを選択</h2>
          <PricingCard currentPlan={subscription.plan} />
        </>
      )}
    </div>
  )
}
