import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/api/courses'
import { getLessonServer } from '@/lib/api/lessons'
import { getSubscriptionStatusServer } from '@/lib/api/user'
import { LessonContent } from '@/components/features/lessons/LessonContent'
import { LessonSidebar } from '@/components/features/lessons/LessonSidebar'
import { SubscriptionGate } from '@/components/features/lessons/SubscriptionGate'
import { CourseProgressBar } from '@/components/features/lessons/CourseProgressBar'
import type { Chapter, Lesson } from '@/types/api'

interface PageProps {
  params: Promise<{
    courseId: string
    chapterId: string
    lessonId: string
  }>
}

export const metadata: Metadata = { title: 'レッスン | TechAtlas' }

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = !!session?.user

  const [lesson, course, subscriptionStatus] = await Promise.all([
    getLessonServer(lessonId, session?.access_token),
    getCourse(courseId),
    session?.access_token
      ? getSubscriptionStatusServer(session.access_token)
      : Promise.resolve({ hasSubscription: false, status: null, plan: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }),
  ])

  if (!lesson || !course) notFound()

  // 未認証 + 有料レッスン → ログインへ
  if (!lesson.isFree && !isAuthenticated) {
    redirect(
      `/login?next=/courses/${courseId}/chapters/${course.chapters?.[0]?.id}/lessons/${lessonId}`
    )
  }

  const isSubscribed = subscriptionStatus.hasSubscription
  const isLocked = !lesson.isFree && !isSubscribed

  // 全レッスンのフラットリスト（前後ナビ用）
  const allLessons = (course.chapters ?? []).flatMap((chapter: Chapter & { lessons: Lesson[] }) =>
    chapter.lessons.map((lesson: Lesson) => ({ lesson, chapter }))
  )

  const currentChapter = course.chapters?.find((ch: Chapter & { lessons: Lesson[] }) =>
    ch.lessons.some((l: Lesson) => l.id === lessonId)
  )

  return (
    <div className="container py-6">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* サイドバー */}
        <aside className="hidden lg:block">
          <div
            className="rounded-[22px] border p-5"
            style={{
              background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
              borderColor: 'rgba(148,163,184,.18)',
            }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#9fb0cc' }}
            >
              Course Navigation
            </p>
            <div className="mb-4">
              <CourseProgressBar courseId={courseId} />
            </div>
            <LessonSidebar
              courseId={courseId}
              chapters={course.chapters ?? []}
              currentLessonId={lessonId}
              isSubscribed={isSubscribed}
            />
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="min-w-0">
          <div
            className="rounded-[22px] border p-6 md:p-8"
            style={{
              background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
              borderColor: 'rgba(148,163,184,.18)',
            }}
          >
            <SubscriptionGate isLocked={isLocked}>
              <LessonContent
                courseId={courseId}
                chapterId={currentChapter?.id ?? ''}
                lessonId={lessonId}
                lessonTitle={lesson.title}
                chapterTitle={currentChapter?.title ?? ''}
                content={lesson.content}
                allLessons={allLessons}
                isAuthenticated={isAuthenticated}
              />
            </SubscriptionGate>
          </div>
        </main>
      </div>
    </div>
  )
}
