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
        'group relative my-3 overflow-hidden rounded-xl',
        className ?? '',
      ].join(' ')}
      style={{
        background: 'rgba(2,6,23,.70)',
        border: '1px solid rgba(148,163,184,.12)',
      }}
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <button
        type="button"
        onClick={handleCopy}
        className={[
          'absolute right-3 top-3 grid size-7 place-items-center rounded-lg transition-all',
          copied ? 'text-green-400' : 'text-[#4a5f7a] hover:text-[#9fb0cc]',
        ].join(' ')}
        style={{ background: 'rgba(148,163,184,.08)' }}
        aria-label="コードをコピー"
      >
        <Copy className={copied ? 'hidden' : 'size-3.5'} />
        {copied && (
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
        <code ref={ref} className={language ? `language-${language}` : ''} />
      </pre>
    </div>
  )
}
