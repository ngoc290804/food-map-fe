import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Space, Tabs, Typography } from 'antd'
import type { TabsProps } from 'antd'

import { env } from '@/config/env'
import { useAuth } from '@/features/auth/hooks/useAuth'

function DangNhapFormPage() {
  const { signIn } = useAuth()

  const tabItems: TabsProps['items'] = [
    {
      key: 'login',
      label: 'Đăng nhập',
      children: (
        <Form layout="vertical" onFinish={signIn}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
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
      ),
    },
    {
      key: 'register',
      label: 'Đăng ký',
      children: (
        <Form layout="vertical" onFinish={signIn}>
          <Form.Item
            label="Biệt danh"
            name="nickname"
            rules={[{ required: true, message: 'Vui lòng nhập biệt danh' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: Food lover" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="ban@foodmap.local" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tạo mật khẩu" />
          </Form.Item>
          <Form.Item
            dependencies={['password']}
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }

                  return Promise.reject(new Error('Mật khẩu xác nhận chưa khớp'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
          </Form.Item>
          <Button block htmlType="submit" size="large" type="primary">
            Đăng ký
          </Button>
        </Form>
      ),
    },
  ]

  return (
    <Card className="auth-card">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={2}>{env.APP_NAME}</Typography.Title>
          <Typography.Text type="secondary">
            Đăng nhập hoặc tạo tài khoản để lưu quán yêu thích.
          </Typography.Text>
        </div>

        <Tabs className="auth-tabs" defaultActiveKey="login" items={tabItems} />
      </Space>
    </Card>
  )
}

export default DangNhapFormPage
