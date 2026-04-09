import type { ComponentType, LazyExoticComponent, ReactNode } from 'react'

export type AppRouteMeta = {
  title: string
  icon?: ReactNode
  hidden?: boolean
  requiresAuth?: boolean
  roles?: string[]
  layout?: 'main' | 'auth' | 'blank'
  breadcrumb?: boolean
}

export type AppRouteItem = {
  key: string
  path: string
  element?: LazyExoticComponent<ComponentType> | ComponentType
  meta: AppRouteMeta
  children?: AppRouteItem[]
}
