import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'
import { getCategories } from '@/lib/api/courses'
import { CourseForm } from '@/components/features/instructor/CourseForm'

export const metadata: Metadata = { title: '新規講座作成 | TechAtlas' }

export default async function NewCoursePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/instructor/courses/new')

  const user = await getMeServer(session.access_token)
  if (!user) redirect('/login?next=/instructor/courses/new')
  if (!['INSTRUCTOR', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const categories = await getCategories()

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold tracking-tight">新規講座作成</h1>
      <CourseForm categories={categories} />
    </div>
  )
}
