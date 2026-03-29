'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addLesson } from '@/lib/api/instructor'
import type { Lesson } from '@/types/api'

/** Notion ページ URL から ID を抽出 */
function extractNotionPageId(urlOrId: string): string {
  // URL 形式: https://notion.so/page-title-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  const match = urlOrId.match(/([a-f0-9]{32})(?:[?#]|$)/i)
  if (match?.[1]) return match[1]
  // すでに ID 形式の場合はそのまま返す
  return urlOrId.replace(/-/g, '')
}

const lessonSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  notionPageId: z.string().min(1, 'Notion ページ ID を入力してください'),
  order: z.coerce.number().int().min(1),
  isFree: z.boolean(),
})

type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonFormProps {
  chapterId: string
  nextOrder: number
  onCreated: (lesson: Lesson) => void
  onCancel: () => void
}

export function LessonForm({ chapterId, nextOrder, onCreated, onCancel }: LessonFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { order: nextOrder, isFree: false },
  })

  async function onSubmit(values: LessonFormValues) {
    const lesson = await addLesson(chapterId, {
      title: values.title,
      notionPageId: extractNotionPageId(values.notionPageId),
      order: values.order,
      isFree: values.isFree,
    })
    onCreated(lesson)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-border space-y-3 rounded-lg border p-3">
      <div className="space-y-1">
        <Label htmlFor="lesson-title" className="text-xs">タイトル</Label>
        <Input id="lesson-title" className="h-7 text-sm" aria-invalid={!!errors.title} {...register('title')} />
        {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="notion-id" className="text-xs">Notion ページ URL / ID</Label>
        <Input id="notion-id" className="h-7 text-sm" placeholder="https://notion.so/..." aria-invalid={!!errors.notionPageId} {...register('notionPageId')} />
        {errors.notionPageId && <p className="text-destructive text-xs">{errors.notionPageId.message}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Label htmlFor="lesson-order" className="text-xs">順序</Label>
          <Input id="lesson-order" type="number" className="h-7 w-16 text-sm" {...register('order')} />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" {...register('isFree')} />
          無料公開
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>追加</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  )
}
