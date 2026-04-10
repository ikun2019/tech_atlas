import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Users, BookOpen, BookMarked } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'

const navItems = [
  { href: '/admin', label: 'KPI 統計', icon: BarChart3 },
  { href: '/admin/users', label: 'ユーザー管理', icon: Users },
  { href: '/admin/courses', label: 'コース管理', icon: BookOpen },
  { href: '/admin/references', label: 'Reference管理', icon: BookMarked },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/admin')

  const user = await getMeServer(session.access_token)
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="container flex gap-8 py-8">
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
