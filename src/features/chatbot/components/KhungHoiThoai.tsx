import { Card, Space, Typography } from 'antd'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type KhungHoiThoaiProps = {
  messages: ChatMessage[]
}

function KhungHoiThoai({ messages }: KhungHoiThoaiProps) {
  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {messages.map((message) => (
        <Card
          key={message.id}
          size="small"
          style={{
            marginLeft: message.role === 'assistant' ? 0 : 48,
            marginRight: message.role === 'assistant' ? 48 : 0,
          }}
        >
          <Typography.Text strong>
            {message.role === 'assistant' ? 'FoodMap AI' : 'Bạn'}
          </Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
            {message.content}
          </Typography.Paragraph>
        </Card>
      ))}
    </Space>
  )
}

export default KhungHoiThoai
