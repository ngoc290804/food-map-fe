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

const categoryIcons: Record<FoodCategoryFilter, ReactNode> = {
  [FoodCategoryFilter.HOME]: <HomeOutlined />,
  [FoodCategoryFilter.RESTAURANT]: <ShopOutlined />,
  [FoodCategoryFilter.PUB]: <FireOutlined />,
  [FoodCategoryFilter.DRINK]: <AppstoreOutlined />,
  [FoodCategoryFilter.CAFE]: <CoffeeOutlined />,
  [FoodCategoryFilter.DESSERT_SNACK]: <GiftOutlined />,
  [FoodCategoryFilter.FAVORITE]: <HeartOutlined />,
}

export function createAppMenuItems(onParentClick: (path: string) => void): MenuProps['items'] {
  return [
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
    {
      key: '/quan-ly-quan-an',
      icon: <SettingOutlined />,
      label: 'Quản lý',
    },
  ]
}
