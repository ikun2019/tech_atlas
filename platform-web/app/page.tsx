import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCourses, getCategories } from '@/lib/api/courses'
import { CourseGrid, CourseGridSkeleton } from '@/components/features/courses/CourseGrid'
import { CategoryFilter } from '@/components/features/courses/CategoryFilter'
import { SearchBar } from '@/components/features/courses/SearchBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'TechAtlas — 読む・引く・深める技術学習プラットフォーム',
  description:
    'テキストベースのオンライン講座でスキルアップしよう。Web開発・データベース・インフラなど多彩な講座を揃えています。',
  openGraph: {
    title: 'TechAtlas',
    description: 'テキストベースのオンライン講座でスキルアップしよう。',
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<{
    categoryId?: string
    search?: string
    page?: string
  }>
}

async function CourseList({
  categoryId,
  search,
  page,
}: {
  categoryId?: string
  search?: string
  page?: string
}) {
  const data = await getCourses({
    categoryId,
    search,
    page: page ? Number(page) : 1,
    limit: 12,
  })

  return (
    <>
      <CourseGrid courses={data.items} />
      {data.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams()
            if (categoryId) params.set('categoryId', categoryId)
            if (search) params.set('search', search)
            if (p > 1) params.set('page', String(p))
            const isCurrent = p === (page ? Number(page) : 1)
            return (
              <a
                key={p}
                href={`?${params.toString()}`}
                className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-white/10 text-[#9fb0cc] hover:border-brand-600 hover:text-brand-400'
                }`}
              >
                {p}
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}

export default async function HomePage({ searchParams }: PageProps) {
  const { categoryId, search, page } = await searchParams
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* ── Hero ────────────────────────────────── */}
        <section className="container py-10">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Hero メイン */}
            <div
              className="relative overflow-hidden rounded-[22px] border p-8 md:p-10"
              style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
                borderColor: 'rgba(148,163,184,.18)',
                boxShadow: '0 24px 80px rgba(2,6,23,.45)',
              }}
            >
              {/* 右下のグロー */}
              <div
                className="pointer-events-none absolute -bottom-32 -right-20 size-[420px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,.26), transparent 62%)' }}
              />

              {/* Eyebrow */}
              <div
                className="mb-5 inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm"
                style={{
                  background: 'rgba(124,58,237,.12)',
                  borderColor: 'rgba(124,58,237,.28)',
                  color: '#d9c8ff',
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
                />
                Text-first learning platform × Reference × Video
              </div>

              <h1
                className="text-4xl font-bold leading-[1.04] tracking-tight md:text-5xl lg:text-[52px]"
                style={{ letterSpacing: '-1.3px', maxWidth: 760 }}
              >
                技術学習を
                <span
                  style={{
                    background: 'linear-gradient(90deg,#ffffff 0%, #c4b5fd 34%, #67e8f9 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  読む・引く・深める
                </span>
                で一体化する。
              </h1>

              <p className="mt-5 text-lg leading-relaxed" style={{ color: '#9fb0cc', maxWidth: 680 }}>
                Udemyのような体系学習と辞書性を同じ体験に統合。
                NotionをCMSにしながら、受講体験はリッチな学習プラットフォームとして最適化します。
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="#courses"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    boxShadow: '0 14px 40px rgba(124,58,237,.35)',
                  }}
                >
                  学習を始める →
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
                  style={{
                    background: 'rgba(15,23,42,.55)',
                    borderColor: 'rgba(148,163,184,.18)',
                    color: '#dce8ff',
                  }}
                >
                  無料登録
                </Link>
              </div>

              {/* メトリクス */}
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { value: '24+', label: 'Courses' },
                  { value: '280+', label: 'Lessons' },
                  { value: '76%', label: 'Avg completion' },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="min-w-[140px] rounded-2xl border p-4"
                    style={{
                      background: 'rgba(2,6,23,.22)',
                      borderColor: 'rgba(148,163,184,.18)',
                    }}
                  >
                    <strong className="block text-2xl font-bold text-[#e5eefc]">{m.value}</strong>
                    <span className="text-sm" style={{ color: '#9fb0cc' }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero サイド */}
            <div
              className="rounded-[22px] border p-6"
              style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
                borderColor: 'rgba(148,163,184,.18)',
                boxShadow: '0 24px 80px rgba(2,6,23,.45)',
              }}
            >
              <div className="flex h-full flex-col gap-4">
                {/* 現在の学習状況 */}
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(30,41,59,.60), rgba(15,23,42,.45))',
                    borderColor: 'rgba(148,163,184,.18)',
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9fb0cc' }}>
                    現在の学習状況
                  </p>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="mt-1 text-xl font-semibold text-[#e5eefc]">Docker for Beginners</h3>
                      <p className="text-sm" style={{ color: '#9fb0cc' }}>Chapter 3 / コンテナ操作の基本</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full border px-2.5 py-1 text-xs"
                      style={{ background: 'rgba(6,182,212,.10)', borderColor: 'rgba(6,182,212,.22)', color: '#9cecff' }}
                    >
                      +12 min
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(148,163,184,.12)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: '68%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
                    />
                  </div>
                  <p className="mt-2 text-sm" style={{ color: '#9fb0cc' }}>68% complete</p>
                </div>

                {/* 次のレッスン */}
                <div
                  className="flex-1 rounded-[18px] border p-5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(30,41,59,.60), rgba(15,23,42,.45))',
                    borderColor: 'rgba(148,163,184,.18)',
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9fb0cc' }}>
                    次のレッスン
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {[
                      { title: 'docker exec の基本', duration: '7m' },
                      { title: 'ログ確認とトラブル対応', duration: '10m' },
                      { title: 'Reference: docker ps', duration: '辞書' },
                    ].map((l) => (
                      <div
                        key={l.title}
                        className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-sm"
                        style={{
                          background: 'rgba(2,6,23,.18)',
                          borderColor: 'rgba(148,163,184,.12)',
                          color: '#dce8ff',
                        }}
                      >
                        <span>{l.title}</span>
                        <span style={{ color: '#9fb0cc' }}>{l.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 講座一覧 ─────────────────────────────── */}
        <section id="courses" className="container pb-16 pt-6">
          <div className="mb-6">
            <h2
              className="text-3xl font-bold tracking-tight"
              style={{ color: '#e5eefc', letterSpacing: '-0.6px' }}
            >
              Learn
            </h2>
            <p className="mt-1" style={{ color: '#9fb0cc' }}>
              体系学習用のコース。テキスト主体で素早く読み進めつつ、必要に応じて動画へ遷移できます。
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Suspense>
              <CategoryFilter categories={categories} />
            </Suspense>
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          <Suspense fallback={<CourseGridSkeleton />}>
            <CourseList categoryId={categoryId} search={search} page={page} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  )
}
