import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getTechnologies, getReferenceCountByTech } from '@/lib/api/references'
import { TechCard } from '@/components/features/references/TechCard'

export const metadata: Metadata = {
  title: 'Reference — TechAtlas',
  description: 'コマンドリファレンス。Docker, Git, Linuxなどの技術のコマンドをすばやく引けます。',
}

async function TechGrid() {
  const techs = await getTechnologies()

  const techsWithCount = await Promise.all(
    techs.map(async (tech) => ({
      tech,
      count: await getReferenceCountByTech(tech.slug),
    }))
  )

  if (techsWithCount.length === 0) {
    return (
      <div
        className="rounded-[22px] border p-12 text-center"
        style={{
          background: 'rgba(15,23,42,.45)',
          borderColor: 'rgba(148,163,184,.18)',
        }}
      >
        <p style={{ color: '#9fb0cc' }}>リファレンスはまだ登録されていません。</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {techsWithCount.map(({ tech, count }) => (
        <TechCard key={tech.id} tech={tech} commandCount={count} />
      ))}
    </div>
  )
}

export default function ReferencesPage() {
  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div
          className="mb-4 inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm"
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
          コマンドリファレンス
        </div>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: '#e5eefc', letterSpacing: '-0.8px' }}
        >
          Reference
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#9fb0cc' }}>
          技術別コマンドリファレンス。迷ったときにすばやく引ける辞書として使えます。
        </p>
      </div>

      {/* Search link */}
      <div className="mb-8">
        <Link
          href="/references/search"
          className="inline-flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm transition-colors hover:bg-white/5"
          style={{
            background: 'rgba(15,23,42,.55)',
            borderColor: 'rgba(148,163,184,.18)',
            color: '#9fb0cc',
          }}
        >
          <Search className="size-4" />
          <span>やりたいことからコマンドを逆引き検索…</span>
          <span
            className="ml-auto rounded-md px-2 py-0.5 text-xs font-mono"
            style={{ background: 'rgba(148,163,184,.12)', color: '#6b7f9a' }}
          >
            /references/search
          </span>
        </Link>
      </div>

      {/* Tech grid */}
      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-[22px]"
                style={{ background: 'rgba(15,23,42,.45)' }}
              />
            ))}
          </div>
        }
      >
        <TechGrid />
      </Suspense>
    </div>
  )
}
