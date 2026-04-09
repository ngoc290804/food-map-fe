import { appRoutes } from '@/config/site-routes'
import { getMenuItemsFromRoutes } from '@/utils/menu'

export const appMenuItems = getMenuItemsFromRoutes(appRoutes)
