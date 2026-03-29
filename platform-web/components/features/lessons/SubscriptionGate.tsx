'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubscriptionGateProps {
  children: React.ReactNode
  isLocked: boolean
}

export function SubscriptionGate({ children, isLocked }: SubscriptionGateProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Lock className="text-muted-foreground size-10" />
          <p className="font-semibold">このレッスンはサブスクリプションが必要です</p>
          <p className="text-muted-foreground text-sm">プランに登録してすべてのコンテンツにアクセスしましょう</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/subscription">プランに登録する</Link>
        </Button>
      </div>
    </div>
  )
}
