import { API_BASE_URL, STORAGE_KEYS } from '@api/config'

import type { ApiError } from '@projectTypes/api'

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
}

export class ApiHttpClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const url = new URL(`${this.baseUrl}${normalizedPath}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth, headers, ...restOptions } = options
    const url = this.buildUrl(path, params)

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((headers as Record<string, string>) || {})
    }

    if (!skipAuth) {
      const token = this.getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders
    })

    const isJson = response.headers.get('content-type')?.includes('application/json')
    const responseData = isJson ? await response.json() : null

    if (!response.ok) {
      const apiError: ApiError = {
        message: responseData?.error || responseData?.message || `Request failed with status ${response.status}`,
        status: response.status,
        details: responseData?.details
      }
      throw apiError
    }

    return responseData as T
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

const apiClient = new ApiHttpClient()

export default apiClient
