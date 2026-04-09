import type { InternalAxiosRequestConfig } from 'axios'

import { getAccessToken } from '@/utils/token'

export function attachRequestToken(config: InternalAxiosRequestConfig) {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}
