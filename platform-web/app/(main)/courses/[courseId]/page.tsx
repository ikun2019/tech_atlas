import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/api/courses'
import { getSubscriptionStatusServer } from '@/lib/api/user'
import { Curriculum } from '@/components/features/courses/Curriculum'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params
  const course = await getCourse(courseId)
  if (!course) return { title: '講座が見つかりません' }

  return {
    title: `${course.title} | TechAtlas`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      ...(course.thumbnailUrl && { images: [{ url: course.thumbnailUrl }] }),
      type: 'article',
    },
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const [course, subscriptionStatus] = await Promise.all([
    getCourse(courseId),
    session?.access_token
      ? getSubscriptionStatusServer(session.access_token)
      : Promise.resolve({ hasSubscription: false, status: null, plan: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }),
  ])

  if (!course) notFound()

  const isSubscribed = subscriptionStatus.hasSubscription

  return (
    <div>
      {/* ヒーローセクション */}
      <div className="bg-muted/40 border-border border-b">
        <div className="container py-10">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {course.category && (
                <span className="text-brand-600 text-sm font-medium">{course.category.name}</span>
              )}
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>

              {course.instructor && (
                <div className="flex items-center gap-2">
                  {course.instructor.avatarUrl ? (
                    <Image
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                      <User className="text-muted-foreground size-4" />
                    </div>
                  )}
                  <span className="text-sm">
                    <span className="text-muted-foreground">講師: </span>
                    <span className="font-medium">{course.instructor.name}</span>
                  </span>
                </div>
              )}
            </div>

            {/* サムネイル */}
            <div className="border-border bg-background overflow-hidden rounded-xl border shadow-sm">
              <div className="bg-muted relative aspect-video w-full">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="text-muted-foreground/40 size-16" />
                  </div>
                )}
              </div>
              <div className="p-4">
                {isSubscribed ? (
                  <Button className="w-full" size="lg" asChild>
                    <Link
                      href={`/courses/${course.id}/chapters/${course.chapters?.[0]?.id}/lessons/${course.chapters?.[0]?.lessons?.[0]?.id}`}
                    >
                      受講を続ける
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/dashboard/subscription">受講を始める</Link>
                    </Button>
                    <p className="text-muted-foreground mt-2 text-center text-xs">
                      サブスクリプションが必要です
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* カリキュラム */}
      <div className="container py-10">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">カリキュラム</h2>
        {course.chapters && course.chapters.length > 0 ? (
          <Curriculum courseId={course.id} chapters={course.chapters} isSubscribed={isSubscribed} />
        ) : (
          <p className="text-muted-foreground">カリキュラムはまだ公開されていません</p>
        )}
      </div>
    </div>
  )
}
