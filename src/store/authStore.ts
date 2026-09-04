import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole | null
  isLoading: boolean
  /** Whether the user has enrolled MFA (TOTP) on their account */
  mfaEnrolled: boolean
  setAuth: (user: User | null, session: Session | null) => void
  setRole: (role: UserRole | null) => void
  setLoading: (loading: boolean) => void
  setMfaEnrolled: (enrolled: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      role: null,
      isLoading: true,
      mfaEnrolled: false,
      setAuth: (user, session) => set({ user, session }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),
      setMfaEnrolled: (mfaEnrolled) => set({ mfaEnrolled }),
      clearAuth: () => set({ user: null, session: null, role: null, mfaEnrolled: false }),
    }),
    {
      name: 'akq-auth',
      partialize: (state) => ({ role: state.role, mfaEnrolled: state.mfaEnrolled }),
    }
  )
)
