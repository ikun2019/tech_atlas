import { create } from 'zustand'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/types/api'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  setUser: (user: SupabaseUser | null) => void
  setProfile: (profile: User | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ user: null, profile: null, isLoading: false }),
}))
