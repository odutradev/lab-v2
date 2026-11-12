import { create } from 'zustand'

import { STORAGE_KEYS } from '@api/config'
import { signInAction, signUpAction } from '@actions/users/auth'
import { getProfileAction, updateHealthAction } from '@actions/users/profile'
import useHealthStore from '@stores/health'

import type { SignInPayload, SignUpPayload } from '@actions/users/auth/types'
import type { UserProfile } from '@projectTypes/user'
import type { AuthState } from './types'

const syncProfileHealth = (profile: UserProfile) => {
  if (profile.health) {
    useHealthStore.getState().syncFromApi(profile.health)
  } else {
    const local = useHealthStore.getState()
    if (local.profile.height || local.profile.age || local.weightHistory.length > 0) {
      updateHealthAction({
        height: local.profile.height,
        age: local.profile.age,
        characterId: local.profile.characterId,
        weightHistory: local.weightHistory,
        waterDailyMap: local.waterDailyMap,
        waterExtraTargetMap: local.waterExtraTargetMap,
        waterBottleMl: local.waterBottleMl,
        waterTargetBottles: local.waterTargetBottles
      }).catch(() => {})
    }
  }
}

const getInitialUser = (): UserProfile | null => {
  try {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
    return savedUser ? (JSON.parse(savedUser) as UserProfile) : null
  } catch {
    return null
  }
}

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken() && !!getInitialUser(),
  isLoading: !!getInitialToken(),

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    })
  },

  initializeAuth: async () => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (!storedToken) {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const profile = await getProfileAction()
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
      syncProfileHealth(profile)
      set({
        token: storedToken,
        user: profile,
        isAuthenticated: true,
        isLoading: false
      })
    } catch {
      get().logout()
    }
  },

  login: async (credentials: SignInPayload) => {
    const response = await signInAction(credentials)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)

    const profile = await getProfileAction()
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
    syncProfileHealth(profile)

    set({
      token: response.token,
      user: profile,
      isAuthenticated: true
    })
  },

  register: async (data: SignUpPayload) => {
    const response = await signUpAction(data)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)

    const profile = await getProfileAction()
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
    syncProfileHealth(profile)

    set({
      token: response.token,
      user: profile,
      isAuthenticated: true
    })
  },

  refreshUser: async () => {
    const { token, logout } = get()
    if (!token) return

    try {
      const profile = await getProfileAction()
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
      syncProfileHealth(profile)
      set({ user: profile, isAuthenticated: true })
    } catch {
      logout()
    }
  }
}))

export default useAuthStore
