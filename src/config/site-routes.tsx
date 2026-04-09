import { lazy } from 'react'

import {
  AppstoreOutlined,
  CoffeeOutlined,
  FireOutlined,
  GiftOutlined,
  MedicineBoxOutlined,
  ShoppingOutlined,
  SkinOutlined,
} from '@ant-design/icons'
import { Navigate } from 'react-router-dom'

import type { AppRouteItem } from '@/types/route.type'

const CuaHangListPage = lazy(
  () => import('@/features/restaurant/pages/CuaHangListPage'),
)
const CuaHangDetailPage = lazy(
  () => import('@/features/restaurant/pages/CuaHangDetailPage'),
)
const KhongTimThayPage = lazy(() => import('@/features/system/pages/KhongTimThayPage'))

export const appRoutes: AppRouteItem[] = [
  {
    key: 'home',
    path: '/',
    element: () => <Navigate replace to="/do-an" />,
    meta: {
      title: 'Trang chủ',
      hidden: true,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'food',
    path: '/do-an',
    element: CuaHangListPage,
    meta: {
      title: 'Đồ ăn',
      icon: <FireOutlined />,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'grocery',
    path: '/thuc-pham',
    element: CuaHangListPage,
    meta: {
      title: 'Thực phẩm',
      icon: <ShoppingOutlined />,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'beer',
    path: '/ruou-bia',
    element: CuaHangListPage,
    meta: {
      title: 'Rượu bia',
      icon: <CoffeeOutlined />,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'flower',
    path: '/hoa',
    element: CuaHangListPage,
    meta: {
      title: 'Hoa',
      icon: <GiftOutlined />,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'supermarket',
    path: '/sieu-thi',
    element: CuaHangListPage,
    meta: {
      title: 'Siêu thị',
      icon: <AppstoreOutlined />,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'medicine',
    path: '/thuoc',
    element: CuaHangListPage,
    meta: {
      title: 'Thuốc',
      icon: <MedicineBoxOutlined />,
      layout: 'main',
      breadcrumb: false,
    },
  },
  {
    key: 'pet',
    path: '/thu-cung',
    element: CuaHangListPage,
    meta: {
      title: 'Thú cưng',
      icon: <SkinOutlined />,
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
