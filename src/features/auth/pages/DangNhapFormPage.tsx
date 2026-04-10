import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Space, Typography } from 'antd'

import { env } from '@/config/env'
import { useAuth } from '@/features/auth/hooks/useAuth'

function DangNhapFormPage() {
  const { signIn } = useAuth()

  return (
    <Card className="auth-card">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={2}>{env.APP_NAME}</Typography.Title>
          <Typography.Text type="secondary">
            Đăng nhập để lưu quán yêu thích và xem lại thông tin tài khoản.
          </Typography.Text>
        </div>

        <Form layout="vertical" onFinish={signIn}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@foodmap.local" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Button block htmlType="submit" size="large" type="primary">
            Đăng nhập
          </Button>
        </Form>
      </Space>
    </Card>
  )
}

export default DangNhapFormPage
