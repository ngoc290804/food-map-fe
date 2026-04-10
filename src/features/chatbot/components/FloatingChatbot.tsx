import { useState } from 'react'

import { SendOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Space, Typography } from 'antd'

import chatbotImage from '@/assets/hero.png'

const messages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Bạn cần tìm quán theo món, khu vực hoặc thời gian mở cửa?',
  },
  {
    id: 'hint',
    role: 'assistant',
    content: 'Thử nhập: quán bún phở gần Hà Nội đang mở cửa.',
  },
] as const

function FloatingChatbot() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label="Mở chatbot FoodMap"
        className="chatbot-widget__trigger"
        type="button"
        onClick={() => setOpen(true)}
      >
        <img alt="FoodMap AI" src={chatbotImage} />
      </button>

      <Modal
        footer={null}
        mask={false}
        open={open}
        title="FoodMap AI"
        width={380}
        wrapClassName="chatbot-widget-modal"
        onCancel={() => setOpen(false)}
      >
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <div className="chatbot-widget__messages">
            {messages.map((message) => (
              <div className="chatbot-widget__message" key={message.id}>
                <Typography.Text strong>FoodMap AI</Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0, marginTop: 6 }}>
                  {message.content}
                </Typography.Paragraph>
              </div>
            ))}
          </div>

          <Input.TextArea placeholder="Nhập câu hỏi..." rows={3} />
          <Button block icon={<SendOutlined />} type="primary">
            Gửi câu hỏi
          </Button>
        </Space>
      </Modal>
    </>
  )
}

export default FloatingChatbot
