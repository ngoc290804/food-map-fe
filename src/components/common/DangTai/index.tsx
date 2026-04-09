import { Flex, Spin } from 'antd'

type DangTaiProps = {
  fullscreen?: boolean
  tip?: string
}

function DangTai({ fullscreen = false, tip = 'Đang tải dữ liệu...' }: DangTaiProps) {
  if (fullscreen) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" tip={tip} />
      </Flex>
    )
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: 240 }}>
      <Spin size="large" tip={tip} />
    </Flex>
  )
}

export default DangTai
