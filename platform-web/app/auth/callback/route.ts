import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  const xfProto = request.headers.get('x-forwarded-proto')
  const xfHost = request.headers.get('x-forwarded-host')
  const host = xfHost ?? request.headers.get('host')
  const forwardedOrigin = host ? `${xfProto ?? 'https'}://${host}` : url.origin
  const appOrigin = env.NEXT_PUBLIC_APP_URL ?? forwardedOrigin

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${appOrigin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${appOrigin}/login?error=auth_failed`)
  }

  // バックエンド DB にユーザーを同期
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
    })
  } catch {
    // sync 失敗はログのみ（認証フローは継続）
    console.error('Failed to sync user with backend')
  }

  return NextResponse.redirect(`${origin}${next}`)
}
