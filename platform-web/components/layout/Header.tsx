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
  const [menuOpen, setMenuOpen] = useState(false)

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

  // メニュー開閉時にbodyスクロールを制御
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
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

          {/* デスクトップナビゲーション */}
          <nav className="hidden items-center gap-2 md:flex">
            <NavPill href="/">Home</NavPill>
            <NavPill href="/references">References</NavPill>
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

          {/* デスクトップ認証ボタン */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {session ? (
              <LogoutButton className="hover:underline cursor-pointer" />
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

          {/* ハンバーガーボタン（モバイルのみ） */}
          <button
            className="relative flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors"
            style={{
              background: menuOpen ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.05)',
              border: '1px solid rgba(148,163,184,.15)',
            }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={menuOpen}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            {/* ハンバーガー / X アイコン */}
            <span
              className="relative flex h-4 w-5 flex-col items-center justify-between"
              aria-hidden
            >
              <span
                className="h-px w-full rounded-full transition-all duration-300 origin-center"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                  transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="h-px w-full rounded-full transition-all duration-300"
                style={{
                  background: 'rgba(148,163,184,.7)',
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? 'scaleX(0)' : 'none',
                }}
              />
              <span
                className="h-px w-full rounded-full transition-all duration-300 origin-center"
                style={{
                  background: 'linear-gradient(90deg, #06b6d4, #7c3aed)',
                  transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </span>
          </button>
        </div>
      </header>

      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          background: 'rgba(2,6,15,.6)',
          backdropFilter: menuOpen ? 'blur(4px)' : 'none',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      {/* スライドドロワー */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-72 md:hidden flex flex-col"
        style={{
          background: 'rgba(7,16,29,.97)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(148,163,184,.1)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: menuOpen ? '-20px 0 60px rgba(0,0,0,.5)' : 'none',
        }}
      >
        {/* ドロワーヘッダー */}
        <div
          className="flex h-16 items-center justify-between px-5"
          style={{ borderBottom: '1px solid rgba(148,163,184,.08)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#4a5f7a]">
            Navigation
          </span>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-[#4a5f7a] transition-colors hover:text-[#9fb0cc]"
            style={{ background: 'rgba(255,255,255,.04)' }}
            onClick={() => setMenuOpen(false)}
            aria-label="メニューを閉じる"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ナビリンク */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
          <MobileNavLink href="/" icon="⌂" onClick={() => setMenuOpen(false)}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/references" icon="⊞" onClick={() => setMenuOpen(false)}>
            References
          </MobileNavLink>
          {(role === 'INSTRUCTOR' || role === 'ADMIN') && (
            <MobileNavLink href="/instructor" icon="✦" accent onClick={() => setMenuOpen(false)}>
              Instructor
            </MobileNavLink>
          )}
          {role === 'ADMIN' && (
            <MobileNavLink href="/admin" icon="◆" accent onClick={() => setMenuOpen(false)}>
              Administrator
            </MobileNavLink>
          )}
          {session && (
            <MobileNavLink href="/dashboard" icon="▤" onClick={() => setMenuOpen(false)}>
              Dashboard
            </MobileNavLink>
          )}
        </nav>

        {/* 認証エリア */}
        <div
          className="px-4 py-5 flex flex-col gap-3"
          style={{ borderTop: '1px solid rgba(148,163,184,.08)' }}
        >
          {session ? (
            <div onClick={() => setMenuOpen(false)}>
              <LogoutButton
                className="w-full rounded-xl px-4 py-3 text-sm font-medium text-[#9fb0cc] transition-colors hover:text-[#e5eefc] cursor-pointer text-center"
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(148,163,184,.1)',
                }}
              />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-[#9fb0cc] text-center transition-colors hover:text-[#e5eefc]"
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(148,163,184,.1)',
                }}
              >
                ログイン
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-white text-center shadow-lg transition-opacity hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: '0 4px 20px rgba(124,58,237,.35)',
                }}
              >
                無料登録
              </Link>
            </>
          )}
        </div>

        {/* デコレーションライン */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)',
          }}
        />
      </div>
    </>
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
      className={`rounded-full border px-3.5 py-2 text-sm text-[#9fb0cc] transition-colors hover:text-[#e5eefc] ${className ?? ''}`}
      style={{
        borderColor: 'rgba(148,163,184,.18)',
        background: 'rgba(15,23,42,.45)',
      }}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  children,
  icon,
  accent,
  onClick,
}: {
  href: string
  children: React.ReactNode
  icon?: string
  accent?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
      style={{
        color: accent ? '#10b981' : '#9fb0cc',
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,.1)'
        ;(e.currentTarget as HTMLElement).style.color = accent ? '#34d399' : '#e5eefc'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.color = accent ? '#10b981' : '#9fb0cc'
      }}
    >
      {icon && (
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs"
          style={{
            background: accent ? 'rgba(16,185,129,.12)' : 'rgba(124,58,237,.12)',
            color: accent ? '#10b981' : '#7c3aed',
          }}
        >
          {icon}
        </span>
      )}
      {children}
    </Link>
  )
}
