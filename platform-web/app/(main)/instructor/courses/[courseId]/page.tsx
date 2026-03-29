import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMeServer } from '@/lib/api/user'
import { getCategories } from '@/lib/api/courses'
import { getOwnCourseDetailServer } from '@/lib/api/instructor'
import { CourseForm } from '@/components/features/instructor/CourseForm'
import { InstructorChapterManager } from '@/components/features/instructor/InstructorChapterManager'
import { PublishToggle } from '@/components/features/instructor/PublishToggle'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params
  return { title: `講座編集 (${courseId}) | TechAtlas` }
}

export default async function InstructorCourseDetailPage({ params }: PageProps) {
  const { courseId } = await params
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/instructor')

  const user = await getMeServer(session.access_token)
  if (!user) redirect('/login?next=/instructor')
  if (!['INSTRUCTOR', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const [course, categories] = await Promise.all([
    getOwnCourseDetailServer(session.access_token, courseId),
    getCategories(),
  ])

  if (!course) notFound()

  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="container py-8">
      <div className="max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">講座編集</h1>
          {isAdmin ? (
            <PublishToggle courseId={courseId} isPublished={course.isPublished} />
          ) : (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                course.isPublished
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {course.isPublished ? '公開中' : '非公開（管理者が公開します）'}
            </span>
          )}
        </div>
        {!course.isPublished && !isAdmin && (
          <p className="text-muted-foreground text-sm">
            講座の公開は管理者が行います。準備ができたら{' '}
            <Link href="/admin/courses" className="text-brand-600 hover:underline">
              管理者画面
            </Link>{' '}
            から公開してください。
          </p>
        )}
        <CourseForm categories={categories} course={course} />
      </div>

      <div>
        <h2 className="py-8 mb-4 text-xl font-bold tracking-tight">チャプター・レッスン管理</h2>
        <InstructorChapterManager courseId={courseId} initialChapters={course.chapters ?? []} />
      </div>
    </div>
  )
}
