import { useState } from 'react'

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Select, Space, Tabs, Typography, message } from 'antd'
import type { TabsProps } from 'antd'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { env } from '@/config/env'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  LoginPayload,
  RegisterPayload,
} from '@/features/auth/services/auth.service'
import { markLocationPromptPending } from '@/utils/session-location'

const accountTypeOptions: { label: string; value: RegisterPayload['phanQuyen'] }[] = [
  { label: 'Khách hàng', value: 'khach' },
  { label: 'Chủ cửa hàng', value: 'cuaHang' },
]

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as { message?: string } | undefined

    return responseData?.message || 'Không thể đăng nhập. Vui lòng thử lại.'
  }

  return 'Không thể xử lý yêu cầu. Vui lòng thử lại.'
}

function DangNhapFormPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (values: LoginPayload) => {
    try {
      setIsSubmitting(true)
      await signIn(values, { redirect: false })
      markLocationPromptPending()
      messageApi.success('Đăng nhập thành công')
      navigate('/', { replace: true })
    } catch (error) {
      messageApi.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (values: RegisterPayload) => {
    try {
      setIsSubmitting(true)
      await signUp(values)
      messageApi.success('Đăng ký thành công')
    } catch (error) {
      messageApi.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'login',
      label: 'Đăng nhập',
      children: (
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Tên đăng nhập hoặc email"
            name="usernameOrEmail"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập hoặc email" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Button block htmlType="submit" loading={isSubmitting} size="large" type="primary">
            Đăng nhập
          </Button>
        </Form>
      ),
    },
    {
      key: 'register',
      label: 'Đăng ký',
      children: (
        <Form initialValues={{ phanQuyen: 'khach' }} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: foodlover" />
          </Form.Item>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="ban@foodmap.local" />
          </Form.Item>
          <Form.Item
            label="Loại tài khoản"
            name="phanQuyen"
            rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản' }]}
          >
            <Select options={accountTypeOptions} placeholder="Chọn loại tài khoản" />
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
          <Button block htmlType="submit" loading={isSubmitting} size="large" type="primary">
            Đăng ký
          </Button>
        </Form>
      ),
    },
  ]

  return (
    <>
      {messageContextHolder}
      <Card className="auth-card">
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Typography.Title level={2}>{env.APP_NAME}</Typography.Title>
            <Typography.Text type="secondary">
              Đăng nhập hoặc tạo tài khoản để sử dụng đầy đủ tính năng.
            </Typography.Text>
          </div>

          <Tabs className="auth-tabs" defaultActiveKey="login" items={tabItems} />
        </Space>
      </Card>
    </>
  )
}

export default DangNhapFormPage
