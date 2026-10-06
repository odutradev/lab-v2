import { useState, useEffect, useCallback, type ReactNode } from 'react'

import { STORAGE_KEYS } from '@api/config'
import { signInAction, signUpAction } from '@actions/users/auth'
import { getProfileAction } from '@actions/users/profile'
import AuthContext from './context'

import type { SignInPayload, SignUpPayload } from '@actions/users/auth/types'
import type { UserProfile } from '@projectTypes/user'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setToken(null)
    setUser(null)
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getProfileAction()
      setUser(profile)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
    } catch {
      logout()
    }
  }, [logout])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      if (storedToken) {
        setToken(storedToken)
        await fetchProfile()
      }
      setIsLoading(false)
    }

    initAuth()
  }, [fetchProfile])

  const login = async (credentials: SignInPayload) => {
    const response = await signInAction(credentials)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
    setToken(response.token)

    const profile = await getProfileAction()
    setUser(profile)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
  }

  const register = async (data: SignUpPayload) => {
    const response = await signUpAction(data)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
    setToken(response.token)

    const profile = await getProfileAction()
    setUser(profile)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
  }

  const refreshUser = async () => {
    if (token) {
      await fetchProfile()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
