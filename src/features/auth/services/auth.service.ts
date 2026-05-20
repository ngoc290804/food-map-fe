import type { ApiResponse } from '@/types/api.type'

import { endpoints } from '@/services/api/endpoints'
import { baseService } from '@/services/base/base.service'

export type UserInfoDto = {
  id: string
  username: string
  email: string
  fullName: string
  status?: string
  roles?: string[]
}

export type LoginPayload = {
  usernameOrEmail: string
  password: string
}

export type RegisterPayload = {
  username: string
  email: string
  fullName: string
  password: string
  confirmPassword: string
}

export type LoginResponseDto = {
  accessToken: string
  tokenType: string
  user: UserInfoDto
}

export type UpdateProfilePayload = {
  username: string
  fullName: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await baseService.post<ApiResponse<LoginResponseDto>>(
      `${endpoints.auth}/login`,
      payload,
      {
        skipAuth: true,
        skipAuthRedirect: true,
      },
    )

    return response.data
  },
  register: async (payload: RegisterPayload) => {
    const response = await baseService.post<ApiResponse<LoginResponseDto>>(
      `${endpoints.auth}/register`,
      payload,
      {
        skipAuth: true,
        skipAuthRedirect: true,
      },
    )

    return response.data
  },
  me: async () => {
    const response = await baseService.get<ApiResponse<UserInfoDto>>(
      `${endpoints.auth}/me`,
    )

    return response.data
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await baseService.put<ApiResponse<UserInfoDto>>(
      `${endpoints.auth}/me`,
      payload,
    )

    return response.data
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await baseService.put<ApiResponse<string>>(
      `${endpoints.auth}/password`,
      payload,
    )

    return response.data
  },
}
