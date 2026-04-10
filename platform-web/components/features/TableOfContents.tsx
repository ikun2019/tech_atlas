'use client'

import { useEffect, useState } from 'react'

interface Heading {
  level: number
  text: string
  id: string
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      const text = m[2].replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim()
      headings.push({ level: m[1].length, text, id: slugify(text) })
    }
  }
  return headings
}

interface TableOfContentsProps {
  markdown: string
  /** variant controls visual style ('reference' = dark card wrap, 'lesson' = bare) */
  variant?: 'reference' | 'lesson'
}

export function TableOfContents({ markdown, variant = 'reference' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadings(markdown)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-60px 0% -70% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown])

  if (headings.length === 0) return null

  const inner = (
    <nav aria-label="目次">
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: '#6b7f9a' }}
      >
        目次
      </p>
      <ul className="space-y-0.5">
        {headings.map(({ level, text, id }) => (
          <li key={id} style={{ paddingLeft: `${(level - 1) * 10}px` }}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                setActiveId(id)
              }}
              className="block rounded py-0.5 text-xs leading-relaxed transition-colors duration-150"
              style={{
                color: activeId === id ? '#e5eefc' : '#6b7f9a',
                fontWeight: activeId === id ? 500 : 400,
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )

  if (variant === 'lesson') return inner

  return (
    <div
      className="rounded-[18px] border p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
        borderColor: 'rgba(148,163,184,.18)',
      }}
    >
      {inner}
    </div>
  )
}
