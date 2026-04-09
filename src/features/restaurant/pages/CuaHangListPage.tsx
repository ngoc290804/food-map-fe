import { useState } from "react";

import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import TheTrangThai from "@/components/common/TheTrangThai";
import { useRestaurantList } from "@/features/restaurant/hooks/useRestaurantList";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/do-an": {
    title: "Ưu đãi",
    description: "Khám phá ưu đãi nổi bật quanh bạn.",
  },
  "/thuc-pham": {
    title: "Thực phẩm",
    description: "Danh sách cửa hàng thực phẩm đang có deal tốt.",
  },
  "/ruou-bia": {
    title: "Rượu bia",
    description: "Ưu đãi từ các cửa hàng đồ uống và bia rượu.",
  },
  "/hoa": {
    title: "Hoa",
    description: "Tiệm hoa đang có khuyến mãi theo dịp.",
  },
  "/sieu-thi": {
    title: "Siêu thị",
    description: "Mua sắm siêu thị với mức giá hấp dẫn.",
  },
  "/thuoc": {
    title: "Thuốc",
    description: "Nhà thuốc giao nhanh và ưu đãi theo đơn.",
  },
  "/thu-cung": {
    title: "Thú cưng",
    description: "Sản phẩm và dịch vụ cho thú cưng.",
  },
};

function CuaHangListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const { data, isLoading } = useRestaurantList({ keyword });
  const currentPage = pageMeta[location.pathname] ?? pageMeta["/do-an"];
  const items = data?.items ?? [];

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <Flex align="center" justify="space-between" wrap="wrap">
        <div>
          <Typography.Title level={2} style={{ marginBottom: 6 }}>
            {currentPage.title}
          </Typography.Title>
          <Typography.Text type="secondary">
            {currentPage.description}
          </Typography.Text>
        </div>
        <Button className="offer-section__view-all" type="link">
          Xem tất cả <RightOutlined />
        </Button>
      </Flex>

      <Input
        allowClear
        className="offer-search"
        placeholder="Tìm cửa hàng, món ăn hoặc khu vực"
        prefix={<SearchOutlined />}
        size="large"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="offer-list">
        {items.map((item) => (
          <button
            className="offer-card"
            key={item.id}
            type="button"
            onClick={() => navigate(`/cua-hang/${item.id}`)}
          >
            <span
              className={`offer-card__badge offer-card__badge--${
                item.status === "ACTIVE" ? "green" : "gray"
              }`}
            />
            <div
              className="offer-card__image"
              style={
                item.imageUrl
                  ? {
                      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.18)), url(${item.imageUrl})`,
                    }
                  : undefined
              }
            />
            <div className="offer-card__body">
              <Flex align="start" justify="space-between" gap={12}>
                <Typography.Title ellipsis={{ rows: 1 }} level={4}>
                  {item.name}
                </Typography.Title>
                <TheTrangThai status={item.status} />
              </Flex>
              <Flex align="center" className="offer-card__time" gap={8}>
                <ClockCircleOutlined />
                <Typography.Text>
                  {item.openTime} - {item.closeTime}
                </Typography.Text>
              </Flex>
              <Typography.Paragraph
                className="offer-card__description"
                ellipsis={{ rows: 2 }}
              >
                {item.description}
              </Typography.Paragraph>
              <Flex align="start" className="offer-card__address" gap={8}>
                <EnvironmentOutlined />
                <Typography.Text ellipsis={{ tooltip: item.address }}>
                  {item.address}
                </Typography.Text>
              </Flex>
            </div>
            <div className="offer-card__footer">
              <span>Mở cửa đến {item.closeTime}</span>
            </div>
          </button>
        ))}
      </div>

      {isLoading ? (
        <Typography.Text>Đang tải danh sách quán ăn...</Typography.Text>
      ) : null}
    </Space>
  );
}

export default CuaHangListPage;
