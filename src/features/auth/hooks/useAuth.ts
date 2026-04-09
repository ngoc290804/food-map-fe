import { useNavigate } from 'react-router-dom'

import { STORAGE_KEY } from '@/config/storage-key'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { storage } from '@/utils/storage'
import { saveAccessToken } from '@/utils/token'

export function useAuth() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()

  const signIn = () => {
    const nextUser = {
      id: 'u-01',
      name: 'Nguyen Van A',
      email: 'admin@foodmap.local',
    }

    saveAccessToken('demo-access-token')
    storage.set(STORAGE_KEY.USER_PROFILE, nextUser)
    setUser(nextUser)
    navigate('/', { replace: true })
  }

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return {
    user,
    signIn,
    signOut,
  }
}
