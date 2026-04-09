import type { PropsWithChildren } from 'react'

import AntdProvider from '@/app/providers/AntdProvider'
import QueryProvider from '@/app/providers/QueryProvider'

function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AntdProvider>{children}</AntdProvider>
    </QueryProvider>
  )
}

export default AppProvider
