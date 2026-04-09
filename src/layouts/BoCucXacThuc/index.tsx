import type { PropsWithChildren } from 'react'

import { Layout } from 'antd'

function BoCucXacThuc({ children }: PropsWithChildren) {
  return (
    <Layout className="auth-layout">
      <div className="auth-layout__panel">{children}</div>
    </Layout>
  )
}

export default BoCucXacThuc
