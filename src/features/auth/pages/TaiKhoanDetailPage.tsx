import { Card, Descriptions } from 'antd'

import KhungTrang from '@/components/common/KhungTrang'
import { useAuthStore } from '@/features/auth/store/auth.store'

function TaiKhoanDetailPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <KhungTrang
      subtitle="Thông tin người dùng lấy từ Zustand store."
      title="Tài khoản"
    >
      <Card>
        <Descriptions
          column={1}
          items={[
            { key: 'id', label: 'Mã người dùng', children: user?.id ?? 'u-01' },
            { key: 'name', label: 'Họ tên', children: user?.name ?? 'Nguyen Van A' },
            {
              key: 'email',
              label: 'Email',
              children: user?.email ?? 'admin@foodmap.local',
            },
          ]}
        />
      </Card>
    </KhungTrang>
  )
}

export default TaiKhoanDetailPage
