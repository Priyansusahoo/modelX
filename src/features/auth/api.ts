import { apiClient } from '../../lib/apiClient'
import { createUserFromToken } from '../../lib/jwt'
import type {
  AuthResponse,
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResult,
  MfaChallenge,
  MfaResendPayload,
  MfaVerificationPayload,
  RegisterPayload,
  RegisterResult,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from './types'

export async function loginRequest(payload: LoginPayload): Promise<LoginResult> {
  const response = await apiClient<
    AuthResponse & Partial<MfaChallenge> & { challenge_id?: string; challenge_token?: string }
  >('/v1/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // Detect MFA required response (can have mfaRequired or challengeToken/challenge_id)
  const token = response.token
  const isMfa = Boolean(
    response.mfaRequired ||
      response.challengeToken ||
      response.challenge_token ||
      (response as any).challengeId,
  )

  if (isMfa) {
    const challengeToken =
      response.challengeToken ||
      response.challenge_token ||
      (response as any).challengeId ||
      ''

    return {
      type: 'MFA_REQUIRED',
      challenge: {
        mfaRequired: true,
        challengeToken,
        channel: response.channel ?? 'EMAIL',
        maskedDestination: response.maskedDestination ?? (response as any).target_masked ?? payload.email,
        message: response.message ?? 'Two-factor authentication code sent.',
        email: payload.email,
      },
    }
  }

  if (!token) {
    throw new Error('Authentication failed: No token received from server')
  }

  const user = createUserFromToken(token, payload.email)
  return {
    type: 'SESSION',
    session: {
      token,
      user,
    },
  }
}

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await apiClient<
    AuthResponse & { verificationRequired?: boolean; email?: string }
  >('/v1/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      role: payload.role ?? 'USER',
    }),
  })

  let session: AuthSession | undefined
  if (response.token) {
    const fullName = `${payload.firstName} ${payload.lastName}`.trim()
    const user = createUserFromToken(response.token, payload.email, fullName)
    session = { token: response.token, user }
  }

  return {
    message: response.message || 'Verification code sent to your email address.',
    email: payload.email,
    verificationRequired: true,
    session,
  }
}

export async function verifyMfaRequest(payload: MfaVerificationPayload): Promise<AuthSession> {
  const response = await apiClient<AuthResponse>('/v1/api/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response?.token) {
    throw new Error('MFA verification failed: No authentication token received from server')
  }

  const user = createUserFromToken(response.token)
  return {
    token: response.token,
    user,
  }
}

export async function resendMfaRequest(payload: MfaResendPayload): Promise<{ message: string }> {
  return await apiClient<{ message: string }>('/v1/api/auth/mfa/resend', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function forgotPasswordRequest(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  return await apiClient<{ message: string }>('/v1/api/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function resetPasswordRequest(payload: ResetPasswordPayload): Promise<{ message: string }> {
  return await apiClient<{ message: string }>('/v1/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function verifyEmailRequest(payload: VerifyEmailPayload): Promise<{ message: string; session?: AuthSession }> {
  const response = await apiClient<AuthResponse & { message?: string }>('/v1/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  let session: AuthSession | undefined
  if (response.token) {
    const user = createUserFromToken(response.token, payload.email)
    session = { token: response.token, user }
  }

  return {
    message: response.message || 'Email successfully verified. Registration complete!',
    session,
  }
}

export async function resendEmailVerificationRequest(email: string): Promise<{ message: string }> {
  return await apiClient<{ message: string }>('/v1/api/auth/verify-email/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
