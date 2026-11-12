import axios, { AxiosError } from 'axios'

import { apiBaseUrl, storageKeys } from '@assets/config'

import type { ApiError } from '@utils/types/api'
import type { InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}

type ApiErrorBody = {
  error?: string
  message?: string
  code?: string
  details?: ApiError['details']
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
})

const attachAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (config.skipAuth) return config

  const token = localStorage.getItem(storageKeys.token)
  if (token) config.headers.set('Authorization', `Bearer ${token}`)

  return config
}

const toApiError = (error: AxiosError<ApiErrorBody>): Promise<never> => {
  const status = error.response?.status
  const responseData = error.response?.data

  if (!error.response) return Promise.reject({ message: error.message } satisfies ApiError)

  const apiError: ApiError = {
    message: responseData?.error || responseData?.message || `Request failed with status ${status}`,
    status,
    details: responseData?.details
  }

  return Promise.reject(apiError)
}

api.interceptors.request.use(attachAuthToken)
api.interceptors.response.use((response) => response, toApiError)

export default api
