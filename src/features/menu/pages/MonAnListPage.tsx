import { Card, Space, Typography } from 'antd'

import BangDuLieu from '@/components/common/BangDuLieu'
import KhungTrang from '@/components/common/KhungTrang'
import TheTrangThai from '@/components/common/TheTrangThai'

const menuItems = [
  { id: 'm-01', name: 'Bún bò Huế', category: 'Món chính', status: 'active' as const },
  { id: 'm-02', name: 'Cà phê sữa đá', category: 'Đồ uống', status: 'draft' as const },
]

function MonAnListPage() {
  return (
    <KhungTrang subtitle="Feature menu mẫu cho đồ án quán ăn." title="Danh sách món ăn">
      <Card>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            Đây là màn hình base để bạn nối với API quản lý món ăn.
          </Typography.Text>
          <BangDuLieu
            columns={[
              { title: 'Mã món', dataIndex: 'id' },
              { title: 'Tên món', dataIndex: 'name' },
              { title: 'Danh mục', dataIndex: 'category' },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                render: (value: 'active' | 'inactive' | 'draft') => (
                  <TheTrangThai status={value} />
                ),
              },
            ]}
            dataSource={menuItems}
            rowKey="id"
          />
        </Space>
      </Card>
    </KhungTrang>
  )
}

export default MonAnListPage
