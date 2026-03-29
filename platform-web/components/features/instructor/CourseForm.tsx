'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCourse, updateCourse } from '@/lib/api/instructor'
import type { Category, Course } from '@/types/api'

const courseSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  thumbnailUrl: z.string().url('正しい URL を入力してください').optional().or(z.literal('')),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface CourseFormProps {
  categories: Category[]
  course?: Course
}

export function CourseForm({ categories, course }: CourseFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? '',
      description: course?.description ?? '',
      categoryId: course?.categoryId ?? '',
      thumbnailUrl: course?.thumbnailUrl ?? '',
    },
  })

  async function onSubmit(values: CourseFormValues) {
    if (course) {
      await updateCourse(course.id, {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        thumbnailUrl: values.thumbnailUrl || undefined,
      })
      router.refresh()
    } else {
      const created = await createCourse({
        title: values.title,
        description: values.description ?? '',
        categoryId: values.categoryId,
        thumbnailUrl: values.thumbnailUrl || undefined,
      })
      router.push(`/instructor/courses/${created.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">説明（任意）</Label>
        <Textarea id="description" rows={3} {...register('description')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryId">カテゴリ</Label>
        <select
          id="categoryId"
          className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
          aria-invalid={!!errors.categoryId}
          {...register('categoryId')}
        >
          <option value="">選択してください</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-destructive text-sm">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thumbnailUrl">サムネイル URL（任意）</Label>
        <Input id="thumbnailUrl" type="url" placeholder="https://..." {...register('thumbnailUrl')} />
        {errors.thumbnailUrl && <p className="text-destructive text-sm">{errors.thumbnailUrl.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : course ? '更新する' : '作成する'}
      </Button>
    </form>
  )
}
