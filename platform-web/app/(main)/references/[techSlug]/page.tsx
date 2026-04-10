import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  getTechnologies,
  getReferences,
  getReferenceCountByTech,
} from '@/lib/api/references'
import { ReferenceCard } from '@/components/features/references/ReferenceCard'
import { TabFilter } from '@/components/features/references/TabFilter'
import { CategoryFilter } from '@/components/features/references/CategoryFilter'
import type { Reference } from '@/types/reference'

interface PageProps {
  params: Promise<{ techSlug: string }>
  searchParams: Promise<{
    tag?: string
    category?: string
    dbSlug?: string
    search?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { techSlug } = await params
  const techs = await getTechnologies()
  const tech = techs.find((t) => t.slug === techSlug)
  if (!tech) return { title: 'Not Found' }
  return {
    title: `${tech.name} Reference — TechAtlas`,
    description: tech.description ?? `${tech.name}のコマンドリファレンス`,
  }
}

function extractUnique<T>(items: T[], key: keyof T): string[] {
  const set = new Set<string>()
  for (const item of items) {
    const val = item[key]
    if (typeof val === 'string' && val) set.add(val)
  }
  return Array.from(set).sort()
}

function extractUniqueTags(references: Reference[]): string[] {
  const set = new Set<string>()
  for (const ref of references) {
    for (const tag of ref.tags) {
      if (tag) set.add(tag)
    }
  }
  return Array.from(set).sort()
}

function buildCategoryItems(
  references: Reference[]
): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>()
  for (const ref of references) {
    if (ref.category) {
      counts.set(ref.category, (counts.get(ref.category) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export default async function TechReferencePage({ params, searchParams }: PageProps) {
  const { techSlug } = await params
  const { tag, category, dbSlug, search } = await searchParams

  const techs = await getTechnologies()
  const tech = techs.find((t) => t.slug === techSlug)
  if (!tech) notFound()

  const allReferences = await getReferences({ techSlug })
  const totalCount = await getReferenceCountByTech(techSlug)

  const tags = extractUniqueTags(allReferences)
  const categoryItems = buildCategoryItems(allReferences)
  const dbSlugs = extractUnique(
    allReferences.map((r) => r.referenceDatabase).filter(Boolean) as Array<{
      slug: string
    }>,
    'slug'
  )

  // Filter client-side (already server-filtered by techSlug)
  let filtered = allReferences
  if (tag) filtered = filtered.filter((r) => r.tags.includes(tag))
  if (category) filtered = filtered.filter((r) => r.category === category)
  if (dbSlug) filtered = filtered.filter((r) => r.referenceDatabase?.slug === dbSlug)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        (r.command?.toLowerCase().includes(q) ?? false)
    )
  }

  return (
    <div className="container py-10">
      {/* Back link */}
      <Link
        href="/references"
        className="mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
        style={{ color: '#9fb0cc' }}
      >
        <ArrowLeft className="size-4" />
        リファレンス一覧
      </Link>

      {/* Hero */}
      <div
        className="relative mb-8 overflow-hidden rounded-[22px] border p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
          borderColor: 'rgba(148,163,184,.18)',
          boxShadow: '0 24px 80px rgba(2,6,23,.45)',
        }}
      >
        <div
          className="pointer-events-none absolute -bottom-24 -right-16 size-[320px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,.20), transparent 62%)' }}
        />
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: '#e5eefc', letterSpacing: '-0.6px' }}
        >
          {tech.name}
        </h1>
        {tech.description && (
          <p className="mt-2" style={{ color: '#9fb0cc' }}>
            {tech.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm"
            style={{
              background: 'rgba(6,182,212,.10)',
              borderColor: 'rgba(6,182,212,.22)',
              color: '#9cecff',
            }}
          >
            <BookOpen className="size-3.5" />
            {totalCount} コマンド
          </span>
        </div>
      </div>

      {/* DB slug tabs (if multiple) */}
      {dbSlugs.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {dbSlugs.map((slug) => (
            <Link
              key={slug}
              href={`?${new URLSearchParams({ ...(tag ? { tag } : {}), ...(category ? { category } : {}), dbSlug: slug }).toString()}`}
              className="rounded-full border px-3.5 py-1.5 text-sm transition-all"
              style={
                dbSlug === slug
                  ? {
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      borderColor: 'transparent',
                      color: '#fff',
                    }
                  : {
                      background: 'rgba(15,23,42,.45)',
                      borderColor: 'rgba(148,163,184,.18)',
                      color: '#9fb0cc',
                    }
              }
            >
              {slug}
            </Link>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <Suspense>
          <TabFilter tags={tags} />
        </Suspense>
        <Suspense>
          <CategoryFilter categories={categoryItems} />
        </Suspense>
      </div>

      {/* Result count */}
      <p className="mb-4 text-sm" style={{ color: '#6b7f9a' }}>
        {filtered.length} 件表示
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[22px] border p-12 text-center"
          style={{
            background: 'rgba(15,23,42,.45)',
            borderColor: 'rgba(148,163,184,.18)',
          }}
        >
          <p style={{ color: '#9fb0cc' }}>条件に一致するリファレンスが見つかりませんでした。</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((ref) => (
            <ReferenceCard
              key={ref.id}
              reference={ref}
              dbSlug={ref.referenceDatabase?.slug ?? dbSlug ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}
