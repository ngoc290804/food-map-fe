import type { ReactNode } from 'react'

import {
  AppstoreOutlined,
  CoffeeOutlined,
  FireOutlined,
  GiftOutlined,
  HeartOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

import {
  buildDetailMenuKey,
  FoodCategoryFilter,
  foodFilterMenuOptions,
} from '@/config/food-filter.config'
import { APP_AUTHORITIES } from '@/config/constants'

const categoryIcons: Record<FoodCategoryFilter, ReactNode> = {
  [FoodCategoryFilter.HOME]: <HomeOutlined />,
  [FoodCategoryFilter.RESTAURANT]: <ShopOutlined />,
  [FoodCategoryFilter.PUB]: <FireOutlined />,
  [FoodCategoryFilter.DRINK]: <AppstoreOutlined />,
  [FoodCategoryFilter.CAFE]: <CoffeeOutlined />,
  [FoodCategoryFilter.DESSERT_SNACK]: <GiftOutlined />,
  [FoodCategoryFilter.FAVORITE]: <HeartOutlined />,
}

type CreateAppMenuItemsOptions = {
  isAuthenticated?: boolean
  roles?: string[]
}

function hasAdminRole(roles?: string[]) {
  return (
    roles?.some((role) => {
      const normalizedRole = role.toLowerCase()

      return (
        normalizedRole === APP_AUTHORITIES.ADMIN ||
        normalizedRole === `role_${APP_AUTHORITIES.ADMIN}`
      )
    }) ?? false
  )
}

export function createAppMenuItems(
  onParentClick: (path: string) => void,
  options: CreateAppMenuItemsOptions = {},
): MenuProps['items'] {
  const items: MenuProps['items'] = [
    ...foodFilterMenuOptions.map((option) => ({
      key: option.path,
      icon: categoryIcons[option.value],
      label: (
        <button
          className="main-layout__menu-title-button"
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (option.value === FoodCategoryFilter.FAVORITE && !options.isAuthenticated) {
              onParentClick('/login')
              return
            }

            onParentClick(option.path)
          }}
        >
          {option.label}
        </button>
      ),
      children: option.children?.map((child) => ({
        key: buildDetailMenuKey(option.path, child.value),
        label: child.label,
      })),
    })),
  ]

  if (hasAdminRole(options.roles)) {
    items.push({
      key: '/quan-ly-quan-an',
      icon: <SettingOutlined />,
      label: 'Quản lý',
    })
  }

  return items
}
