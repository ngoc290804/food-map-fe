import { useEffect } from 'react'

import { useLocation, useSearchParams } from 'react-router-dom'

import { env } from '@/config/env'
import {
  FOOD_DETAIL_QUERY_KEY,
  foodFilterMenuOptions,
  getFoodDetailByValue,
  getFoodFilterByPath,
} from '@/config/food-filter.config'

function getPageTitle(pathname: string, detailValue: string | null) {
  if (pathname === '/login') {
    return 'Đăng nhập'
  }

  if (pathname === '/profile') {
    return 'Thông tin tài khoản'
  }

  if (pathname === '/quan-ly-quan-an') {
    return 'Quản lý quán ăn'
  }

  if (pathname.startsWith('/cua-hang/')) {
    return 'Chi tiết cửa hàng'
  }

  const detail = getFoodDetailByValue(detailValue)
  if (detail) {
    return detail.label
  }

  if (!foodFilterMenuOptions.some((option) => option.path === pathname)) {
    return 'Không tìm thấy trang'
  }

  return getFoodFilterByPath(pathname).label
}

function PageTitle() {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const pageTitle = getPageTitle(
      location.pathname,
      searchParams.get(FOOD_DETAIL_QUERY_KEY),
    )

    document.title = pageTitle === 'Trang chủ' ? env.APP_NAME : `${pageTitle} | ${env.APP_NAME}`
  }, [location.pathname, searchParams])

  return null
}

export default PageTitle
