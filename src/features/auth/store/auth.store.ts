import { create } from 'zustand'

import { STORAGE_KEY } from '@/config/storage-key'
import { clearAuth } from '@/utils/token'
import { storage } from '@/utils/storage'

export type UserInfo = {
  id: string
  name: string
  email: string
}

type AuthState = {
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.get<UserInfo>(STORAGE_KEY.USER_PROFILE),
  setUser: (user) => set({ user }),
  logout: () => {
    clearAuth()
    storage.remove(STORAGE_KEY.USER_PROFILE)
    set({ user: null })
  },
}))
