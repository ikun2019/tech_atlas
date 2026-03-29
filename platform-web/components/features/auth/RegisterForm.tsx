'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoginWithGoogle } from './LoginWithGoogle'

const registerSchema = z
  .object({
    name: z.string().min(2, '名前は2文字以上で入力してください'),
    email: z.string().min(1, 'メールアドレスを入力してください').email('正しいメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [isComplete, setIsComplete] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('このメールアドレスはすでに登録されています。')
      } else {
        setServerError('登録に失敗しました。しばらくしてからもう一度お試しください。')
      }
      return
    }

    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <div className="space-y-3 text-center">
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-6">
          <p className="text-foreground font-medium">確認メールを送信しました</p>
          <p className="text-muted-foreground mt-1 text-sm">
            受信ボックスのリンクをクリックして登録を完了してください。
          </p>
        </div>
        <Link href="/login" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
          ログインページへ
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">名前</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            placeholder="山田 太郎"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">パスワード（確認）</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '無料で登録する'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">または</span>
        </div>
      </div>

      <LoginWithGoogle />

      <p className="text-muted-foreground text-center text-sm">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
          ログイン
        </Link>
      </p>
    </div>
  )
}
