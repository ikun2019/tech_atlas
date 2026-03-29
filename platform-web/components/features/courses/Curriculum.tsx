'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, CheckCircle, Lock, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Chapter, Lesson } from '@/types/api'

interface CurriculumProps {
  courseId: string
  chapters: (Chapter & { lessons: Lesson[] })[]
  isSubscribed?: boolean
}

export function Curriculum({ courseId, chapters, isSubscribed = false }: CurriculumProps) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set(chapters[0] ? [chapters[0].id] : [])
  )

  function toggleChapter(chapterId: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        {chapters.length} チャプター・{totalLessons} レッスン
      </p>

      <div className="border-border divide-border divide-y overflow-hidden rounded-xl border">
        {chapters.map((chapter) => {
          const isOpen = openChapters.has(chapter.id)
          return (
            <div key={chapter.id}>
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
              >
                <div>
                  <span className="font-medium">{chapter.title}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    {chapter.lessons.length} レッスン
                  </span>
                </div>
                <ChevronDown
                  className={cn('text-muted-foreground size-4 transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <ul className="bg-muted/20 divide-border divide-y">
                  {chapter.lessons.map((lesson) => {
                    const canAccess = lesson.isFree || isSubscribed
                    return (
                      <li key={lesson.id}>
                        {canAccess ? (
                          <Link
                            href={`/courses/${courseId}/chapters/${chapter.id}/lessons/${lesson.id}`}
                            className="hover:bg-muted/50 flex items-center gap-3 px-4 py-2.5 transition-colors"
                          >
                            <PlayCircle className="text-brand-600 size-4 shrink-0" />
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.isFree && (
                              <span className="text-brand-600 ml-auto text-xs font-medium">無料</span>
                            )}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-2.5">
                            <Lock className="text-muted-foreground size-4 shrink-0" />
                            <span className="text-muted-foreground text-sm">{lesson.title}</span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
