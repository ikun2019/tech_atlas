import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'
import { NotionTokenForm } from '@/components/features/instructor/NotionTokenForm'
import { NotionOAuthResult } from '@/components/features/instructor/NotionOAuthResult'

export const metadata: Metadata = { title: 'Notion 連携設定 | TechAtlas' }

interface PageProps {
  searchParams: Promise<{ notion?: string }>
}

export default async function InstructorSettingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/instructor/settings')

  const user = await getMeServer(session.access_token)
  if (!user) redirect('/login?next=/instructor/settings')
  if (!['INSTRUCTOR', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const hasNotionToken = !!user.instructorToken
  const workspaceName = user.instructorToken?.workspaceName
  const { notion } = await searchParams

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notion 連携設定</h1>
        <p className="text-muted-foreground mt-1 text-sm">Notion ワークスペースと連携してレッスンコンテンツを配信します</p>
      </div>
      {/* OAuth 結果トースト（Client Component） */}
      {notion && <NotionOAuthResult result={notion} />}
      <NotionTokenForm hasToken={hasNotionToken} workspaceName={workspaceName} />
    </div>
  )
}
