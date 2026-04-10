import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { getReferenceByPath, getReferencePageCache, getReferences } from '@/lib/api/references'
import { ContentRenderer } from '@/components/features/references/ContentRenderer'
import { ReferenceCard } from '@/components/features/references/ReferenceCard'
import { CommandBlock } from '@/components/features/references/CommandBlock'
import { TableOfContents } from '@/components/features/TableOfContents'

interface PageProps {
  params: Promise<{ techSlug: string; dbSlug: string; path: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { dbSlug, path } = await params
  const reference = await getReferenceByPath(dbSlug, path)
  if (!reference) return { title: 'Not Found' }
  return {
    title: `${reference.title} — TechAtlas Reference`,
    description: reference.description ?? undefined,
  }
}

const LEVEL_STYLES: Record<string, { label: string; bg: string; border: string; color: string }> =
  {
    Beginner: {
      label: 'Beginner',
      bg: 'rgba(22,163,74,.12)',
      border: 'rgba(22,163,74,.28)',
      color: '#86efac',
    },
    Intermediate: {
      label: 'Intermediate',
      bg: 'rgba(202,138,4,.12)',
      border: 'rgba(202,138,4,.28)',
      color: '#fde047',
    },
    Advanced: {
      label: 'Advanced',
      bg: 'rgba(220,38,38,.12)',
      border: 'rgba(220,38,38,.28)',
      color: '#fca5a5',
    },
  }

export default async function ReferenceDetailPage({ params }: PageProps) {
  const { techSlug, dbSlug, path } = await params

  const reference = await getReferenceByPath(dbSlug, path)
  if (!reference) notFound()

  const pageCache = await getReferencePageCache(reference.notionPageId)
  const markdown =
    pageCache &&
    typeof pageCache.content === 'object' &&
    pageCache.content !== null &&
    'markdown' in pageCache.content
      ? (pageCache.content as { markdown: string }).markdown
      : null

  // Related references (same category)
  const allRefs = await getReferences({ techSlug, dbSlug })
  const related = allRefs
    .filter((r) => r.id !== reference.id && r.category === reference.category)
    .slice(0, 5)

  const levelStyle = reference.level ? LEVEL_STYLES[reference.level] : null

  return (
    <div className="container py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: '#6b7f9a' }}>
        <Link href="/references" className="hover:text-[#9fb0cc] transition-colors">
          Reference
        </Link>
        <span>/</span>
        <Link
          href={`/references/${techSlug}`}
          className="hover:text-[#9fb0cc] transition-colors capitalize"
        >
          {techSlug}
        </Link>
        <span>/</span>
        <span style={{ color: '#9fb0cc' }}>{reference.title}</span>
      </nav>

      {/* Back — グリッド外に置いて両カラムの開始位置を揃える */}
      <Link
        href={`/references/${techSlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
        style={{ color: '#9fb0cc' }}
      >
        <ArrowLeft className="size-4" />
        {techSlug} リファレンス一覧
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div>
          {/* Header card */}
          <div
            className="mb-6 rounded-[22px] border p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
              borderColor: 'rgba(148,163,184,.18)',
            }}
          >
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {reference.no !== null && (
                <span
                  className="rounded-full border px-2 py-0.5 font-mono text-xs"
                  style={{
                    background: 'rgba(124,58,237,.12)',
                    borderColor: 'rgba(124,58,237,.22)',
                    color: '#c4b5fd',
                  }}
                >
                  #{reference.no}
                </span>
              )}
              {levelStyle && (
                <span
                  className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: levelStyle.bg,
                    borderColor: levelStyle.border,
                    color: levelStyle.color,
                  }}
                >
                  {levelStyle.label}
                </span>
              )}
              {reference.category && (
                <span
                  className="rounded-full border px-2.5 py-0.5 text-xs"
                  style={{
                    background: 'rgba(6,182,212,.08)',
                    borderColor: 'rgba(6,182,212,.18)',
                    color: '#67e8f9',
                  }}
                >
                  {reference.category}
                </span>
              )}
            </div>

            <h1
              className="text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: '#e5eefc', letterSpacing: '-0.5px' }}
            >
              {reference.title}
            </h1>

            {reference.description && (
              <p className="mt-3 leading-relaxed" style={{ color: '#9fb0cc' }}>
                {reference.description}
              </p>
            )}

            {reference.command && (
              <div className="mt-4">
                <CommandBlock command={reference.command} />
              </div>
            )}

            {/* Tags */}
            {reference.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {reference.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-2 py-0.5 text-xs"
                    style={{
                      background: 'rgba(148,163,184,.08)',
                      borderColor: 'rgba(148,163,184,.12)',
                      color: '#9fb0cc',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Markdown content */}
          {markdown ? (
            <div
              className="rounded-[22px] border p-6 md:p-8"
              style={{
                background: 'rgba(15,23,42,.55)',
                borderColor: 'rgba(148,163,184,.18)',
              }}
            >
              <ContentRenderer markdown={markdown} />
            </div>
          ) : (
            <div
              className="rounded-[22px] border p-8 text-center"
              style={{
                background: 'rgba(15,23,42,.45)',
                borderColor: 'rgba(148,163,184,.18)',
              }}
            >
              <p style={{ color: '#9fb0cc' }}>
                コンテンツはまだ同期されていません。管理者が同期を実行するまでお待ちください。
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: TOC + Related references */}
        <aside className="flex flex-col gap-6 self-start sticky top-20">
          {/* Table of contents */}
          {markdown && (
            <div
              className="rounded-[22px] border p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
                borderColor: 'rgba(148,163,184,.18)',
              }}
            >
              <TableOfContents markdown={markdown} variant="lesson" />
            </div>
          )}

          {/* Related references */}
          {related.length > 0 && (
            <div
              className="rounded-[22px] border p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
                borderColor: 'rgba(148,163,184,.18)',
              }}
            >
              <h2
                className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
                style={{ color: '#6b7f9a' }}
              >
                <BookOpen className="size-4" />
                関連リファレンス
              </h2>
              <div className="flex flex-col gap-3">
                {related.map((ref) => (
                  <ReferenceCard key={ref.id} reference={ref} dbSlug={dbSlug} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
