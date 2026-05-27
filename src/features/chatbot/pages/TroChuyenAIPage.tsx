import { Card, Col, Row, Space, Tag, Typography } from "antd";

import KhungTrang from "@/components/common/KhungTrang";
import ChatbotPanel from "@/features/chatbot/components/ChatbotPanel";

function TroChuyenAIPage() {
  return (
    <KhungTrang
      subtitle="Hỏi FoodMap AI để tìm quán theo món, khu vực, giờ mở cửa hoặc mức đánh giá."
      title="AI Chatbot"
    >
      <Row gutter={[16, 16]}>
        <Col lg={16} span={24}>
          <Card title="Hội thoại">
            <ChatbotPanel />
          </Card>
        </Col>
        <Col lg={8} span={24}>
          <Card title="Gợi ý lệnh">
            <Space direction="vertical" size={12}>
              <Typography.Text type="secondary">
                Nên hỏi rõ món, khu vực, thời gian hoặc nhu cầu để kết quả sát hơn.
              </Typography.Text>
              <Space size={[8, 8]} wrap>
              <Tag color="gold">Quán gần đây</Tag>
              <Tag color="blue">Món nổi bật</Tag>
              <Tag color="green">Đang mở cửa</Tag>
              <Tag color="purple">Theo ngân sách</Tag>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </KhungTrang>
  );
}

export default TroChuyenAIPage;
