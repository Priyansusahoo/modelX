import { useCallback, useState } from 'react'
import { loginRequest, registerRequest } from '../api'
import type { LoginPayload, RegisterPayload } from '../types'
import { useAuthStore } from '../../../store/authStore'

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const session = await loginRequest(payload)
        setSession(session.token, session.user)
        return session
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Login failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [setSession],
  )

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await registerRequest(payload)
      return result
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Registration failed'
      setError(message)
      throw cause
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
  }
}
