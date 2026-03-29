import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Users, CreditCard, BookOpen, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'
import { getStatsServer } from '@/lib/api/admin'
import { StatsCard } from '@/components/features/admin/StatsCard'

export const metadata: Metadata = { title: '管理者ダッシュボード | TechAtlas' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/admin')

  const me = await getMeServer(session.access_token)
  if (!me || me.role !== 'ADMIN') redirect('/dashboard')

  const stats = await getStatsServer(session.access_token)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">KPI 統計</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="総ユーザー数" value={stats?.totalUsers ?? 0} icon={Users} />
        <StatsCard title="アクティブサブスク" value={stats?.activeSubscriptions ?? 0} icon={CreditCard} />
        <StatsCard
          title="総コース数"
          value={stats?.totalCourses ?? 0}
          icon={BookOpen}
          description={`公開中 ${stats?.publishedCourses ?? 0} 件`}
        />
        <StatsCard title="当月新規登録" value={stats?.newUsersThisMonth ?? 0} icon={TrendingUp} />
      </div>
    </div>
  )
}
