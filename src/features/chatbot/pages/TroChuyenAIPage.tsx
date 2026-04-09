import { Button, Card, Col, Input, Row, Space, Tag } from 'antd'

import KhungTrang from '@/components/common/KhungTrang'
import KhungHoiThoai from '@/features/chatbot/components/KhungHoiThoai'

const messages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Tôi có thể gợi ý quán ăn theo khu vực, mức giá và sở thích của bạn.',
  },
  {
    id: '2',
    role: 'user' as const,
    content: 'Tìm giúp tôi quán bún bò gần trung tâm và mở sau 22h.',
  },
]

function TroChuyenAIPage() {
  return (
    <KhungTrang
      subtitle="Module AI/chatbot để kết nối backend gợi ý dữ liệu trong đồ án."
      title="AI Chatbot"
    >
      <Row gutter={[16, 16]}>
        <Col lg={16} span={24}>
          <Card title="Hội thoại">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <KhungHoiThoai messages={messages} />
              <Input.TextArea placeholder="Nhập câu hỏi..." rows={4} />
              <Button type="primary">Gửi câu hỏi</Button>
            </Space>
          </Card>
        </Col>
        <Col lg={8} span={24}>
          <Card title="Gợi ý nhanh">
            <Space size={[8, 8]} wrap>
              <Tag color="gold">Quán gần đây</Tag>
              <Tag color="blue">Món nổi bật</Tag>
              <Tag color="green">Đang mở cửa</Tag>
              <Tag color="purple">Theo ngân sách</Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </KhungTrang>
  )
}

export default TroChuyenAIPage
