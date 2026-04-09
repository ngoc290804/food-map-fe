import type { AppRouteItem } from '@/types/route.type'

function normalizePath(path: string) {
  return path.replace(/:[^/]+/g, '[param]').replace(/\*/g, '')
}

export function getBreadcrumbItems(routes: AppRouteItem[], pathname: string) {
  const normalizedPath = pathname
    .split('/')
    .map((segment) => (segment ? '[param]' : ''))
    .join('/')

  return routes
    .filter((route) => {
      if (!route.meta.breadcrumb || route.path === '*') {
        return false
      }

      const routePath = normalizePath(route.path)

      return routePath === normalizedPath || pathname.startsWith(route.path.split('/:')[0])
    })
    .map((route) => ({ title: route.meta.title }))
}
