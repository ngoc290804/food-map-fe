import { useEffect, useMemo, useState } from "react";

import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Image,
  List,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import Gallery, {
  type PhotoProps,
  type RenderImageProps,
} from "react-photo-gallery";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useParams } from "react-router-dom";

import KhungTrang from "@/components/common/KhungTrang";
import TrangThaiRong from "@/components/common/TrangThaiRong";
import { restaurantService } from "@/features/restaurant/services/restaurant.service";

type MenuPhoto = PhotoProps<{
  title?: string;
}>;

type MapPosition = [number, number];

const defaultMapPosition: MapPosition = [21.028511, 105.804817];

function RestaurantLocationMap({
  position,
}: {
  position: MapPosition;
}) {
  return (
    <MapContainer
      center={position}
      className="restaurant-detail__map"
      zoom={15}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} />
    </MapContainer>
  );
}

function isRestaurantOpen(closeTime?: string) {
  const normalizedCloseTime = closeTime?.match(/^(\d{2}:\d{2})/)?.[1];

  if (!normalizedCloseTime) {
    return false;
  }

  const now = dayjs();
  const closingAt = dayjs(
    `${now.format("YYYY-MM-DD")}T${normalizedCloseTime}:00`,
  );

  return now.isBefore(closingAt) || now.isSame(closingAt);
}

function openGoogleMaps(address: string) {
  const encodedAddress = encodeURIComponent(address);

  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
    "_blank",
  );
}

