'use client'

import { useState } from 'react'
import { toggleCoursePublish } from '@/lib/api/admin'
import type { Course } from '@/types/api'

interface AdminCourseTableProps {
  initialCourses: Course[]
}

export function AdminCourseTable({ initialCourses }: AdminCourseTableProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [toggling, setToggling] = useState<string | null>(null)

  async function handleToggle(courseId: string, current: boolean) {
    setToggling(courseId)
    // 楽観的更新
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, isPublished: !current } : c))
    try {
      await toggleCoursePublish(courseId, !current)
    } catch {
      // ロールバック
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, isPublished: current } : c))
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-border border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">タイトル</th>
            <th className="px-4 py-3 text-left font-medium">講師</th>
            <th className="px-4 py-3 text-left font-medium">カテゴリ</th>
            <th className="px-4 py-3 text-left font-medium">作成日</th>
            <th className="px-4 py-3 text-center font-medium">公開</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{course.title}</td>
              <td className="text-muted-foreground px-4 py-3">{course.instructor?.name ?? '—'}</td>
              <td className="text-muted-foreground px-4 py-3">{course.category?.name ?? '—'}</td>
              <td className="text-muted-foreground px-4 py-3 text-xs">
                {new Date(course.createdAt).toLocaleDateString('ja-JP')}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  role="switch"
                  aria-checked={course.isPublished}
                  disabled={toggling === course.id}
                  onClick={() => handleToggle(course.id, course.isPublished)}
                  className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                    course.isPublished ? 'bg-brand-600' : 'bg-input'
                  }`}
                >
                  <span
                    className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                      course.isPublished ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
