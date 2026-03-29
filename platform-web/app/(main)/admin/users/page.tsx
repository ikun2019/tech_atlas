import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'
import { getUsersServer } from '@/lib/api/admin'
import { UserTable } from '@/components/features/admin/UserTable'

export const metadata: Metadata = { title: 'ユーザー管理 | TechAtlas' }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { page } = await searchParams
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/admin/users')

  const [me, data] = await Promise.all([
    getMeServer(session.access_token),
    getUsersServer(session.access_token, page ? Number(page) : 1),
  ])

  if (!me || me.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">ユーザー管理</h1>
      <UserTable initialUsers={data.items} currentUserId={me.id} />

      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                p === (page ? Number(page) : 1)
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-border text-muted-foreground hover:border-brand-600 hover:text-brand-600'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
