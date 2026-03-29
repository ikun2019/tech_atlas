import { BookOpen } from 'lucide-react'
import { CourseCard } from './CourseCard'
import type { Course } from '@/types/api'

interface CourseGridProps {
  courses: Course[]
}

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <BookOpen className="text-muted-foreground/40 size-12" />
        <p className="text-muted-foreground">コースが見つかりませんでした</p>
        <p className="text-muted-foreground text-sm">検索条件を変えてお試しください</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

export function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[22px] border"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
            borderColor: 'rgba(148,163,184,.18)',
          }}
        >
          <div className="aspect-video w-full animate-pulse" style={{ background: 'rgba(30,41,59,.50)' }} />
          <div className="space-y-3 p-6">
            <div className="h-4 w-3/4 animate-pulse rounded-lg" style={{ background: 'rgba(148,163,184,.12)' }} />
            <div className="h-3 w-full animate-pulse rounded-lg" style={{ background: 'rgba(148,163,184,.08)' }} />
            <div className="h-3 w-2/3 animate-pulse rounded-lg" style={{ background: 'rgba(148,163,184,.08)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
