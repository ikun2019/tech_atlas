import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/features/auth/RegisterForm'

export const metadata: Metadata = {
  title: '新規登録 | TechAtlas',
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold">
          <div
            className="grid size-8 place-items-center rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            T
          </div>
          <span>TechAtlas</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">新規登録</h1>
        <p className="text-muted-foreground mt-1 text-sm">無料アカウントを作成してください</p>
      </div>
      <RegisterForm />
    </div>
  )
}
