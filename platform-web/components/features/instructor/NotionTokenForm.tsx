'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getNotionOAuthUrl, disconnectNotion } from '@/lib/api/instructor'

interface NotionTokenFormProps {
  hasToken: boolean
  workspaceName?: string
}

export function NotionTokenForm({ hasToken: initialHasToken, workspaceName: initialWorkspaceName }: NotionTokenFormProps) {
  const [hasToken, setHasToken] = useState(initialHasToken)
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName)
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    try {
      const url = await getNotionOAuthUrl()
      window.location.href = url
    } catch {
      toast.error('Notion 連携の開始に失敗しました。時間をおいて再試行してください')
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    setLoading(true)
    try {
      await disconnectNotion()
      setHasToken(false)
      setWorkspaceName(undefined)
      toast.success('Notion の接続を解除しました')
    } catch {
      toast.error('接続解除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (hasToken) {
    return (
      <div className="border-border rounded-xl border p-5 space-y-4">
        <div>
          <p className="text-sm font-medium">接続済みワークスペース</p>
          <p className="text-muted-foreground mt-1 text-sm">{workspaceName ?? '（名称不明）'}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={loading}>
          {loading ? '処理中...' : '接続を解除する'}
        </Button>
      </div>
    )
  }

  return (
    <div className="border-border rounded-xl border p-5 space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Notion ワークスペースを連携すると、Notion のページをレッスンコンテンツとして配信できます。
        </p>
      </div>
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? '接続中...' : 'Notion で接続する'}
      </Button>
    </div>
  )
}
