import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { storageKeys } from '@assets/config'
import { signInAction, signUpAction } from '@actions/users/auth'
import { getProfileAction, updateHealthAction } from '@actions/users/profile'
import { createRawPersistStorage, readJson } from '@utils/functions/storage'
import useHealthStore from '@stores/health'

import type { SignInPayload, SignUpPayload } from '@actions/users/auth/types'
import type { UserProfile } from '@utils/types/user'
import type { AuthState } from '@stores/auth/types'

type PersistedAuthState = Pick<AuthState, 'token' | 'refreshToken' | 'user'>

const writeOrRemove = (key: string, value: string | null): void => {
  if (value) {
    localStorage.setItem(key, value)
    return
  }
  localStorage.removeItem(key)
}

const authStorage = createRawPersistStorage<PersistedAuthState>({
  read: () => ({
    token: localStorage.getItem(storageKeys.token),
    refreshToken: localStorage.getItem(storageKeys.refreshToken),
    user: readJson<UserProfile>(storageKeys.user)
  }),
  write: (state) => {
    writeOrRemove(storageKeys.token, state.token)
    writeOrRemove(storageKeys.refreshToken, state.refreshToken)
    writeOrRemove(storageKeys.user, state.user ? JSON.stringify(state.user) : null)
  },
  clear: () => {
    localStorage.removeItem(storageKeys.token)
    localStorage.removeItem(storageKeys.refreshToken)
    localStorage.removeItem(storageKeys.user)
  }
})

const syncProfileHealth = (profile: UserProfile) => {
  if (profile.health) {
    useHealthStore.getState().syncFromApi(profile.health)
    return
  }

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      initializeAuth: async () => {
        const storedToken = get().token
        if (!storedToken) {
          set({ token: null, user: null, isAuthenticated: false, isLoading: false })
          return
        }

        try {
          const profile = await getProfileAction()
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
        set({ token: response.token, refreshToken: response.refreshToken })

        const profile = await getProfileAction()
        syncProfileHealth(profile)

        set({
          token: response.token,
          user: profile,
          isAuthenticated: true
        })
      },

      register: async (data: SignUpPayload) => {
        const response = await signUpAction(data)
        set({ token: response.token, refreshToken: response.refreshToken })

        const profile = await getProfileAction()
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
          syncProfileHealth(profile)
          set({ user: profile, isAuthenticated: true })
        } catch {
          logout()
        }
      }
    }),
    {
      name: storageKeys.token,
      storage: authStorage,
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedAuthState
        return {
          ...currentState,
          ...persisted,
          isAuthenticated: !!persisted.token && !!persisted.user,
          isLoading: !!persisted.token
        }
      }
    }
  )
)

export default useAuthStore
