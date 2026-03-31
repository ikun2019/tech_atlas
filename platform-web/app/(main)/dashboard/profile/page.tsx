import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'
import { ProfileForm } from '@/components/features/dashboard/ProfileForm'

export const metadata: Metadata = { title: 'プロフィール編集 | TechAtlas' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/dashboard/profile')

  const user = await getMeServer(session.access_token)
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">プロフィール編集</h1>
        <p className="text-muted-foreground mt-1 text-sm">プロフィール情報を更新できます</p>
      </div>
      <ProfileForm user={user} />
    </div>
  )
}
