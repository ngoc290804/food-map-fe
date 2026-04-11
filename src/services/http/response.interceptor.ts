import type { AxiosError, AxiosResponse } from 'axios'

import { clearAuth } from '@/utils/token'

export function handleResponseSuccess<T>(response: AxiosResponse<T>) {
  return response
}

export function handleResponseError(error: AxiosError) {
  if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
    clearAuth()
    window.location.href = '/login'
  }

  return Promise.reject(error)
}
