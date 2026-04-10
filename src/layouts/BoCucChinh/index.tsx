import type { PropsWithChildren } from 'react'

import { Layout } from 'antd'

import FloatingChatbot from '@/features/chatbot/components/FloatingChatbot'
import NoiDungChinh from '@/layouts/BoCucChinh/NoiDungChinh'
import DauTrang from '@/layouts/BoCucChinh/DauTrang'

function BoCucChinh({ children }: PropsWithChildren) {
  return (
    <Layout className="main-layout">
      <Layout.Header className="main-layout__header-shell">
        <DauTrang />
      </Layout.Header>
      <Layout.Content className="main-layout__content">
        <NoiDungChinh>{children}</NoiDungChinh>
      </Layout.Content>
      <FloatingChatbot />
    </Layout>
  )
}

export default BoCucChinh
