import { Suspense } from 'react'

import { Navigate, type RouteObject } from 'react-router-dom'

import DangTai from '@/components/common/DangTai'
import BoCucXacThuc from '@/layouts/BoCucXacThuc'
import BoCucChinh from '@/layouts/BoCucChinh'
import type { AppRouteItem } from '@/types/route.type'

function renderElement(route: AppRouteItem) {
  const Element = route.element
  const page = Element ? <Element /> : <Navigate replace to="/" />
  const withSuspense = <Suspense fallback={<DangTai fullscreen />}>{page}</Suspense>

  switch (route.meta.layout) {
    case 'auth':
      return <BoCucXacThuc>{withSuspense}</BoCucXacThuc>
    case 'blank':
      return withSuspense
    case 'main':
    default:
      return <BoCucChinh>{withSuspense}</BoCucChinh>
  }
}

export function buildRouteObjects(routes: AppRouteItem[]): RouteObject[] {
  return routes.map((route) => ({
    path: route.path,
    element: renderElement(route),
    children: route.children ? buildRouteObjects(route.children) : undefined,
  }))
}
