import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCacheClient } from '@/lib/supabase/cache'
import type { Reference, ReferenceDatabase, ReferenceTechnology } from '@/types/reference'

/** DBに配列文字列として保存されている category を正規化する */
function normalizeCategory(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'string') {
    // "[\"環境確認・情報取得\"]" のような JSON 配列文字列を検出
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (Array.isArray(parsed)) return (parsed[0] as string) ?? null
      } catch {
        // parse 失敗時はそのまま返す
      }
    }
    return raw
  }
  if (Array.isArray(raw)) return (raw[0] as string) ?? null
  return null
}

function normalizeReference(ref: Record<string, unknown>): Reference {
  return { ...ref, category: normalizeCategory(ref.category) } as Reference
}

export const getTechnologies = unstable_cache(
  async (): Promise<ReferenceTechnology[]> => {
    const supabase = createCacheClient()
    const { data, error } = await supabase
      .from('ReferenceTechnology')
      .select('*')
      .order('sortOrder', { ascending: true })

    if (error) {
      console.error('getTechnologies error:', error)
      return []
    }
    return (data ?? []) as ReferenceTechnology[]
  },
  ['reference-technologies'],
  { revalidate: 3600, tags: ['reference-technologies'] }
)

export async function getReferences(params: {
  techSlug: string
  dbSlug?: string
  category?: string
  tag?: string
}): Promise<Reference[]> {
  const supabase = await createClient()

  let query = supabase
    .from('Reference')
    .select('*, referenceDatabase:ReferenceDatabase(*)')
    .eq('techSlug', params.techSlug)
    .eq('isPublished', true)
    .order('no', { ascending: true })

  if (params.dbSlug) {
    const { data: db } = await supabase
      .from('ReferenceDatabase')
      .select('id')
      .eq('slug', params.dbSlug)
      .single()
    if (db) {
      query = query.eq('referenceDatabaseId', db.id)
    }
  }

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.tag) {
    query = query.contains('tags', [params.tag])
  }

  const { data, error } = await query

  if (error) {
    console.error('getReferences error:', error)
    return []
  }
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeReference)
}

export async function getReferenceByPath(
  dbSlug: string,
  path: string
): Promise<Reference | null> {
  const supabase = await createClient()

  const { data: db, error: dbError } = await supabase
    .from('ReferenceDatabase')
    .select('id')
    .eq('slug', dbSlug)
    .single()

  if (dbError || !db) return null

  const { data, error } = await supabase
    .from('Reference')
    .select('*, referenceDatabase:ReferenceDatabase(*)')
    .eq('referenceDatabaseId', db.id)
    .eq('path', path)
    .single()

  if (error) {
    console.error('getReferenceByPath error:', error)
    return null
  }
  return normalizeReference(data as Record<string, unknown>)
}

export async function getReferencePageCache(
  notionPageId: string
): Promise<{ content: unknown } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ReferencePageCache')
    .select('content')
    .eq('notionPageId', notionPageId)
    .single()

  if (error) {
    console.error('getReferencePageCache error:', error)
    return null
  }
  return data as { content: unknown }
}

export const searchReferences = unstable_cache(
  async (query: string): Promise<Reference[]> => {
    const supabase = createCacheClient()

    // 複数単語をAND検索に変換: "docker login" → "docker & login"
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w + ':*')
      .join(' & ')

    const { data, error } = await supabase
      .from('Reference')
      .select('*, referenceDatabase:ReferenceDatabase(*)')
      .eq('isPublished', true)
      .textSearch('search_vector', tsQuery, { config: 'simple' })
      .order('no', { ascending: true })
      .limit(50)

    if (error) {
      // GINインデックス未作成の場合はilikeにフォールバック
      const { data: fallback } = await supabase
        .from('Reference')
        .select('*, referenceDatabase:ReferenceDatabase(*)')
        .eq('isPublished', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('no', { ascending: true })
        .limit(50)
      return ((fallback ?? []) as Record<string, unknown>[]).map(normalizeReference)
    }
    return ((data ?? []) as Record<string, unknown>[]).map(normalizeReference)
  },
  ['reference-search'],
  { revalidate: 60 }
)

export const getFreeReferences = unstable_cache(
  async (limit: number = 6): Promise<Reference[]> => {
    const supabase = createCacheClient()

    const { data, error } = await supabase
      .from('Reference')
      .select('*, referenceDatabase:ReferenceDatabase(*)')
      .eq('isPublished', true)
      .eq('isFree', true)
      .order('no', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('getFreeReferences error:', error)
      return []
    }
    return ((data ?? []) as Record<string, unknown>[]).map(normalizeReference)
  },
  ['free-references'],
  { revalidate: 3600, tags: ['free-references'] }
)

export async function getReferenceDatabases(): Promise<ReferenceDatabase[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ReferenceDatabase')
    .select('*')
    .order('createdAt', { ascending: true })

  if (error) {
    console.error('getReferenceDatabases error:', error)
    return []
  }
  return (data ?? []) as ReferenceDatabase[]
}

export async function getReferenceCountByTech(techSlug: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('Reference')
    .select('id', { count: 'exact', head: true })
    .eq('techSlug', techSlug)
    .eq('isPublished', true)

  if (error) {
    console.error('getReferenceCountByTech error:', error)
    return 0
  }
  return count ?? 0
}
