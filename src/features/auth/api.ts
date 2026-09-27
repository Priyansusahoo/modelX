import { apiClient } from '../../lib/apiClient'
import { createUserFromToken } from '../../lib/jwt'
import type {
  AuthResponse,
  AuthSession,
  LoginPayload,
  RegisterPayload,
} from './types'

export async function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiClient<AuthResponse>('/v1/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const user = createUserFromToken(response.token, payload.email)
  return {
    token: response.token,
    user,
  }
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthSession> {
  const response = await apiClient<AuthResponse>('/v1/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      role: payload.role ?? 'USER',
    }),
  })

  const fullName = `${payload.firstName} ${payload.lastName}`.trim()
  const user = createUserFromToken(response.token, payload.email, fullName)

  return {
    token: response.token,
    user,
  }
}
