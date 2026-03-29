import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { notionOAuthCallbackServer } from '@/lib/api/instructor'

interface PageProps {
  searchParams: Promise<{
    code?: string
    state?: string
    error?: string
  }>
}

export default async function NotionCallbackPage({ searchParams }: PageProps) {
  const { code, state, error } = await searchParams

  // Notion 側でユーザーが拒否した場合
  if (error) {
    redirect('/instructor/settings?notion=denied')
  }

  if (!code || !state) {
    redirect('/instructor/settings?notion=error')
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?next=/instructor/settings')
  }

  try {
    await notionOAuthCallbackServer(code, state, session.access_token)
    redirect('/instructor/settings?notion=connected')
  } catch {
    redirect('/instructor/settings?notion=error')
  }
}
