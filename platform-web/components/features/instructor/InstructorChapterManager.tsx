'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChapterForm } from './ChapterForm'
import { LessonForm } from './LessonForm'
import { LessonEditForm } from './LessonEditForm'
import { addChapter, deleteLesson } from '@/lib/api/instructor'
import type { Chapter, Lesson } from '@/types/api'

interface InstructorChapterManagerProps {
  courseId: string
  initialChapters: (Chapter & { lessons?: Lesson[] })[]
}

export function InstructorChapterManager({ courseId, initialChapters }: InstructorChapterManagerProps) {
  const [chapters, setChapters] = useState(
    initialChapters.map((ch) => ({ ...ch, lessons: ch.lessons ?? [] }))
  )
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [addingChapter, setAddingChapter] = useState(false)
  const [addingLessonChapterId, setAddingLessonChapterId] = useState<string | null>(null)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)

  async function handleAddChapter() {
    if (!newChapterTitle.trim()) return
    setAddingChapter(true)
    try {
      const chapter = await addChapter(courseId, { title: newChapterTitle, order: chapters.length + 1 })
      setChapters((prev) => [...prev, { ...chapter, lessons: [] }])
      setNewChapterTitle('')
    } finally {
      setAddingChapter(false)
    }
  }

  function handleChapterDeleted(chapterId: string) {
    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId))
  }

  async function handleDeleteLesson(chapterId: string, lessonId: string) {
    if (!window.confirm('このレッスンを削除しますか？')) return
    await deleteLesson(lessonId)
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) } : ch
      )
    )
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="border-border rounded-xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <ChapterForm
              chapter={chapter}
              onUpdated={(updated) =>
                setChapters((prev) => prev.map((ch) => ch.id === updated.id ? { ...ch, ...updated } : ch))
              }
              onDeleted={() => handleChapterDeleted(chapter.id)}
            />
          </div>

          <div className="p-4 space-y-2">
            {chapter.lessons.map((lesson) => (
              <div key={lesson.id}>
                {editingLessonId === lesson.id ? (
                  <LessonEditForm
                    lesson={lesson}
                    onUpdated={(updated) => {
                      setChapters((prev) =>
                        prev.map((ch) =>
                          ch.id === chapter.id
                            ? { ...ch, lessons: ch.lessons.map((l) => l.id === updated.id ? updated : l) }
                            : ch
                        )
                      )
                      setEditingLessonId(null)
                    }}
                    onCancel={() => setEditingLessonId(null)}
                  />
                ) : (
                  <div className="text-muted-foreground group flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm">
                    <span className="text-xs tabular-nums opacity-60">{lesson.order}.</span>
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.isFree && <span className="text-brand-600 text-xs">無料</span>}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingLessonId(lesson.id)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {addingLessonChapterId === chapter.id ? (
              <LessonForm
                chapterId={chapter.id}
                nextOrder={chapter.lessons.length + 1}
                onCreated={(lesson) => {
                  setChapters((prev) =>
                    prev.map((ch) => ch.id === chapter.id ? { ...ch, lessons: [...ch.lessons, lesson] } : ch)
                  )
                  setAddingLessonChapterId(null)
                }}
                onCancel={() => setAddingLessonChapterId(null)}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full border border-dashed"
                onClick={() => setAddingLessonChapterId(chapter.id)}
              >
                <Plus className="size-4" />
                レッスンを追加
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* チャプター追加 */}
      <div className="flex gap-2">
        <Input
          placeholder="新規チャプタータイトル"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddChapter() }}
        />
        <Button onClick={handleAddChapter} disabled={addingChapter || !newChapterTitle.trim()} size="sm">
          <Plus className="size-4" />
          チャプター追加
        </Button>
      </div>
    </div>
  )
}
