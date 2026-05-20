import { useNavigate } from 'react-router-dom'

import { STORAGE_KEY } from '@/config/storage-key'
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
  type UserInfoDto,
} from '@/features/auth/services/auth.service'
import { clearDistanceCache } from '@/features/restaurant/services/distance.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { clearUserLocationSessionData } from '@/utils/session-location'
import { storage } from '@/utils/storage'
import { saveAccessToken } from '@/utils/token'

type AuthActionOptions = {
  redirect?: boolean
}

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

  const signIn = async (values: LoginPayload, options: AuthActionOptions = {}) => {
    const response = await authService.login(values)

    applyAuthenticatedUser(response.accessToken, response.user)

    if (options.redirect !== false) {
      navigate('/', { replace: true })
    }

    return response
  }

  const signUp = async (values: RegisterPayload, options: AuthActionOptions = {}) => {
    const response = await authService.register(values)

    applyAuthenticatedUser(response.accessToken, response.user)

    if (options.redirect !== false) {
      navigate('/', { replace: true })
    }

    return response
  }

  const refreshUser = async () => {
    const nextUser = await authService.me()

    saveUser(nextUser)
    setUser(nextUser)

    return nextUser
  }

  const signOut = () => {
    clearUserLocationSessionData()
    clearDistanceCache()
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
