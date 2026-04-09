export function cleanObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, current]) => current !== undefined && current !== ''),
  ) as Partial<T>
}
