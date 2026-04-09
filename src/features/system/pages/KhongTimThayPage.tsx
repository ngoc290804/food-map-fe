import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

function KhongTimThayPage() {
  const navigate = useNavigate()

  return (
    <Result
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Về dashboard
        </Button>
      }
      status="404"
      subTitle="Trang bạn đang truy cập không tồn tại trong hệ thống."
      title="404"
    />
  )
}

export default KhongTimThayPage
