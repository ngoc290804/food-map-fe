import type { AxiosRequestConfig } from 'axios'

import { axiosInstance } from '@/services/http/axiosInstance'

export const baseService = {
  get: async <T>(url: string, params?: Record<string, unknown>) => {
    const response = await axiosInstance.get<T>(url, { params })

    return response.data
  },
  post: async <T>(url: string, payload?: unknown) => {
    const response = await axiosInstance.post<T>(url, payload)

    return response.data
  },
  put: async <T>(url: string, payload?: unknown) => {
    const response = await axiosInstance.put<T>(url, payload)

    return response.data
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.delete<T>(url, config)

    return response.data
  },
}
