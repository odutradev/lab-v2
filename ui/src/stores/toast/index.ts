import { create } from 'zustand'

import type { ToastMessage, ToastState, ToastType } from './types'

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },

  showToast: (message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { id, type, title, message }

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
      }))
    }, 4000)
  }
}))

export default useToastStore
