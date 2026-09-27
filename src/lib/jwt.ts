import type { User } from '../features/auth/types'

export interface JwtPayload {
  sub?: string
  role?: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  return Date.now() >= payload.exp * 1000
}

export function createUserFromToken(token: string, fallbackEmail?: string, fallbackName?: string): User {
  const claims = decodeJwtPayload(token)
  const email = (claims?.sub as string) || fallbackEmail || 'user@modelx.store'

  let name = fallbackName
  if (!name) {
    const username = email.split('@')[0]
    name = username.charAt(0).toUpperCase() + username.slice(1)
  }

  return {
    email,
    name,
    role: (claims?.role as User['role']) ?? 'USER',
  }
}
