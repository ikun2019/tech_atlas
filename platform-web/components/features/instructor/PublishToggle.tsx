'use client'

import { useState } from 'react'
import { toggleCoursePublish } from '@/lib/api/admin'
import { revalidateCoursesCache } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

interface PublishToggleProps {
  courseId: string
  isPublished: boolean
}

export function PublishToggle({ courseId, isPublished: initial }: PublishToggleProps) {
  const router = useRouter()
  const [isPublished, setIsPublished] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const next = !isPublished
    setIsPublished(next)
    try {
      await toggleCoursePublish(courseId, next)
      await revalidateCoursesCache()
      router.refresh()
    } catch {
      setIsPublished(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        isPublished
          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
      }`}
    >
      {isPublished ? '公開中（クリックで非公開）' : '非公開（クリックで公開）'}
    </button>
  )
}
