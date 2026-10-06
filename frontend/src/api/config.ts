export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const STORAGE_KEYS = {
  TOKEN: 'lab_auth_token',
  REFRESH_TOKEN: 'lab_refresh_token',
  USER: 'lab_auth_user'
} as const
