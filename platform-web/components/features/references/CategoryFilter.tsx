'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CategoryItem {
  name: string
  count: number
}

interface CategoryFilterProps {
  categories: CategoryItem[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') ?? ''

  const handleSelect = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (category) {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (categories.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect('')}
        className={cn(
          'rounded-full border px-3.5 py-1.5 text-sm transition-all',
          currentCategory === '' ? 'font-semibold text-white' : 'text-[#9fb0cc] hover:text-[#e5eefc]'
        )}
        style={
          currentCategory === ''
            ? {
                background: 'rgba(124,58,237,.20)',
                borderColor: 'rgba(124,58,237,.40)',
              }
            : {
                background: 'rgba(15,23,42,.45)',
                borderColor: 'rgba(148,163,184,.18)',
              }
        }
      >
        すべて
      </button>
      {categories.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => handleSelect(name)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all',
            currentCategory === name
              ? 'font-semibold text-white'
              : 'text-[#9fb0cc] hover:text-[#e5eefc]'
          )}
          style={
            currentCategory === name
              ? {
                  background: 'rgba(124,58,237,.20)',
                  borderColor: 'rgba(124,58,237,.40)',
                }
              : {
                  background: 'rgba(15,23,42,.45)',
                  borderColor: 'rgba(148,163,184,.18)',
                }
          }
        >
          {name}
          <span
            className="rounded-full px-1.5 py-0.5 text-xs"
            style={{
              background: 'rgba(148,163,184,.12)',
              color: '#6b7f9a',
            }}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  )
}
