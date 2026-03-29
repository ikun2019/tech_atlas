import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, User } from 'lucide-react'
import type { Course } from '@/types/api'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-[22px] border transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,.80), rgba(15,23,42,.68))',
        borderColor: 'rgba(148,163,184,.18)',
        boxShadow: '0 24px 80px rgba(2,6,23,.45)',
      }}
    >
      {/* サムネイル */}
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{ background: 'rgba(2,6,23,.30)' }}
      >
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-12" style={{ color: 'rgba(148,163,184,.30)' }} />
          </div>
        )}
        {course.category && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium text-white"
            style={{
              background: 'rgba(6,182,212,.10)',
              border: '1px solid rgba(6,182,212,.22)',
              color: '#9cecff',
            }}
          >
            {course.category.name}
          </span>
        )}
      </div>

      {/* 本文 */}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug" style={{ color: '#e5eefc' }}>
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: '#9fb0cc' }}>
          {course.description}
        </p>

        {/* バッジ */}
        <div className="flex flex-wrap gap-2">
          {course.category && (
            <span
              className="rounded-full px-2.5 py-1 text-xs"
              style={{
                background: 'rgba(148,163,184,.10)',
                border: '1px solid rgba(148,163,184,.16)',
                color: '#d8e5ff',
              }}
            >
              {course.category.name}
            </span>
          )}
          {course._count !== undefined && (
            <span
              className="rounded-full px-2.5 py-1 text-xs"
              style={{
                background: 'rgba(148,163,184,.10)',
                border: '1px solid rgba(148,163,184,.16)',
                color: '#d8e5ff',
              }}
            >
              {course._count.lessons} lessons
            </span>
          )}
        </div>

        {/* フッター */}
        <div className="mt-auto flex items-center justify-between pt-2">
          {course.instructor && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9fb0cc' }}>
              <User className="size-3.5" />
              <span>{course.instructor.name}</span>
            </div>
          )}
          <span
            className="rounded-full border px-2.5 py-1 text-xs"
            style={{
              background: 'rgba(6,182,212,.10)',
              borderColor: 'rgba(6,182,212,.22)',
              color: '#9cecff',
            }}
          >
            <BookOpen className="mr-1 inline size-3" />
            学習する
          </span>
        </div>
      </div>
    </Link>
  )
}
