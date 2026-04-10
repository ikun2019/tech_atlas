import { z } from 'zod'
import fs from 'node:fs'
// IMPORTANT:
// Do NOT validate `process.env` as a whole object.
// On the client, Next.js inlines `process.env.NEXT_PUBLIC_*` ONLY when accessed directly.
// If you pass `process.env` around, those values are not inlined and end up `undefined`.

export function readEnvOrFile(name: string): string {
  const file = process.env[`${name}_FILE`]
  const value = (file ? fs.readFileSync(file, 'utf-8') : (process.env[name] ?? '')).trim()
  if (!value) throw new Error(`Missing ${name} or ${name}_FILE`)
  return value
}

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is needed'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is needed'),
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is needed'),
  NEXT_PUBLIC_APP_URL: z.string().min(1, 'NEXT_PUBLIC_APP_URL is needed'),
  // Server-only / optional
  API_INTERNAL_URL: z.string().optional().default('http://api:4000/api/v1'),
})

// Build a plain object by reading env vars explicitly.
// This allows NEXT_PUBLIC_* to be inlined into client bundles.
const rawEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
} as const

const parsed = EnvSchema.safeParse(rawEnv)

if (!parsed.success) {
  throw new Error('Missing required environment variables: ' + parsed.error.message)
}

const raw = parsed.data

export const env = Object.freeze({
  NEXT_PUBLIC_SUPABASE_URL: raw.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_API_URL: raw.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: raw.NEXT_PUBLIC_APP_URL,
  API_INTERNAL_URL: raw.API_INTERNAL_URL,
  get NOTION_API_KEY(): string {
    return readEnvOrFile('NOTION_API_KEY')
  },
})
