import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export interface ApiErrorResponse {
  detail?: string
  title?: string
  status?: number
  instance?: string
  type?: string
  message?: string
}

export class ApiError extends Error {
  status: number
  data?: ApiErrorResponse

  constructor(message: string, status: number, data?: ApiErrorResponse) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  // Don't override Content-Type if FormData is used (browser sets boundary automatically)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = useAuthStore.getState().token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    let errorData: ApiErrorResponse | undefined

    try {
      errorData = (await response.json()) as ApiErrorResponse
      if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.title) {
        errorMessage = errorData.title
      }
    } catch {
      // Non-JSON response body
    }

    throw new ApiError(errorMessage, response.status, errorData)
  }

  return response.json() as Promise<T>
}
