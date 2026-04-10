import { Client } from '@notionhq/client'
import { env } from '@/lib/env'

export function getNotionClient(): Client {
  return new Client({ auth: env.NOTION_API_KEY })
}
