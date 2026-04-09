import { STORAGE_KEY } from '@/config/storage-key'

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN)
}

export function saveAccessToken(token: string) {
  localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token)
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN)
}
