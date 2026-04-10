'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { Reference } from '@/types/reference'
import { CommandBlock } from '@/components/features/references/CommandBlock'

interface ReferenceCardProps {
  reference: Reference
  dbSlug: string
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

export function ReferenceCard({ reference, dbSlug }: ReferenceCardProps) {
  const levelStyle = reference.level ? LEVEL_STYLES[reference.level] : null

  return (
    <div
      className="flex flex-col gap-3 rounded-[22px] border p-5 transition-all duration-200 hover:border-white/20"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
        borderColor: 'rgba(148,163,184,.18)',
        boxShadow: '0 8px 32px rgba(2,6,23,.35)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {reference.no !== null && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-mono font-medium"
              style={{
                background: 'rgba(124,58,237,.12)',
                color: '#c4b5fd',
                border: '1px solid rgba(124,58,237,.22)',
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
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold leading-snug" style={{ color: '#e5eefc' }}>
        {reference.title}
      </h3>

      {/* Description */}
      {reference.description && (
        <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: '#9fb0cc' }}>
          {reference.description}
        </p>
      )}

      {/* Command block */}
      {reference.command && <CommandBlock command={reference.command} />}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <div className="flex flex-wrap gap-1.5">
          {reference.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                background: 'rgba(148,163,184,.08)',
                color: '#9fb0cc',
                border: '1px solid rgba(148,163,184,.12)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/references/${reference.techSlug}/${dbSlug}/${reference.path}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
          style={{
            background: 'rgba(6,182,212,.08)',
            borderColor: 'rgba(6,182,212,.18)',
            color: '#67e8f9',
          }}
        >
          <BookOpen className="size-3" />
          詳細を見る →
        </Link>
      </div>
    </div>
  )
}
