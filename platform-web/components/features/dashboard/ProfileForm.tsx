'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/lib/api/user'
import type { User } from '@/types/api'

const profileSchema = z.object({
  name: z.string().min(2, '名前は2文字以上で入力してください'),
  avatarUrl: z.string().url('正しい URL を入力してください').optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, avatarUrl: user.avatarUrl ?? '' },
  })

  async function onSubmit(values: ProfileFormValues) {
    setError(null)
    setSuccess(false)
    try {
      await updateProfile({ name: values.name, avatarUrl: values.avatarUrl || undefined })
      setSuccess(true)
    } catch {
      setError('更新に失敗しました。もう一度お試しください。')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">名前</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="avatarUrl">アバター URL（任意）</Label>
        <Input
          id="avatarUrl"
          type="url"
          placeholder="https://..."
          aria-invalid={!!errors.avatarUrl}
          {...register('avatarUrl')}
        />
        {errors.avatarUrl && <p className="text-destructive text-sm">{errors.avatarUrl.message}</p>}
      </div>

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">プロフィールを更新しました</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '更新中...' : '保存する'}
      </Button>
    </form>
  )
}
