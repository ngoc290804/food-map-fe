import { lazy } from 'react'

import {
  AppstoreOutlined,
  DashboardOutlined,
  MessageOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'

import type { AppRouteItem } from '@/types/route.type'

const TongQuanPage = lazy(() => import('@/features/dashboard/pages/TongQuanPage'))
const DangNhapFormPage = lazy(() => import('@/features/auth/pages/DangNhapFormPage'))
const TaiKhoanDetailPage = lazy(() => import('@/features/auth/pages/TaiKhoanDetailPage'))
const CuaHangListPage = lazy(
  () => import('@/features/restaurant/pages/CuaHangListPage'),
)
const CuaHangDetailPage = lazy(
  () => import('@/features/restaurant/pages/CuaHangDetailPage'),
)
const MonAnListPage = lazy(() => import('@/features/menu/pages/MonAnListPage'))
const TroChuyenAIPage = lazy(() => import('@/features/chatbot/pages/TroChuyenAIPage'))
const CamTruyCapPage = lazy(() => import('@/features/system/pages/CamTruyCapPage'))
const KhongTimThayPage = lazy(() => import('@/features/system/pages/KhongTimThayPage'))

export const appRoutes: AppRouteItem[] = [
  {
    key: 'dashboard',
    path: '/',
    element: TongQuanPage,
    meta: {
      title: 'Tổng quan',
      icon: <DashboardOutlined />,
      requiresAuth: true,
      layout: 'main',
      breadcrumb: true,
    },
  },
  {
    key: 'restaurants',
    path: '/restaurants',
    element: CuaHangListPage,
    meta: {
      title: 'Quán ăn',
      icon: <ShopOutlined />,
      requiresAuth: true,
      layout: 'main',
      breadcrumb: true,
    },
  },
  {
    key: 'restaurant-detail',
    path: '/restaurants/:id',
    element: CuaHangDetailPage,
    meta: {
      title: 'Chi tiết quán ăn',
      hidden: true,
      requiresAuth: true,
      layout: 'main',
      breadcrumb: true,
    },
  },
  {
    key: 'menus',
    path: '/menus',
    element: MonAnListPage,
    meta: {
      title: 'Món ăn',
      icon: <AppstoreOutlined />,
      requiresAuth: true,
      layout: 'main',
      breadcrumb: true,
    },
  },
  {
    key: 'chatbot',
    path: '/chatbot',
    element: TroChuyenAIPage,
    meta: {
      title: 'AI Chatbot',
      icon: <MessageOutlined />,
      requiresAuth: true,
      layout: 'main',
      breadcrumb: true,
    },
  },
  {
    key: 'profile',
    path: '/profile',
    element: TaiKhoanDetailPage,
    meta: {
      title: 'Tài khoản',
      icon: <UserOutlined />,
      requiresAuth: true,
      layout: 'main',
      breadcrumb: true,
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
    key: 'forbidden',
    path: '/403',
    element: CamTruyCapPage,
    meta: {
      title: 'Không có quyền truy cập',
      hidden: true,
      layout: 'blank',
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
