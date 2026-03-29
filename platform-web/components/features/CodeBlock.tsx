'use client'

import { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    if (language) {
      ref.current.innerHTML = hljs.highlight(code, { language, ignoreIllegals: true }).value
    } else {
      ref.current.innerHTML = hljs.highlightAuto(code).value
    }
  }, [code, language])

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`group relative rounded-lg overflow-hidden ${className ?? ''}`}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        aria-label="コードをコピー"
      >
        {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
      </Button>
      <pre className="overflow-x-auto p-4 text-sm">
        <code ref={ref} className={language ? `language-${language}` : ''} />
      </pre>
    </div>
  )
}
