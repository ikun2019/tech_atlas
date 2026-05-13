'use client'

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { CodeBlock } from './CodeBlock'
import { slugify } from './TableOfContents'
import type { ReactNode } from 'react'

function nodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join('')
  if (node !== null && typeof node === 'object' && 'props' in node) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return nodeToText((node as any).props?.children)
  }
  return ''
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

//  * コードブロックの先頭行がコメントでファイルパスっぽい場合にキャプションとして抽出する。
//  * 例: `// server.js`, `# app.py`, `<!-- index.html -->`, `/* style.css */`

function extractCaption(code: string): { caption: string | undefined; cleanCode: string } {
  const newlineIndex = code.indexOf('\n')
  const firstLine = newlineIndex === -1 ? code : code.slice(0, newlineIndex)
  const rest = newlineIndex === -1 ? '' : code.slice(newlineIndex + 1)

  // const match = firstLine.match(/^\s*(?:\/\/|#|<!--|\/\*)\s*(.+?)\s*(?:-->|\*\/)?\s*$/)
  const match = firstLine.match(/^\s*(?:\/\/|#|<!--|\/\*)\s+path\s+(.+?)\s*(?:-->|\*\/)?\s*$/)
  if (match) {
    const content = match[1].trim()
    // ファイルパスらしい文字列（拡張子またはパス区切りを含む）かチェック
    // if (/^[\w./\\-]+$/.test(content) && (content.includes('.') || content.includes('/'))) {
    // }
    return { caption: content, cleanCode: rest }
  }

  return { caption: undefined, cleanCode: code }
}

const components: Components = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre({ children }: any) {
    const child = Array.isArray(children) ? children[0] : children
    if (child?.props) {
      const { className, children: code } = child.props as {
        className?: string
        children?: unknown
      }
      const match = /language-(\w+)/.exec(className ?? '')
      const rawCode = String(code ?? '').replace(/\n$/, '')
      const { caption, cleanCode } = extractCaption(rawCode)
      return <CodeBlock code={cleanCode} language={match?.[1]} caption={caption} />
    }
    return <pre>{children}</pre>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code({ children, ...props }: any) {
    return (
      <code className="rounded border border-[#334155] bg-[#1e2a38] px-1.5 py-0.5 text-sm font-mono text-[#c4b5fd]" {...props}>
        {children}
      </code>
    )
  },
  h1: ({ children }) => (
    <h1 id={slugify(nodeToText(children))} className="mt-8 mb-4 text-3xl font-bold tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 id={slugify(nodeToText(children))} className="mt-8 mb-4 text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugify(nodeToText(children))} className="mt-6 mb-3 text-xl font-semibold">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 id={slugify(nodeToText(children))} className="mt-4 mb-2 text-lg font-semibold">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="border-brand-600 text-muted-foreground my-4 border-l-4 pl-4 italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-brand-600 hover:text-brand-700 underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-[#1e2d3d]">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ backgroundColor: 'rgba(148,163,184,.08)' }}>{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-[#1e2d3d] last:border-0">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-[#dce8ff]">{children}</th>
  ),
  td: ({ children }) => <td className="px-4 py-2.5 text-[#9fb0cc]">{children}</td>,
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`prose-slate max-w-none ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
