import { useCallback, useMemo } from 'react'

import { DownOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex, Menu, Space } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import logoImage from '@/assets/logo.png'
import { env } from '@/config/env'
import {
  AREA_QUERY_KEY,
  areaOptions,
  FOOD_DETAIL_QUERY_KEY,
  getAreaByValue,
  getFoodDetailByValue,
} from '@/config/food-filter.config'
import { createAppMenuItems } from '@/config/menu.config'
import { useAuth } from '@/features/auth/hooks/useAuth'

function DauTrang() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const selectedArea = getAreaByValue(searchParams.get(AREA_QUERY_KEY))
  const selectedDetail = getFoodDetailByValue(searchParams.get(FOOD_DETAIL_QUERY_KEY))
  const selectedMenuKey = selectedDetail
    ? `${location.pathname}?${FOOD_DETAIL_QUERY_KEY}=${selectedDetail.value}`
    : location.pathname

  const goToMenuFilter = useCallback(
    (key: string) => {
      const [pathname, rawSearch = ''] = key.split('?')
      const nextParams = new URLSearchParams(rawSearch)
      nextParams.set(AREA_QUERY_KEY, selectedArea.value)
      const query = nextParams.toString()

      navigate(`${pathname}${query ? `?${query}` : ''}`)
    },
    [navigate, selectedArea.value],
  )

  const menuItems = useMemo(() => createAppMenuItems(goToMenuFilter), [goToMenuFilter])
  const areaMenuItems = useMemo(
    () => areaOptions.map((option) => ({ key: option.value, label: option.label })),
    [],
  )

  const handleAreaClick: MenuProps['onClick'] = ({ key }) => {
    const nextParams = new URLSearchParams(location.search)
    nextParams.set(AREA_QUERY_KEY, String(key))
    navigate(`${location.pathname}?${nextParams.toString()}`)
  }

  const handleAccountClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile')
      return
    }

    if (key === 'logout') {
      signOut()
    }
  }

  return (
    <div className="main-layout__topbar">
      <Flex align="center" className="main-layout__brand-row" justify="space-between" wrap="wrap">
        <button
          aria-label="Về trang chủ"
          className="main-layout__brand"
          type="button"
          onClick={() => navigate('/')}
        >
          <img alt={env.APP_NAME} className="main-layout__brand-logo" src={logoImage} />
          <span className="main-layout__brand-name">{env.APP_NAME}</span>
        </button>

        <Flex align="center" className="main-layout__actions" gap={12}>
          {user ? (
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Thông tin tài khoản' },
                  { key: 'logout', label: 'Đăng xuất', danger: true },
                ],
                onClick: handleAccountClick,
              }}
              trigger={['hover', 'click']}
            >
              <Button className="main-layout__login-button" icon={<UserOutlined />} size="large">
                <Space>
                  {user.name}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Button
              className="main-layout__login-button"
              size="large"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          )}
        </Flex>
      </Flex>

      <Flex align="center" className="main-layout__menu-row" gap={16} wrap="wrap">
        <Dropdown
          menu={{
            items: areaMenuItems,
            selectedKeys: [selectedArea.value],
            onClick: handleAreaClick,
          }}
          trigger={['click']}
        >
          <Button className="main-layout__city-button" size="large">
            <Space>
              {selectedArea.label}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>

        <nav className="main-layout__nav" aria-label="Danh mục">
          <Menu
            className="main-layout__menu"
            disabledOverflow
            items={menuItems}
            mode="horizontal"
            selectedKeys={[selectedMenuKey]}
            triggerSubMenuAction="hover"
            onClick={({ key }) => goToMenuFilter(String(key))}
          />
        </nav>
      </Flex>
    </div>
  )
}

export default DauTrang
