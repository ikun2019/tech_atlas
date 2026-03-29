'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/features/MarkdownRenderer'
import { useProgressStore } from '@/stores/progressStore'
import { completeLesson, uncompleteLesson } from '@/lib/api/lessons'
import type { Chapter, Lesson } from '@/types/api'

interface LessonContentProps {
  courseId: string
  chapterId: string
  lessonId: string
  lessonTitle: string
  chapterTitle: string
  content: string
  allLessons: { lesson: Lesson; chapter: Chapter }[]
  isAuthenticated: boolean
}

export function LessonContent({
  courseId,
  chapterId,
  lessonId,
  lessonTitle,
  chapterTitle,
  content,
  allLessons,
  isAuthenticated,
}: LessonContentProps) {
  const { isCompleted, markComplete, markIncomplete } = useProgressStore()
  const [isPending, setIsPending] = useState(false)
  const completed = isCompleted(lessonId)

  const currentIndex = allLessons.findIndex((l) => l.lesson.id === lessonId)
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  async function handleToggleComplete() {
    if (!isAuthenticated || isPending) return
    setIsPending(true)
    try {
      if (completed) {
        markIncomplete(lessonId)
        await uncompleteLesson(lessonId)
      } else {
        markComplete(lessonId)
        await completeLesson(lessonId)
      }
    } catch {
      // ロールバック
      if (completed) markComplete(lessonId)
      else markIncomplete(lessonId)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">{chapterTitle}</p>
        <h1 className="text-2xl font-bold tracking-tight">{lessonTitle}</h1>
      </div>

      <MarkdownRenderer content={content} />

      <div className="border-border flex items-center justify-between border-t pt-6">
        {prev ? (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/courses/${courseId}/chapters/${prev.chapter.id}/lessons/${prev.lesson.id}`}
            >
              <ChevronLeft className="size-4" />
              前のレッスン
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {isAuthenticated && (
          <Button
            variant={completed ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleComplete}
            disabled={isPending}
          >
            {completed ? (
              <>
                <CheckCircle className="text-brand-600 size-4" />
                完了済み
              </>
            ) : (
              <>
                <Circle className="size-4" />
                完了としてマーク
              </>
            )}
          </Button>
        )}

        {next ? (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/courses/${courseId}/chapters/${next.chapter.id}/lessons/${next.lesson.id}`}
            >
              次のレッスン
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
