import { z } from 'zod'

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is needed'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is needed'),
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is needed'),
  NEXT_PUBLIC_APP_URL: z.string().min(1, 'NEXT_PUBLIC_APP_URL is needed'),
})

const parsed = ClientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

if (!parsed.success) {
  throw new Error('Missing required environment variables: ' + parsed.error.message)
}

export const clientEnv = Object.freeze(parsed.data)
