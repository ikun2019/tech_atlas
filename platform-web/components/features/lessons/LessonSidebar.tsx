'use client'

import Link from 'next/link'
import { CheckCircle, Circle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/stores/progressStore'
import type { Chapter, Lesson } from '@/types/api'

interface LessonSidebarProps {
  courseId: string
  chapters: (Chapter & { lessons: Lesson[] })[]
  currentLessonId: string
  isSubscribed: boolean
}

export function LessonSidebar({ courseId, chapters, currentLessonId, isSubscribed }: LessonSidebarProps) {
  const { isCompleted } = useProgressStore()

  return (
    <nav className="space-y-3">
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <p
            className="px-2 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#9fb0cc' }}
          >
            {chapter.title}
          </p>
          <ul className="mt-1 space-y-1">
            {chapter.lessons.map((lesson) => {
              const canAccess = lesson.isFree || isSubscribed
              const isCurrent = lesson.id === currentLessonId
              const completed = isCompleted(lesson.id)

              return (
                <li key={lesson.id}>
                  {canAccess ? (
                    <Link
                      href={`/courses/${courseId}/chapters/${chapter.id}/lessons/${lesson.id}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-all',
                        isCurrent
                          ? 'font-medium'
                          : 'hover:bg-white/5'
                      )}
                      style={
                        isCurrent
                          ? {
                              background: 'linear-gradient(135deg, rgba(124,58,237,.18), rgba(6,182,212,.12))',
                              borderColor: 'rgba(124,58,237,.24)',
                              color: '#c4b5fd',
                            }
                          : {
                              background: 'rgba(2,6,23,.14)',
                              borderColor: 'rgba(148,163,184,.10)',
                              color: '#9fb0cc',
                            }
                      }
                    >
                      {completed ? (
                        <CheckCircle className="size-4 shrink-0" style={{ color: '#7c3aed' }} />
                      ) : (
                        <Circle className="size-4 shrink-0" style={{ color: isCurrent ? '#c4b5fd' : '#9fb0cc' }} />
                      )}
                      <span className="line-clamp-2">{lesson.title}</span>
                    </Link>
                  ) : (
                    <div
                      className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm"
                      style={{
                        background: 'rgba(2,6,23,.10)',
                        borderColor: 'rgba(148,163,184,.08)',
                        color: 'rgba(148,163,184,.40)',
                      }}
                    >
                      <Lock className="size-4 shrink-0" style={{ color: 'rgba(148,163,184,.40)' }} />
                      <span className="line-clamp-2">{lesson.title}</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
