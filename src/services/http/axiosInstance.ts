import axios from 'axios'

import { env } from '@/config/env'
import { attachRequestToken } from '@/services/http/request.interceptor'
import {
  handleResponseError,
  handleResponseSuccess,
} from '@/services/http/response.interceptor'

export const axiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 20_000,
})

axiosInstance.interceptors.request.use(attachRequestToken)
axiosInstance.interceptors.response.use(handleResponseSuccess, handleResponseError)
