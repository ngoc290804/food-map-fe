import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    skipAuthRedirect?: boolean
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean
    skipAuthRedirect?: boolean
  }
}
