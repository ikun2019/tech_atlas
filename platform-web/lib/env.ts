import { z } from 'zod'

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is needed'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is needed'),
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is needed'),
  NEXT_PUBLIC_APP_URL: z.string().min(1, 'NEXT_PUBLIC_APP_URL is needed'),
  API_INTERNAL_URL: z.string().optional().default('http://api:4000/api/v1'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error('Missing required environment variables: ' + parsed.error.message)
}

export const env = Object.freeze(parsed.data)
