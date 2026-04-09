import type { PropsWithChildren } from 'react'

import { Layout } from 'antd'

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
    </Layout>
  )
}

export default BoCucChinh
