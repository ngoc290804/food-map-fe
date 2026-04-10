import { create } from 'zustand'

import { STORAGE_KEY } from '@/config/storage-key'

export type AppTheme = 'light' | 'dark'

function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return localStorage.getItem(STORAGE_KEY.APP_THEME) === 'dark' ? 'dark' : 'light'
}

type AppState = {
  collapsed: boolean
  theme: AppTheme
  setCollapsed: (collapsed: boolean) => void
  setTheme: (theme: AppTheme) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  collapsed: false,
  theme: getInitialTheme(),
  setCollapsed: (collapsed) => set({ collapsed }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
