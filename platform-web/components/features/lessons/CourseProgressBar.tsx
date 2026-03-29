'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { getProgress } from '@/lib/api/lessons'

interface CourseProgressBarProps {
  courseId: string
}

export function CourseProgressBar({ courseId }: CourseProgressBarProps) {
  const [progress, setProgress] = useState({ percent: 0, completed: 0, total: 0 })

  useEffect(() => {
    getProgress(courseId)
      .then((data) => {
        setProgress({
          percent: data.progressPercent,
          completed: data.completedCount,
          total: data.totalLessons,
        })
      })
      .catch(() => {})
  }, [courseId])

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>進捗</span>
        <span>{progress.completed} / {progress.total} レッスン</span>
      </div>
      <Progress value={progress.percent} className="h-2" />
    </div>
  )
}
