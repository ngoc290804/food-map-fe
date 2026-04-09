import { Empty } from 'antd'

type TrangThaiRongProps = {
  description?: string
}

function TrangThaiRong({ description = 'Chưa có dữ liệu để hiển thị.' }: TrangThaiRongProps) {
  return <Empty description={description} />
}

export default TrangThaiRong
