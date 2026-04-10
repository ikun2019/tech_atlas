/**
 * unstable_cache 内で使用するためのSupabaseクライアント。
 * cookies() に依存しない静的クライアント。
 * 認証不要の公開データ読み取り専用。
 */
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export function createCacheClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
}
