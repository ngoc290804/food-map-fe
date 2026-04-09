import { SearchOutlined } from '@ant-design/icons'
import { Button, Flex, Input } from 'antd'

type ThanhTimKiemProps = {
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  onSearch?: () => void
}

function ThanhTimKiem({
  value,
  placeholder = 'Nhập từ khóa tìm kiếm',
  onChange,
  onSearch,
}: ThanhTimKiemProps) {
  return (
    <Flex gap={12} wrap="wrap">
      <Input
        allowClear
        placeholder={placeholder}
        style={{ maxWidth: 320 }}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <Button icon={<SearchOutlined />} type="primary" onClick={onSearch}>
        Tìm kiếm
      </Button>
    </Flex>
  )
}

export default ThanhTimKiem
