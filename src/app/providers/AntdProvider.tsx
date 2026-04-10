import { useEffect, type PropsWithChildren } from 'react'

import { App as AntdApp, ConfigProvider, theme } from 'antd'

import { STORAGE_KEY } from '@/config/storage-key'
import { useAppStore } from '@/store/app.store'

function AntdProvider({ children }: PropsWithChildren) {
  const appTheme = useAppStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = appTheme
    document.body.dataset.theme = appTheme
    localStorage.setItem(STORAGE_KEY.APP_THEME, appTheme)
  }, [appTheme])

  return (
    <ConfigProvider
      theme={{
        algorithm: appTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#d97706',
          borderRadius: 8,
          colorBgBase: appTheme === 'dark' ? '#050505' : '#ffffff',
          colorTextBase: appTheme === 'dark' ? '#f8fafc' : '#0f172a',
          fontFamily: '"Segoe UI", sans-serif',
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}

export default AntdProvider
