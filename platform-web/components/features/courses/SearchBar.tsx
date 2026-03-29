'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMounted = useRef(false)

  const updateUrl = useCallback(
    (search: string) => {
      // window.location.search を使うことで searchParams への依存をなくし無限ループを防ぐ
      const params = new URLSearchParams(window.location.search)
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router]
  )

  useEffect(() => {
    // 初回マウント時は URL 変更しない
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => updateUrl(value), 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, updateUrl])

  return (
    <div className="relative max-w-sm w-full">
      <Search className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder="講座を検索..."
        className="pl-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
