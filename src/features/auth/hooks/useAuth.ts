import { useCallback, useState } from 'react'
import {
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resendEmailVerificationRequest,
  resendMfaRequest,
  resetPasswordRequest,
  verifyEmailRequest,
  verifyMfaRequest,
} from '../api'
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResult,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from '../types'
import { useAuthStore } from '../../../store/authStore'

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const pendingMfaChallenge = useAuthStore((state) => state.pendingMfaChallenge)
  const pendingEmailVerification = useAuthStore(
    (state) => state.pendingEmailVerification,
  )
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setPendingMfaChallenge = useAuthStore(
    (state) => state.setPendingMfaChallenge,
  )
  const setPendingEmailVerification = useAuthStore(
    (state) => state.setPendingEmailVerification,
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResult> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await loginRequest(payload)
        if (result.type === 'SESSION') {
          setSession(result.session.token, result.session.user)
        } else {
          setPendingMfaChallenge(result.challenge)
        }
        return result
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Login failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [setSession, setPendingMfaChallenge],
  )

  const verifyMfa = useCallback(
    async (code: string, challengeTokenOverride?: string) => {
      setIsLoading(true)
      setError(null)

      const tokenToUse =
        challengeTokenOverride || pendingMfaChallenge?.challengeToken

      if (!tokenToUse) {
        const message = 'No active challenge found. Please sign in again.'
        setError(message)
        setIsLoading(false)
        throw new Error(message)
      }

      try {
        const session = await verifyMfaRequest({
          challengeToken: tokenToUse,
          code,
        })
        setSession(session.token, session.user)
        setPendingMfaChallenge(null)
        return session
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : 'MFA verification failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [pendingMfaChallenge, setSession, setPendingMfaChallenge],
  )

  const resendMfa = useCallback(
    async (challengeTokenOverride?: string) => {
      setIsLoading(true)
      setError(null)

      const tokenToUse =
        challengeTokenOverride || pendingMfaChallenge?.challengeToken

      if (!tokenToUse) {
        const message = 'No active challenge found. Please sign in again.'
        setError(message)
        setIsLoading(false)
        throw new Error(message)
      }

      try {
        const result = await resendMfaRequest({ challengeToken: tokenToUse })
        return result
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Failed to resend verification code'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [pendingMfaChallenge],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await registerRequest(payload)
        setPendingEmailVerification(payload.email)
        return result
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : 'Registration failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [setPendingEmailVerification],
  )

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        return await forgotPasswordRequest(payload)
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Password reset request failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        return await resetPasswordRequest(payload)
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : 'Password reset failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const verifyEmail = useCallback(
    async (payload: VerifyEmailPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await verifyEmailRequest(payload)
        if (result.session) {
          setSession(result.session.token, result.session.user)
        }
        setPendingEmailVerification(null)
        return result
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : 'Email verification failed'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [setSession, setPendingEmailVerification],
  )

  const resendEmailVerification = useCallback(
    async (email: string) => {
      setIsLoading(true)
      setError(null)

      try {
        return await resendEmailVerificationRequest(email)
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Failed to resend verification code'
        setError(message)
        throw cause
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    pendingMfaChallenge,
    pendingEmailVerification,
    setPendingMfaChallenge,
    setPendingEmailVerification,
    login,
    verifyMfa,
    resendMfa,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    logout,
    isLoading,
    error,
    clearError,
  }
}
