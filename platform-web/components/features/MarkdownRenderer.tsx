'use client'

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import type { Components } from 'react-markdown'
import { CodeBlock } from './CodeBlock'

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
  h1: ({ children }) => <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 text-2xl font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mt-6 mb-3 text-xl font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 mb-2 text-lg font-semibold">{children}</h4>,
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
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`prose-slate max-w-none ${className ?? ''}`}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
