import { useEffect, useState } from 'react'

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Space, Tabs, Typography, message } from 'antd'
import type { TabsProps } from 'antd'
import { AxiosError } from 'axios'

import KhungTrang from '@/components/common/KhungTrang'
import { STORAGE_KEY } from '@/config/storage-key'
import { authService } from '@/features/auth/services/auth.service'
import { useAuthStore, type UserInfo } from '@/features/auth/store/auth.store'
import { storage } from '@/utils/storage'

type ProfileFormValues = {
  username: string
  fullName: string
  email: string
}

type PasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as { message?: string } | undefined

    return responseData?.message || fallback
  }

  return fallback
}

function saveProfileToStore(user: UserInfo) {
  storage.set(STORAGE_KEY.USER_PROFILE, user)
}

function TaiKhoanDetailPage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [profileForm] = Form.useForm<ProfileFormValues>()
  const [passwordForm] = Form.useForm<PasswordFormValues>()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    profileForm.setFieldsValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    })
  }, [profileForm, user])

  const saveProfile = async (values: ProfileFormValues) => {
    if (!user) {
      return
    }

    try {
      setIsProfileSaving(true)
      const nextUser = await authService.updateProfile({
        username: values.username,
        fullName: values.fullName,
      })

      saveProfileToStore(nextUser)
      setUser(nextUser)
      messageApi.success('Đã lưu thông tin tài khoản')
    } catch (error) {
      messageApi.error(
        getErrorMessage(
          error,
          'Chưa thể lưu thông tin. BE cần hỗ trợ API PUT /api/auth/me.',
        ),
      )
    } finally {
      setIsProfileSaving(false)
    }
  }

  const changePassword = async (values: PasswordFormValues) => {
    try {
      setIsPasswordSaving(true)
      await authService.changePassword(values)
      passwordForm.resetFields()
      messageApi.success('Đã đổi mật khẩu')
    } catch (error) {
      messageApi.error(getErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.'))
    } finally {
      setIsPasswordSaving(false)
    }
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'profile',
      label: 'Thông tin cơ bản',
      children: (
        <Form form={profileForm} layout="vertical" onFinish={saveProfile}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ tên" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled prefix={<MailOutlined />} />
          </Form.Item>
          <Button htmlType="submit" loading={isProfileSaving} type="primary">
            Lưu
          </Button>
        </Form>
      ),
    },
    {
      key: 'password',
      label: 'Thay đổi mật khẩu',
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={changePassword}>
          <Form.Item
            label="Mật khẩu cũ"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu cũ" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu mới cần ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            dependencies={['newPassword']}
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }

                  return Promise.reject(new Error('Mật khẩu mới chưa khớp'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Button htmlType="submit" loading={isPasswordSaving} type="primary">
            Lưu
          </Button>
        </Form>
      ),
    },
  ]

  return (
    <KhungTrang subtitle="Quản lý thông tin tài khoản đang đăng nhập." title="Tài khoản">
      {messageContextHolder}
      <Card className="account-card">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 4 }}>
              {user?.fullName || user?.username || 'Tài khoản'}
            </Typography.Title>
            <Typography.Text type="secondary">{user?.email}</Typography.Text>
          </div>
          {!user ? (
            <Alert message="Bạn cần đăng nhập để xem thông tin tài khoản." type="warning" />
          ) : (
            <Tabs items={tabItems} />
          )}
        </Space>
      </Card>
    </KhungTrang>
  )
}

export default TaiKhoanDetailPage
