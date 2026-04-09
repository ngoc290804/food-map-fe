export const storage = {
  get: <T>(key: string) => {
    const rawValue = localStorage.getItem(key)

    return rawValue ? (JSON.parse(rawValue) as T) : null
  },
  set: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string) => {
    localStorage.removeItem(key)
  },
}
