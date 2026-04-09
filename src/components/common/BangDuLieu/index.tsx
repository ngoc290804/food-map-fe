import type { TableProps } from 'antd'

import { Table } from 'antd'

function BangDuLieu<RecordType extends object>(props: TableProps<RecordType>) {
  return <Table pagination={{ pageSize: 10, showSizeChanger: false }} {...props} />
}

export default BangDuLieu
