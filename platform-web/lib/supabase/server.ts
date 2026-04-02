import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

type CookiesToSet = Parameters<NonNullable<CookieMethodsServer['setAll']>>[0]
type CookieStore = Awaited<ReturnType<typeof cookies>>

export async function createClient() {
  const cookieStore: CookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookiesToSet: CookiesToSet) {
        try {
          const mutable = cookieStore as unknown as {
            set?: (cookie: { name: string; value: string } & Record<string, unknown>) => void
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            mutable.set?.({ name, value, ...(options ?? {}) })
          )
        } catch {
          // Server Component からの呼び出しでは無視
        }
      },
    } satisfies CookieMethodsServer,
  })
}
