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
