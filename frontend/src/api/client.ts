import { API_BASE_URL, STORAGE_KEYS } from '@api/config'

import type { ApiError } from '@projectTypes/api'

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
}

function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth, headers, ...restOptions } = options
  const url = buildUrl(path, params)

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((headers as Record<string, string>) || {})
  }

  if (!skipAuth) {
    const token = getAuthToken()
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

export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' })
}

export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

export function del<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' })
}

export const apiClient = {
  request,
  get,
  post,
  put,
  delete: del
}

export default apiClient

