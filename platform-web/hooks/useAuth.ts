'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, profile, isLoading, setUser, clearAuth } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // 初期セッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 認証状態の変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        clearAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, clearAuth])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
  }
}
