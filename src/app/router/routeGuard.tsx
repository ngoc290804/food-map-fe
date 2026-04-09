import type { PropsWithChildren } from 'react'

import { Navigate, useLocation } from 'react-router-dom'

import { getAccessToken } from '@/utils/token'

function RouteGuard({ children }: PropsWithChildren) {
  const location = useLocation()

  if (!getAccessToken()) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  return children
}

export default RouteGuard
