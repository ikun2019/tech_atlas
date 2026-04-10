'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface CommandBlockProps {
  command: string
}

export function CommandBlock({ command }: CommandBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex items-stretch overflow-hidden rounded-xl"
      style={{
        background: 'rgba(2,6,23,.60)',
        border: '1px solid rgba(148,163,184,.12)',
      }}
    >
      <pre
        className="min-w-0 flex-1 overflow-x-auto p-3 font-mono text-sm"
        style={{ color: '#7dd3fc' }}
      >
        <code>{command}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="shrink-0 self-center px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
        style={{
          color: copied ? '#86efac' : '#9fb0cc',
          borderLeft: '1px solid rgba(148,163,184,.12)',
        }}
        aria-label="コマンドをコピー"
      >
        {copied ? <Check className="size-3.5" /> : 'Copy'}
      </button>
    </div>
  )
}
