'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CSSProperties } from 'react'

interface LogoutButtonProps {
  className?: string
  style?: CSSProperties
}

export function LogoutButton({ className, style }: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Button variant="ghost" size="sm" className={className} style={style} onClick={handleLogout}>
      ログアウト
    </Button>
  )
}
