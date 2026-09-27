import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MfaChallenge, User } from '../features/auth/types'

type AuthState = {
  token: string | null
  user: User | null
  pendingMfaChallenge: MfaChallenge | null
  pendingEmailVerification: string | null
  setSession: (token: string, user: User) => void
  clearSession: () => void
  setPendingMfaChallenge: (challenge: MfaChallenge | null) => void
  setPendingEmailVerification: (email: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      pendingMfaChallenge: null,
      pendingEmailVerification: null,
      setSession: (token, user) => set({ token, user, pendingMfaChallenge: null }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          pendingMfaChallenge: null,
          pendingEmailVerification: null,
        }),
      setPendingMfaChallenge: (challenge) => set({ pendingMfaChallenge: challenge }),
      setPendingEmailVerification: (email) => set({ pendingEmailVerification: email }),
    }),
    {
      name: 'modelx-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        pendingEmailVerification: state.pendingEmailVerification,
      }),
    },
  ),
)
