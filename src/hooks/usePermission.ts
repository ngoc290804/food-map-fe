import { APP_AUTHORITIES } from '@/config/constants'

export function usePermission() {
  return {
    hasRole: (role: string) => role === APP_AUTHORITIES.ADMIN,
  }
}
