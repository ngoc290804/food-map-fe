import { useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams])

  return {
    query,
    setQuery: (nextQuery: Record<string, string>) => setSearchParams(nextQuery),
  }
}
