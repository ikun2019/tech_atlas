'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'
import { LogoutButton } from '@/components/features/auth/LogoutButton'
import type { Role } from '@/types/api'

export function Header() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  async function fetchRole(accessToken: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const json = await res.json()
        setRole((json.data?.role as Role) ?? null)
      } else {
        setRole(null)
      }
    } catch {
      setRole(null)
    }
  }

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRole(session.access_token)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchRole(session.access_token)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backdropFilter: 'blur(16px)',
        background: 'rgba(7,16,29,.68)',
        borderColor: 'rgba(148,163,184,.12)',
      }}
    >
      <div className="container flex h-16 items-center justify-between gap-5">
        {/* ブランド */}
        <Link href="/" className="flex shrink-0 items-center gap-3.5 font-bold tracking-tight">
          <div
            className="grid size-9 shrink-0 place-items-center rounded-xl text-lg font-bold text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              boxShadow: '0 10px 30px rgba(124,58,237,.35)',
            }}
          >
            T
          </div>
          <span className="text-[#e5eefc]">TechAtlas</span>
        </Link>

        {/* ナビゲーション */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavPill href="/">Home</NavPill>
          {(role === 'INSTRUCTOR' || role === 'ADMIN') && (
            <NavPill href="/instructor" className="text-emerald-500">
              Instructor
            </NavPill>
          )}
          {role === 'ADMIN' && (
            <NavPill href="/admin" className="text-emerald-500">
              Administrator
            </NavPill>
          )}
          {session && <NavPill href="/dashboard">Dashboard</NavPill>}
        </nav>

        {/* 認証ボタン */}
        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <>
              {/* <Link
                href="/dashboard"
                className="hidden rounded-xl px-4 py-2 text-sm font-medium text-[#dce8ff] transition-colors hover:bg-white/5 sm:block"
              >
                ダッシュボード
              </Link> */}
              <LogoutButton className="hover:underline cursor-pointer" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#9fb0cc] transition-colors hover:text-[#e5eefc]"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                無料登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function NavPill({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-2 text-sm text-[#9fb0cc] transition-colors hover:text-[#e5eefc] ${className}`}
      style={{
        borderColor: 'rgba(148,163,184,.18)',
        background: 'rgba(15,23,42,.45)',
      }}
    >
      {children}
    </Link>
  )
}
