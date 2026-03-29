export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    statusCode: number
  }
}

export type Role = 'USER' | 'INSTRUCTOR' | 'ADMIN'

export interface User {
  id: string
  supabaseId: string
  email: string
  name: string
  avatarUrl: string | null
  role: Role
  stripeCustomerId: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  instructorToken: { workspaceName: string } | null
}

export interface Category {
  id: string
  slug: string
  name: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  categoryId: string
  instructorId: string
  isPublished: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  category?: Category
  instructor?: {
    id: string
    name: string
    avatarUrl: string | null
  }
  _count?: {
    lessons: number
    reviews: number
  }
}

export interface CourseDetail extends Course {
  category: Category
  instructor: {
    id: string
    name: string
    avatarUrl: string | null
  }
  chapters: (Chapter & { lessons: Lesson[] })[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Chapter {
  id: string
  courseId: string
  title: string
  order: number
  createdAt: string
  updatedAt: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  chapterId: string
  title: string
  notionPageId: string
  order: number
  isFree: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'TRIALING'
  plan: 'MONTHLY' | 'YEARLY'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}
