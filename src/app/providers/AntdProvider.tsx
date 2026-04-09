import type { PropsWithChildren } from 'react'

import { App as AntdApp, ConfigProvider, theme } from 'antd'

function AntdProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d97706',
          borderRadius: 14,
          fontFamily: '"Segoe UI", sans-serif',
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}

export default AntdProvider
