import { lazy } from 'react'

import { foodFilterMenuOptions } from '@/config/food-filter.config'
import type { AppRouteItem } from '@/types/route.type'

const CuaHangListPage = lazy(
  () => import('@/features/restaurant/pages/CuaHangListPage'),
)
const CuaHangDetailPage = lazy(
  () => import('@/features/restaurant/pages/CuaHangDetailPage'),
)
const QuanLyCuaHangPage = lazy(
  () => import('@/features/restaurant/pages/QuanLyCuaHangPage'),
)
const DangNhapFormPage = lazy(() => import('@/features/auth/pages/DangNhapFormPage'))
const TaiKhoanDetailPage = lazy(() => import('@/features/auth/pages/TaiKhoanDetailPage'))
const KhongTimThayPage = lazy(() => import('@/features/system/pages/KhongTimThayPage'))

const categoryRoutes: AppRouteItem[] = foodFilterMenuOptions.map((option) => ({
  key: option.value,
  path: option.path,
  element: CuaHangListPage,
  meta: {
    title: option.label,
    layout: 'main',
    breadcrumb: false,
  },
}))

export const appRoutes: AppRouteItem[] = [
  ...categoryRoutes,
  {
    key: 'restaurant-management',
    path: '/quan-ly-quan-an',
    element: QuanLyCuaHangPage,
    meta: {
      title: 'Quản lý quán ăn',
      hidden: true,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'store-detail',
    path: '/cua-hang/:id',
    element: CuaHangDetailPage,
    meta: {
      title: 'Chi tiết cửa hàng',
      hidden: true,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'profile',
    path: '/profile',
    element: TaiKhoanDetailPage,
    meta: {
      title: 'Thông tin tài khoản',
      hidden: true,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'login',
    path: '/login',
    element: DangNhapFormPage,
    meta: {
      title: 'Đăng nhập',
      hidden: true,
      layout: 'auth',
      breadcrumb: false,
    },
  },
  {
    key: 'not-found',
    path: '*',
    element: KhongTimThayPage,
    meta: {
      title: 'Không tìm thấy trang',
      hidden: true,
      layout: 'blank',
      breadcrumb: false,
    },
  },
]
