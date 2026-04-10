export interface ReferenceTechnology {
  id: string
  slug: string
  name: string
  description: string | null
  iconUrl: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ReferenceDatabase {
  id: string
  notionDatabaseId: string
  slug: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Reference {
  id: string
  notionPageId: string
  referenceDatabaseId: string
  title: string
  description: string | null
  command: string | null
  path: string
  techSlug: string
  tags: string[]
  category: string | null
  level: string | null
  no: number | null
  isPublished: boolean
  isFree: boolean
  syncedAt: string
  createdAt: string
  updatedAt: string
  referenceDatabase?: ReferenceDatabase
}

export interface ReferencePageCache {
  id: string
  notionPageId: string
  content: unknown
  syncedAt: string
  updatedAt: string
}
