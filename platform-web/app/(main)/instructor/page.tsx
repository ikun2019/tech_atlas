import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getOwnCoursesServer } from '@/lib/api/instructor'
import { getMeServer } from '@/lib/api/user'
import { InstructorCourseList } from '@/components/features/instructor/InstructorCourseList'

export const metadata: Metadata = { title: '講師ダッシュボード | TechAtlas' }

export default async function InstructorPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/instructor')

  const user = await getMeServer(session.access_token)
  if (!user) redirect('/login?next=/instructor')
  if (!['INSTRUCTOR', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const courses = await getOwnCoursesServer(session.access_token)

  return <InstructorCourseList initialCourses={courses} />
}
