'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCourse } from '@/lib/api/instructor'
import type { Course } from '@/types/api'

interface InstructorCourseListProps {
  initialCourses: Course[]
}

export function InstructorCourseList({ initialCourses }: InstructorCourseListProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleDelete(courseId: string) {
    setDeletingId(courseId)
    try {
      await deleteCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">講座管理</h1>
        <Button asChild size="sm">
          <Link href="/instructor/courses/new">
            <Plus className="size-4" />
            新規講座作成
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="border-border rounded-xl border p-10 text-center">
          <p className="text-muted-foreground text-sm">講座がありません</p>
          <Button size="sm" className="mt-3" asChild>
            <Link href="/instructor/courses/new">最初の講座を作成する</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border-border flex items-center justify-between rounded-xl border p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{course.title}</p>
                <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 ${course.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {course.isPublished ? '公開中' : '非公開'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {confirmId === course.id ? (
                  <>
                    <span className="text-muted-foreground text-sm">削除しますか？</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(course.id)}
                      disabled={deletingId === course.id}
                    >
                      {deletingId === course.id ? '削除中...' : '削除'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                      キャンセル
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmId(course.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
