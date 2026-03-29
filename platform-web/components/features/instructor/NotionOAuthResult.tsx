'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface NotionOAuthResultProps {
  result: string
}

export function NotionOAuthResult({ result }: NotionOAuthResultProps) {
  const router = useRouter()

  useEffect(() => {
    if (result === 'connected') {
      toast.success('Notion と接続しました')
    } else if (result === 'denied') {
      toast.error('Notion との連携がキャンセルされました')
    } else {
      toast.error('Notion 連携に失敗しました。時間をおいて再試行してください')
    }
    // クエリパラメータを URL から除去
    router.replace('/instructor/settings')
  }, [result, router])

  return null
}
