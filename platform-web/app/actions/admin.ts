'use server'

import { revalidatePath, updateTag } from 'next/cache'

export async function revalidateCoursesCache(): Promise<void> {
  // fetch の next: { tags: ['courses'] } キャッシュを含むルートを無効化する
  // revalidateTag('courses', 'max')
  updateTag('courses')
  revalidatePath('/', 'page')
}
