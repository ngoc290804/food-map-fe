import { BrowserRouter, useRoutes } from 'react-router-dom'

import { buildRouteObjects } from '@/app/router/routeHelper'
import PageTitle from '@/app/router/PageTitle'
import { appRoutes } from '@/config/site-routes'

function RouterContent() {
  return useRoutes(buildRouteObjects(appRoutes))
}

function AppRouter() {
  return (
    <BrowserRouter>
      <PageTitle />
      <RouterContent />
    </BrowserRouter>
  )
}

export default AppRouter
