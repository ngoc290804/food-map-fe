import { Card, Col, Descriptions, Row, Statistic } from 'antd'
import { useParams } from 'react-router-dom'

import KhungTrang from '@/components/common/KhungTrang'

function CuaHangDetailPage() {
  const { id } = useParams()

  return (
    <KhungTrang
      subtitle="Trang chi tiết tạm thời để nối dữ liệu thật cho cửa hàng."
      title={`Chi tiết cửa hàng ${id ?? ''}`}
    >
      <Row gutter={[16, 16]}>
        <Col lg={16} span={24}>
          <Card title="Thông tin chung">
            <Descriptions
              column={1}
              items={[
                { key: 'name', label: 'Tên cửa hàng', children: 'Tiệm mẫu FoodMap' },
                { key: 'address', label: 'Địa chỉ', children: '12 Nguyễn Huệ, Quận 1' },
                { key: 'time', label: 'Khung giờ', children: '08:00 - 22:00' },
                { key: 'desc', label: 'Mô tả', children: 'Thông tin chi tiết sẽ được nối API sau.' },
              ]}
            />
          </Card>
        </Col>
        <Col lg={8} span={24}>
          <Card title="Thống kê">
            <Statistic title="Đánh giá trung bình" value={4.7} />
            <Statistic style={{ marginTop: 16 }} title="Lượt ưu đãi" value={12} />
          </Card>
        </Col>
      </Row>
    </KhungTrang>
  )
}

export default CuaHangDetailPage
