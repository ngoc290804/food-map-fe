import { DownOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex, Menu, Space } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { appMenuItems } from '@/config/menu.config'

function DauTrang() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Flex align="center" className="main-layout__topbar" gap={24} justify="space-between" wrap="wrap">
      <Flex align="center" className="main-layout__nav-area" gap={16} wrap="wrap">
        <Dropdown
          menu={{
            items: [
              { key: 'hn', label: 'Hà Nội' },
              { key: 'hcm', label: 'Hồ Chí Minh' },
              { key: 'dn', label: 'Đà Nẵng' },
            ],
          }}
          trigger={['click']}
        >
          <Button className="main-layout__city-button" size="large">
            <Space>
              Hà Nội
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>

        <nav className="main-layout__nav" aria-label="Danh mục">
          <Menu
            className="main-layout__menu"
            disabledOverflow
            items={appMenuItems}
            mode="horizontal"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
          />
        </nav>
      </Flex>

      <Flex align="center" className="main-layout__actions" gap={12}>
        <Button className="main-layout__icon-button" icon={<SearchOutlined />} />
        <Button className="main-layout__login-button" size="large">
          Đăng nhập
        </Button>
      </Flex>
    </Flex>
  )
}

export default DauTrang
