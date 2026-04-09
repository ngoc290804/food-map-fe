import type { ItemType } from 'antd/es/menu/interface'

import type { AppRouteItem } from '@/types/route.type'

export function getMenuItemsFromRoutes(routes: AppRouteItem[]): ItemType[] {
  return routes
    .filter((route) => !route.meta.hidden && route.meta.layout === 'main')
    .map((route) => ({
      key: route.path,
      icon: route.meta.icon,
      label: route.meta.title,
      children: route.children ? getMenuItemsFromRoutes(route.children) : undefined,
    }))
}