function CuaHangDetailPage() {
  const { id } = useParams();
  const restaurantId = id ?? "";
  const {
    data: restaurant,
    isError: isRestaurantError,
    isLoading: isRestaurantLoading,
  } = useQuery({
    enabled: Boolean(restaurantId),
    queryKey: ["restaurant-detail", restaurantId],
    queryFn: () => restaurantService.getDetail(restaurantId),
  });
  const {
    data: menuItems = [],
    isError: isMenuItemsError,
    isLoading: isMenuItemsLoading,
  } = useQuery({
    enabled: Boolean(restaurantId),
    queryKey: ["restaurant-menu-items", restaurantId],
    queryFn: () => restaurantService.getMenuItems(restaurantId),
  });
  const [menuImageSizes, setMenuImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});

  useEffect(() => {
    menuItems.forEach((item) => {
      if (!item.imageUrl || menuImageSizes[item.id]) {
        return;
      }

      const image = new window.Image();
      image.onload = () => {
        setMenuImageSizes((current) => ({
          ...current,
          [item.id]: {
            width: image.naturalWidth || 4,
            height: image.naturalHeight || 3,
          },
        }));
      };
      image.src = item.imageUrl;
    });
  }, [menuImageSizes, menuItems]);

  const menuPhotos = useMemo<MenuPhoto[]>(
    () =>
      menuItems
        .filter((item) => item.imageUrl)
        .map((item) => {
          const size = menuImageSizes[item.id] ?? { width: 4, height: 3 };

          return {
            key: item.id,
            src: item.imageUrl ?? "",
            width: size.width,
            height: size.height,
            alt: item.name,
            title: item.name,
          };
        }),
    [menuImageSizes, menuItems],
  );

  const renderMenuPhoto = ({
    index,
    margin,
    photo,
  }: RenderImageProps<{ title?: string }>) => (
    <div
      className="restaurant-detail__photo-card"
      key={photo.key ?? index}
      style={{
        margin,
        width: photo.width,
      }}
    >
      <Image
        alt={photo.alt}
        className="restaurant-detail__photo"
        height={photo.height}
        src={photo.src}
        width={photo.width}
      />
      <Typography.Text
        className="restaurant-detail__photo-caption"
        ellipsis={{ tooltip: photo.title }}
      >
        {photo.title}
      </Typography.Text>
    </div>
  );

  if (!restaurantId) {
    return (
      <KhungTrang title="Chi tiết cửa hàng">
        <Alert message="Không tìm thấy mã cửa hàng." type="warning" />
      </KhungTrang>
    );
  }

  if (isRestaurantLoading) {
    return (
      <KhungTrang title="Chi tiết cửa hàng">
        <Flex align="center" justify="center" style={{ minHeight: 280 }}>
          <Spin>
            <div style={{ paddingTop: 32 }}>
              Đang tải thông tin cửa hàng...
            </div>
          </Spin>
        </Flex>
      </KhungTrang>
    );
  }

  if (isRestaurantError || !restaurant) {
    return (
      <KhungTrang title="Chi tiết cửa hàng">
        <Alert
          message="Không thể tải thông tin cửa hàng. Vui lòng thử lại."
          type="error"
        />
      </KhungTrang>
    );
  }

  const isOpen = isRestaurantOpen(restaurant.closeTime);
  const mapPosition: MapPosition =
    restaurant.latitude !== null && restaurant.longitude !== null
      ? [restaurant.latitude, restaurant.longitude]
      : defaultMapPosition;

  return (
    <KhungTrang
      subtitle={restaurant.address || "Thông tin chi tiết cửa hàng"}
      title={restaurant.name || "Chi tiết cửa hàng"}
    >
      <Row align="top" gutter={[16, 16]}>
        <Col lg={15} span={24}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card className="restaurant-detail__info-card">
              <Row gutter={[16, 16]}>
                <Col md={9} span={24}>
                  {restaurant.imageUrl ? (
                    <Image
                      alt={restaurant.name}
                      height={220}
                      src={restaurant.imageUrl}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                      width="100%"
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        background: "#f5f5f5",
                        borderRadius: 8,
                        height: 220,
                      }}
                    >
                      <Typography.Text type="secondary">
                        Chưa có hình ảnh
                      </Typography.Text>
                    </Flex>
                  )}
                </Col>
                <Col md={15} span={24}>
                  <Space direction="vertical" size={12}>
                    <Flex align="center" gap={8} wrap="wrap">
                      <Typography.Title level={3} style={{ margin: 0 }}>
                        {restaurant.name}
                      </Typography.Title>
                      <Tag color={isOpen ? "success" : "error"}>
                        {isOpen ? "Còn mở cửa" : "Đã đóng cửa"}
                      </Tag>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <ClockCircleOutlined />
                      <Typography.Text>
                        {restaurant.openTime || "--:--"} -{" "}
                        {restaurant.closeTime || "--:--"}
                      </Typography.Text>
                    </Flex>
                    <Flex align="start" gap={8}>
                      <EnvironmentOutlined style={{ marginTop: 4 }} />
                      <Typography.Text>{restaurant.address}</Typography.Text>
                    </Flex>
                  <Typography.Paragraph>
                    {restaurant.description || "Chưa có mô tả."}
                  </Typography.Paragraph>
                </Space>
              </Col>
            </Row>
              <Button
                className="restaurant-detail__direction-button"
                icon={<SendOutlined />}
                type="primary"
                onClick={() => openGoogleMaps(restaurant.address)}
              >
                Chỉ đường
              </Button>
          </Card>
            <Card loading={isMenuItemsLoading} title="Menu món ăn">
              {isMenuItemsError ? (
                <Alert
                  message="Không thể tải danh sách món ăn."
                  type="warning"
                />
              ) : menuItems.length > 0 ? (
                <List
                  dataSource={menuItems}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        description={
                          <Space direction="vertical" size={2}>
                            <Typography.Text>
                              {Number(item.price).toLocaleString("vi-VN")} đ
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              {item.mainIngredient}
                            </Typography.Text>
                          </Space>
                        }
                        title={
                          <Flex align="center" justify="space-between" gap={8}>
                            <Typography.Text strong>{item.name}</Typography.Text>
                            <Tag color={item.available ? "success" : "error"}>
                              {item.available ? "Còn bán" : "Hết hàng"}
                            </Tag>
                          </Flex>
                        }
                      />
                    </List.Item>
                  )}
                />
            ) : (
              <TrangThaiRong description="Chưa có món ăn để hiển thị." />
            )}
          </Card>
          </Space>
        </Col>
        <Col lg={9} span={24}>
          <Card className="restaurant-detail__map-card" title="Vị trí">
            <RestaurantLocationMap position={mapPosition} />
          </Card>
        </Col>
        {menuPhotos.length > 0 ? (
          <Col span={24}>
            <Card className="restaurant-detail__gallery-card" title="Hình ảnh món ăn">
              <Gallery
                direction="row"
                margin={8}
                photos={menuPhotos}
                renderImage={renderMenuPhoto}
                targetRowHeight={(containerWidth) =>
                  containerWidth < 640 ? 110 : 130
                }
              />
            </Card>
          </Col>
        ) : null}
      </Row>
    </KhungTrang>
  );
}

export default CuaHangDetailPage;
