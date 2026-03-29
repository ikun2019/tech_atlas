import ky from 'ky'
import { createClient } from '@/lib/supabase/client'

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          request.headers.set('Authorization', `Bearer ${session.access_token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.refreshSession()
          if (session?.access_token) {
            request.headers.set('Authorization', `Bearer ${session.access_token}`)
            return ky(request)
          }
        }
      },
    ],
  },
})
