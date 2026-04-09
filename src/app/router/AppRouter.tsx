import { BrowserRouter, useRoutes } from 'react-router-dom'

import { buildRouteObjects } from '@/app/router/routeHelper'
import { appRoutes } from '@/config/site-routes'

function RouterContent() {
  return useRoutes(buildRouteObjects(appRoutes))
}

function AppRouter() {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  )
}

export default AppRouter
