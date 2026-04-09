import { Breadcrumb } from 'antd'
import { useLocation } from 'react-router-dom'

import { appRoutes } from '@/config/site-routes'
import { getBreadcrumbItems } from '@/utils/route'

function DuongDanTrang() {
  const location = useLocation()
  const items = getBreadcrumbItems(appRoutes, location.pathname)

  return <Breadcrumb items={items} />
}

export default DuongDanTrang
