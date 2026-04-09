import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

function CamTruyCapPage() {
  const navigate = useNavigate()

  return (
    <Result
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Quay về trang chủ
        </Button>
      }
      status="403"
      subTitle="Tài khoản hiện tại không có quyền truy cập vào tài nguyên này."
      title="403"
    />
  )
}

export default CamTruyCapPage
