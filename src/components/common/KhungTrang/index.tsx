import type { PropsWithChildren, ReactNode } from 'react'

import { Breadcrumb, Flex, Space, Typography } from 'antd'

type KhungTrangProps = PropsWithChildren<{
  title: string
  subtitle?: string
  extra?: ReactNode
  breadcrumbs?: { title: string }[]
}>

function KhungTrang({ title, subtitle, extra, breadcrumbs, children }: KhungTrangProps) {
  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} /> : null}
      <Flex align="start" justify="space-between" gap={16} wrap="wrap">
        <div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          ) : null}
        </div>
        {extra}
      </Flex>
      {children}
    </Space>
  )
}

export default KhungTrang
