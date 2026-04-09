import {
  AppstoreOutlined,
  MessageOutlined,
  ShopOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { Card, Col, List, Row, Statistic, Typography } from 'antd'

import KhungTrang from '@/components/common/KhungTrang'

const overview = [
  { title: 'Quán ăn', value: 128, icon: <ShopOutlined /> },
  { title: 'Món ăn', value: 452, icon: <AppstoreOutlined /> },
  { title: 'Phiên chat AI', value: 86, icon: <MessageOutlined /> },
  { title: 'Lượt yêu thích', value: 243, icon: <StarOutlined /> },
]

function TongQuanPage() {
  return (
    <KhungTrang
      subtitle="Dashboard mẫu để demo kiến trúc base code và các khối UI dùng chung."
      title="Tổng quan hệ thống"
    >
      <Row gutter={[16, 16]}>
        {overview.map((item) => (
          <Col key={item.title} lg={6} sm={12} span={24}>
            <Card>
              <Statistic prefix={item.icon} title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}
        <Col lg={14} span={24}>
          <Card title="Luồng triển khai đề xuất">
            <List
              dataSource={[
                'Tạo feature restaurant, menu, recommendation và chatbot.',
                'Kết nối API thật qua axiosInstance và React Query.',
                'Bổ sung phân quyền, upload ảnh và filter nâng cao.',
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
        <Col lg={10} span={24}>
          <Card title="Kiến trúc hiện tại">
            <Typography.Paragraph>
              Project đang dùng feature-first, route/menu config-driven, shared
              services và layout tách biệt để dễ mở rộng cho đồ án.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </KhungTrang>
  )
}

export default TongQuanPage
