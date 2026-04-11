import { useState } from "react";

import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Space, Typography } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import TheTrangThai from "@/components/common/TheTrangThai";
import {
  AREA_QUERY_KEY,
  FOOD_DETAIL_QUERY_KEY,
  FoodCategoryFilter,
  getAreaByValue,
  getFoodFilterByPath,
} from "@/config/food-filter.config";
import { useRestaurantList } from "@/features/restaurant/hooks/useRestaurantList";
import { useDebounce } from "@/hooks/useDebounce";

function CuaHangListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword);
  const currentCategory = getFoodFilterByPath(location.pathname);
  const isHomePage = currentCategory.value === FoodCategoryFilter.HOME;
  const currentDetail = currentCategory.children?.find(
    (option) => option.value === searchParams.get(FOOD_DETAIL_QUERY_KEY),
  );
  const apiDetail = isHomePage
    ? undefined
    : (currentDetail ?? currentCategory.children?.[0]);
  const currentArea = getAreaByValue(searchParams.get(AREA_QUERY_KEY));
  const { data, isLoading } = useRestaurantList({
    keyword: debouncedKeyword,
    category: isHomePage ? undefined : currentCategory.value,
    detail: apiDetail?.value,
    page: 0,
    size: 10,
  });
  const pageTitle = currentDetail?.label ?? currentCategory.label;
  const pageDescription = currentDetail
    ? `${currentCategory.label} - ${currentDetail.label} tại ${currentArea.label}.`
    : `${currentCategory.description} Khu vực: ${currentArea.label}.`;
  const items = data?.items ?? [];

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <Flex align="center" justify="space-between" wrap="wrap">
        <div>
          <Typography.Title level={2} style={{ marginBottom: 6 }}>
            {pageTitle}
          </Typography.Title>
          <Typography.Text type="secondary">{pageDescription}</Typography.Text>
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
