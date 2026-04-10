'use server'

import { revalidateTag } from 'next/cache'
import { getNotionClient } from '@/lib/notion/client'
import { blocksToMarkdown } from '@/lib/notion/blocks-to-md'
import { createClient } from '@/lib/supabase/server'
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

type NotionPropertyValue =
  | { type: 'title'; title: Array<{ plain_text: string }> }
  | { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'multi_select'; multi_select: Array<{ name: string }> }
  | { type: 'number'; number: number | null }
  | { type: 'checkbox'; checkbox: boolean }

function extractProperty(prop: NotionPropertyValue | undefined): unknown {
  if (!prop) return null
  switch (prop.type) {
    case 'title':
      return prop.title.map((t) => t.plain_text).join('')
    case 'rich_text':
      return prop.rich_text.map((t) => t.plain_text).join('')
    case 'select':
      return prop.select?.name ?? null
    case 'multi_select':
      return prop.multi_select.map((s) => s.name)
    case 'number':
      return prop.number
    case 'checkbox':
      return prop.checkbox
    default:
      return null
  }
}

export async function syncDatabase(referenceDatabaseId: string): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  const supabase = await createClient()

  const { data: dbRecord, error: dbError } = await supabase
    .from('ReferenceDatabase')
    .select('*')
    .eq('id', referenceDatabaseId)
    .single()

  if (dbError || !dbRecord) {
    return { success: false, synced: 0, error: 'ReferenceDatabase not found' }
  }

  let cursor: string | undefined = undefined
  const pages: Array<{
    id: string
    properties: Record<string, NotionPropertyValue>
  }> = []

  // NotionのdatabaseIdはハイフンあり形式に正規化
  const rawId = dbRecord.notionDatabaseId.replace(/-/g, '')
  const normalizedDatabaseId = [
    rawId.slice(0, 8),
    rawId.slice(8, 12),
    rawId.slice(12, 16),
    rawId.slice(16, 20),
    rawId.slice(20),
  ].join('-')

  try {
    const notion = getNotionClient()
    do {
      const response = await notion.databases.query({
        database_id: normalizedDatabaseId,
        start_cursor: cursor,
        page_size: 100,
        filter: {
          property: 'Publish',
          checkbox: { equals: true },
        },
      })
      for (const page of response.results) {
        if ('properties' in page) {
          pages.push(
            page as { id: string; properties: Record<string, NotionPropertyValue> }
          )
        }
      }
      cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
    } while (cursor)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Notion query error:', message)
    return { success: false, synced: 0, error: `Notion API error: ${message}` }
  }

  let synced = 0

  for (const page of pages) {
    const props = page.properties
    const title = (extractProperty(props['Title'] as NotionPropertyValue) as string) ?? ''
    const description = extractProperty(props['Description'] as NotionPropertyValue) as
      | string
      | null
    const command = extractProperty(props['Command'] as NotionPropertyValue) as
      | string
      | null
    const path = (extractProperty(props['Path'] as NotionPropertyValue) as string) ?? ''
    const techSlug =
      (extractProperty(props['Slug'] as NotionPropertyValue) as string) ?? ''
    const tags = (extractProperty(props['Tags'] as NotionPropertyValue) as string[]) ?? []
    const categoryRaw = extractProperty(props['Category'] as NotionPropertyValue)
    const category = Array.isArray(categoryRaw)
      ? (categoryRaw[0] as string) ?? null
      : (categoryRaw as string | null)
    const level = extractProperty(props['Level'] as NotionPropertyValue) as string | null
    const no = extractProperty(props['No'] as NotionPropertyValue) as number | null
    const isFree = (extractProperty(props['Free'] as NotionPropertyValue) as boolean) ?? false

    const referenceData = {
      id: crypto.randomUUID(),
      notionPageId: page.id,
      referenceDatabaseId,
      title,
      description,
      command,
      path,
      techSlug,
      tags,
      category,
      level,
      no,
      isPublished: true,
      isFree,
      syncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from('Reference')
      .upsert(referenceData, { onConflict: 'notionPageId' })

    if (upsertError) {
      console.error('Reference upsert error:', upsertError)
      continue
    }

    // Fetch and cache page blocks
    try {
      const blocksResponse = await getNotionClient().blocks.children.list({
        block_id: page.id,
        page_size: 100,
      })

      const blocks = blocksResponse.results.filter(
        (b): b is BlockObjectResponse => 'type' in b
      )

      // Fetch child blocks for any block that has children
      // (table rows, list-item descriptions, toggle content, etc.)
      const childrenMap = new Map<string, BlockObjectResponse[]>()
      for (const block of blocks) {
        if (block.has_children) {
          try {
            const childResponse = await getNotionClient().blocks.children.list({ block_id: block.id })
            const children = childResponse.results.filter(
              (b): b is BlockObjectResponse => 'type' in b
            )
            childrenMap.set(block.id, children)
          } catch (childErr) {
            console.error(`Failed to fetch children for block ${block.id}:`, childErr)
          }
        }
      }

      const markdown = blocksToMarkdown(blocks, childrenMap)

      await supabase.from('ReferencePageCache').upsert(
        {
          id: crypto.randomUUID(),
          notionPageId: page.id,
          content: { markdown, blocks },
          syncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { onConflict: 'notionPageId' }
      )
    } catch (err) {
      console.error(`Failed to cache blocks for page ${page.id}:`, err)
    }

    synced++
  }

  revalidateTag('reference-technologies', 'default')
  revalidateTag('free-references', 'default')

  return { success: true, synced }
}

export async function syncAllDatabases(): Promise<{
  success: boolean
  results: Array<{ id: string; name: string; synced: number; error?: string }>
}> {
  const supabase = await createClient()

  const { data: databases, error } = await supabase
    .from('ReferenceDatabase')
    .select('*')

  if (error || !databases) {
    return { success: false, results: [] }
  }

  const results: Array<{ id: string; name: string; synced: number; error?: string }> = []

  for (const db of databases) {
    const result = await syncDatabase(db.id)
    results.push({
      id: db.id,
      name: db.name,
      synced: result.synced,
      error: result.error,
    })
  }

  return { success: true, results }
}

export async function createReferenceDatabase(data: {
  notionDatabaseId: string
  slug: string
  name: string
  description?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('ReferenceDatabase').insert({
    id: crypto.randomUUID(),
    notionDatabaseId: data.notionDatabaseId,
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  if (error) {
    console.error('createReferenceDatabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deleteReferenceDatabase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('ReferenceDatabase').delete().eq('id', id)

  if (error) {
    console.error('deleteReferenceDatabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function upsertReferenceTechnology(data: {
  id?: string
  slug: string
  name: string
  description?: string
  iconUrl?: string
  sortOrder?: number
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const payload = {
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    iconUrl: data.iconUrl ?? null,
    sortOrder: data.sortOrder ?? 0,
    updatedAt: new Date().toISOString(),
  }

  if (data.id) {
    const { error } = await supabase
      .from('ReferenceTechnology')
      .update(payload)
      .eq('id', data.id)

    if (error) {
      console.error('upsertReferenceTechnology update error:', error)
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabase.from('ReferenceTechnology').insert({
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
    })

    if (error) {
      console.error('upsertReferenceTechnology insert error:', error)
      return { success: false, error: error.message }
    }
  }

  revalidateTag('reference-technologies', 'default')
  return { success: true }
}
