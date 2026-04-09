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
            Base code đồ án với React, TypeScript, Ant Design và router config-driven.
          </Typography.Text>
        </div>

        <Form layout="vertical" onFinish={signIn}>
          <Form.Item label="Email" name="email">
            <Input prefix={<UserOutlined />} placeholder="admin@foodmap.local" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password">
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Button block htmlType="submit" size="large" type="primary">
            Đăng nhập demo
          </Button>
        </Form>
      </Space>
    </Card>
  )
}

export default DangNhapFormPage
