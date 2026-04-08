'use client'

import { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js'
import { Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  caption?: string
}

const PLAIN_LANGS = new Set(['plaintext', 'plain', 'text', 'txt'])

export function CodeBlock({ code, language, className, caption }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  const isPlain = PLAIN_LANGS.has((language ?? '').toLowerCase())

  useEffect(() => {
    if (!ref.current) return
    if (language && !isPlain) {
      ref.current.innerHTML = hljs.highlight(code, { language, ignoreIllegals: true }).value
    } else {
      ref.current.textContent = code
    }
  }, [code, language, isPlain])

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isPlain) {
    return (
      <div
        className={[
          'relative my-3 overflow-hidden rounded-lg border border-gray-300 bg-gray-100 text-slate-900',
          className ?? '',
        ].join(' ')}
      >
        {caption && (
          <div className="flex items-center border-b border-gray-300 bg-gray-100 px-3 py-1.5">
            <span className="font-mono text-[11px] font-light text-gray-500">{caption}</span>
          </div>
        )}
        <pre className="overflow-x-auto p-4 text-sm">
          <code ref={ref} className="font-mono" />
        </pre>
      </div>
    )
  }

  if (caption) {
    return (
      <div
        className={[
          'relative my-3 overflow-hidden rounded-lg border border-[#334155] bg-[#1e2a38] text-gray-100 shadow-md',
          className ?? '',
        ].join(' ')}
      >
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        />
        <div className="flex items-center justify-between border-b border-[#334155] bg-[#16202c] px-3 py-1.5">
          <span className="font-mono text-[13px] font-light text-gray-300">{caption}</span>
          <button
            type="button"
            onClick={handleCopy}
            className={[
              'flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] transition-all duration-200',
              copied
                ? 'bg-green-600/80 text-white opacity-100'
                : 'bg-[#334155] text-gray-100 opacity-85 hover:bg-[#506880]',
            ].join(' ')}
            aria-label="コードをコピー"
          >
            {copied ? '✅' : '📋'} {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre
          className="overflow-x-auto pl-6 pr-4 py-4 text-sm"
          style={{ background: '#1b2431', margin: 5, borderRadius: '0 0 0.5rem 0.5rem' }}
        >
          <code ref={ref} className={language ? `language-${language}` : ''} />
        </pre>
      </div>
    )
  }

  return (
    <div
      className={[
        'group relative my-3 overflow-hidden rounded-lg',
        className ?? '',
      ].join(' ')}
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-clip-padding text-sm font-medium opacity-0 outline-none transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
        aria-label="コードをコピー"
      >
        <Copy className="size-3.5" />
      </button>
      <pre className="overflow-x-auto p-4 text-sm">
        <code ref={ref} className={language ? `language-${language}` : ''} />
      </pre>
    </div>
  )
}
