import type { InternalAxiosRequestConfig } from 'axios'

import { getAccessToken } from '@/utils/token'

export function attachRequestToken(config: InternalAxiosRequestConfig) {
  if (config.skipAuth) {
    return config
  }

  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}
