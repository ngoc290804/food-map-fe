import type { PropsWithChildren } from 'react'

import { Layout } from 'antd'
import { useNavigate } from 'react-router-dom'

import logoImage from '@/assets/logo.png'
import { env } from '@/config/env'

function BoCucXacThuc({ children }: PropsWithChildren) {
  const navigate = useNavigate()

  return (
    <Layout className="auth-layout">
      <button
        aria-label="Về trang chủ"
        className="auth-layout__brand"
        type="button"
        onClick={() => navigate('/')}
      >
        <img alt={env.APP_NAME} className="auth-layout__brand-logo" src={logoImage} />
        <span className="auth-layout__brand-name">{env.APP_NAME}</span>
      </button>
      <div className="auth-layout__panel">{children}</div>
    </Layout>
  )
}

export default BoCucXacThuc
