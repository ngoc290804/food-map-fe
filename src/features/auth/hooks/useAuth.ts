import { useNavigate } from 'react-router-dom'

import { STORAGE_KEY } from '@/config/storage-key'
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
  type UserInfoDto,
} from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { storage } from '@/utils/storage'
import { saveAccessToken } from '@/utils/token'

function saveUser(user: UserInfoDto) {
  storage.set(STORAGE_KEY.USER_PROFILE, user)
}

export function useAuth() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()

  const applyAuthenticatedUser = (token: string, nextUser: UserInfoDto) => {
    saveAccessToken(token)
    saveUser(nextUser)
    setUser(nextUser)
  }

  const signIn = async (values: LoginPayload) => {
    const response = await authService.login(values)

    applyAuthenticatedUser(response.accessToken, response.user)
    navigate('/', { replace: true })
  }

  const signUp = async (values: RegisterPayload) => {
    const response = await authService.register(values)

    applyAuthenticatedUser(response.accessToken, response.user)
    navigate('/', { replace: true })
  }

  const refreshUser = async () => {
    const nextUser = await authService.me()

    saveUser(nextUser)
    setUser(nextUser)

    return nextUser
  }

  const signOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  return {
    user,
    refreshUser,
    signIn,
    signUp,
    signOut,
  }
}
