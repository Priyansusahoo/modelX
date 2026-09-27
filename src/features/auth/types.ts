export type UserRole = 'USER' | 'ADMIN'

export type User = {
  id?: string
  email: string
  name: string
  role?: UserRole
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: UserRole
}

export type AuthResponse = {
  token: string
  message: string
}

export type AuthSession = {
  token: string
  user: User
}

export type MfaChallenge = {
  mfaRequired: boolean
  challengeToken: string
  channel: 'EMAIL' | 'SMS' | string
  maskedDestination: string
  message: string
  email?: string
}

export type LoginResult =
  | { type: 'SESSION'; session: AuthSession }
  | { type: 'MFA_REQUIRED'; challenge: MfaChallenge }

export type RegisterResult = {
  message: string
  email: string
  verificationRequired: boolean
  session?: AuthSession
}

export type MfaVerificationPayload = {
  challengeToken: string
  code: string
}

export type MfaResendPayload = {
  challengeToken: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  email: string
  code: string
  newPassword: string
}

export type VerifyEmailPayload = {
  email: string
  code: string
}
