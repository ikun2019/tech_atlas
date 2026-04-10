import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'
import { searchReferences } from '@/lib/api/references'
import { ReferenceCard } from '@/components/features/references/ReferenceCard'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'リファレンス逆引き検索 — TechAtlas',
  description: 'やりたいことからコマンドを検索できます。',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <div
        className="rounded-[22px] border p-12 text-center"
        style={{
          background: 'rgba(15,23,42,.45)',
          borderColor: 'rgba(148,163,184,.18)',
        }}
      >
        <Search className="mx-auto mb-3 size-8" style={{ color: 'rgba(148,163,184,.30)' }} />
        <p style={{ color: '#9fb0cc' }}>検索ワードを入力してください。</p>
      </div>
    )
  }

  const results = await searchReferences(query)

  if (results.length === 0) {
    return (
      <div
        className="rounded-[22px] border p-12 text-center"
        style={{
          background: 'rgba(15,23,42,.45)',
          borderColor: 'rgba(148,163,184,.18)',
        }}
      >
        <p style={{ color: '#9fb0cc' }}>
          &quot;{query}&quot; に一致するリファレンスが見つかりませんでした。
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm" style={{ color: '#6b7f9a' }}>
        {results.length} 件見つかりました
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        {results.map((ref) => (
          <ReferenceCard
            key={ref.id}
            reference={ref}
            dbSlug={ref.referenceDatabase?.slug ?? ''}
          />
        ))}
      </div>
    </div>
  )
}

export default async function ReferenceSearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams

  return (
    <div className="container py-10">
      {/* Back */}
      <Link
        href="/references"
        className="mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
        style={{ color: '#9fb0cc' }}
      >
        <ArrowLeft className="size-4" />
        リファレンス一覧
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: '#e5eefc', letterSpacing: '-0.6px' }}
        >
          逆引き検索
        </h1>
        <p className="mt-2" style={{ color: '#9fb0cc' }}>
          やりたいことを入力してコマンドを探せます。
        </p>
      </div>

      {/* Search form */}
      <form method="GET" className="mb-8">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2"
            style={{ color: '#4a5f7a' }}
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="例: コンテナを起動する、ブランチを切り替える…"
            className="w-full rounded-xl border bg-transparent py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-white/20"
            style={{
              background: 'rgba(15,23,42,.55)',
              borderColor: 'rgba(148,163,184,.18)',
              color: '#e5eefc',
            }}
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            検索
          </button>
        </div>
      </form>

      {/* Results */}
      <Suspense
        key={q}
        fallback={
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[22px]"
                style={{ background: 'rgba(15,23,42,.45)' }}
              />
            ))}
          </div>
        }
      >
        <SearchResults query={q ?? ''} />
      </Suspense>
    </div>
  )
}
