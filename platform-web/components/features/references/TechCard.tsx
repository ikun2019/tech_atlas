import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { ReferenceTechnology } from '@/types/reference'

interface TechCardProps {
  tech: ReferenceTechnology
  commandCount: number
}

const SLUG_GRADIENTS: Record<string, { from: string; to: string; glow: string }> = {
  docker: { from: '#0284c7', to: '#06b6d4', glow: 'rgba(6,182,212,.35)' },
  git: { from: '#ea580c', to: '#f97316', glow: 'rgba(249,115,22,.35)' },
  linux: { from: '#7c3aed', to: '#a855f7', glow: 'rgba(168,85,247,.35)' },
  kubernetes: { from: '#2563eb', to: '#3b82f6', glow: 'rgba(59,130,246,.35)' },
  nginx: { from: '#16a34a', to: '#22c55e', glow: 'rgba(34,197,94,.35)' },
  aws: { from: '#d97706', to: '#f59e0b', glow: 'rgba(245,158,11,.35)' },
  terraform: { from: '#7c3aed', to: '#6d28d9', glow: 'rgba(124,58,237,.35)' },
}

const DEFAULT_GRADIENT = { from: '#7c3aed', to: '#06b6d4', glow: 'rgba(124,58,237,.35)' }

export function TechCard({ tech, commandCount }: TechCardProps) {
  const gradient = SLUG_GRADIENTS[tech.slug] ?? DEFAULT_GRADIENT

  return (
    <Link
      href={`/references/${tech.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
        borderColor: 'rgba(148,163,184,.18)',
        boxShadow: '0 24px 80px rgba(2,6,23,.45)',
      }}
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute -bottom-20 -right-10 size-[280px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${gradient.glow}, transparent 62%)` }}
      />

      {/* Icon */}
      <div
        className="mb-4 grid size-12 place-items-center rounded-xl text-white"
        style={{
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          boxShadow: `0 8px 24px ${gradient.glow}`,
        }}
      >
        {tech.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tech.iconUrl} alt={tech.name} className="size-7 object-contain" />
        ) : (
          <BookOpen className="size-6" />
        )}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold tracking-tight" style={{ color: '#e5eefc' }}>
        {tech.name}
      </h3>

      {/* Description */}
      {tech.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: '#9fb0cc' }}>
          {tech.description}
        </p>
      )}

      {/* Count badge */}
      <div className="mt-auto pt-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
          style={{
            background: 'rgba(148,163,184,.08)',
            borderColor: 'rgba(148,163,184,.16)',
            color: '#9fb0cc',
          }}
        >
          <BookOpen className="size-3" />
          {commandCount} コマンド
        </span>
      </div>

      {/* Arrow */}
      <span
        className="absolute right-5 top-5 text-lg opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"
        style={{ color: gradient.to }}
        aria-hidden
      >
        →
      </span>
    </Link>
  )
}
