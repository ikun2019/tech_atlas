'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/api'

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('categoryId') ?? ''

  const handleSelect = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (categoryId) {
        params.set('categoryId', categoryId)
      } else {
        params.delete('categoryId')
      }
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect('')}
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
          currentCategory === ''
            ? 'bg-brand-600 border-brand-600 text-white'
            : 'border-border text-muted-foreground hover:border-brand-600 hover:text-brand-600'
        )}
      >
        すべて
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.id)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            currentCategory === category.id
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'border-border text-muted-foreground hover:border-brand-600 hover:text-brand-600'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
