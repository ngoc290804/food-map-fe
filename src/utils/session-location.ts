import { STORAGE_KEY } from '@/config/storage-key'

const USER_LOCATION_TTL_MS = 30 * 60 * 1000

export type UserSessionLocation = {
  accuracy: number | null
  capturedAt: string
  latitude: number
  longitude: number
}

export function saveUserSessionLocation(location: UserSessionLocation) {
  sessionStorage.setItem(STORAGE_KEY.USER_LOCATION, JSON.stringify(location))
}

export function markLocationPromptPending() {
  sessionStorage.setItem(STORAGE_KEY.LOCATION_PROMPT_PENDING, 'true')
}

export function hasLocationPromptPending() {
  return sessionStorage.getItem(STORAGE_KEY.LOCATION_PROMPT_PENDING) === 'true'
}

export function clearLocationPromptPending() {
  sessionStorage.removeItem(STORAGE_KEY.LOCATION_PROMPT_PENDING)
}

export function getUserSessionLocation() {
  const rawValue = sessionStorage.getItem(STORAGE_KEY.USER_LOCATION)

  if (!rawValue) {
    return null
  }

  try {
    const location = JSON.parse(rawValue) as UserSessionLocation
    const capturedAt = new Date(location.capturedAt).getTime()

    if (!Number.isFinite(capturedAt) || Date.now() - capturedAt > USER_LOCATION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY.USER_LOCATION)

      return null
    }

    return location
  } catch {
    sessionStorage.removeItem(STORAGE_KEY.USER_LOCATION)

    return null
  }
}

export function clearUserSessionLocation() {
  sessionStorage.removeItem(STORAGE_KEY.USER_LOCATION)
}

export function clearUserLocationSessionData() {
  clearLocationPromptPending()
  clearUserSessionLocation()
}
