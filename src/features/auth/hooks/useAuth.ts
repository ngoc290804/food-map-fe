import { useNavigate } from 'react-router-dom'

import { STORAGE_KEY } from '@/config/storage-key'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { storage } from '@/utils/storage'
import { saveAccessToken } from '@/utils/token'

type LoginFormValues = {
  email?: string
  nickname?: string
}

export function useAuth() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()

  const signIn = (values?: LoginFormValues) => {
    const email = values?.email || 'admin@foodmap.local'
    const nextUser = {
      id: 'u-01',
      name: values?.nickname?.trim() || email.split('@')[0] || 'Nguyen Van A',
      email,
    }

    saveAccessToken('demo-access-token')
    storage.set(STORAGE_KEY.USER_PROFILE, nextUser)
    setUser(nextUser)
    navigate('/', { replace: true })
  }

  const signOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  return {
    user,
    signIn,
    signOut,
  }
}
