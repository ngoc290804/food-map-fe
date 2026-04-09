import { Tag } from "antd";

type TheTrangThaiProps = {
  status: string;
};

const statusMap = {
  active: { color: "success", label: "Đang hoạt động" },
  inactive: { color: "default", label: "Tạm dừng" },
  draft: { color: "processing", label: "Bản nháp" },
} as const;

function TheTrangThai({ status }: TheTrangThaiProps) {
  const normalizedStatus = status.toLowerCase() as keyof typeof statusMap;
  const item = statusMap[normalizedStatus];

  if (!item) {
    return <Tag>{status}</Tag>;
  }

  return <Tag color={item.color}>{item.label}</Tag>;
}

export default TheTrangThai;
