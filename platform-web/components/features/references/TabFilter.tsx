'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TabFilterProps {
  tags: string[]
}

export function TabFilter({ tags }: TabFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTag = searchParams.get('tag') ?? ''

  const handleSelect = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tag) {
        params.set('tag', tag)
      } else {
        params.delete('tag')
      }
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect('')}
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
          currentTag === ''
            ? 'text-white'
            : 'text-[#9fb0cc] hover:text-[#e5eefc]'
        )}
        style={
          currentTag === ''
            ? {
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                borderColor: 'transparent',
              }
            : {
                background: 'rgba(15,23,42,.45)',
                borderColor: 'rgba(148,163,184,.18)',
              }
        }
      >
        すべて
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleSelect(tag)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
            currentTag === tag ? 'text-white' : 'text-[#9fb0cc] hover:text-[#e5eefc]'
          )}
          style={
            currentTag === tag
              ? {
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  borderColor: 'transparent',
                }
              : {
                  background: 'rgba(15,23,42,.45)',
                  borderColor: 'rgba(148,163,184,.18)',
                }
          }
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
