import { useEffect, useMemo, useState, type UIEvent } from "react";

import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  SendOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Image,
  Input,
  List,
  Modal,
  Rate,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import Gallery, {
  type PhotoProps,
  type RenderImageProps,
} from "react-photo-gallery";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";

import KhungTrang from "@/components/common/KhungTrang";
import TrangThaiRong from "@/components/common/TrangThaiRong";
import { favoriteService } from "@/features/restaurant/services/favorite.service";
import { restaurantService } from "@/features/restaurant/services/restaurant.service";
import {
  reviewService,
  type RestaurantReview,
} from "@/features/restaurant/services/review.service";
import { getAccessToken } from "@/utils/token";

type MenuPhoto = PhotoProps<{
  title?: string;
}>;

type MapPosition = [number, number];

const defaultMapPosition: MapPosition = [21.028511, 105.804817];

const previewReviewSize = 3;
const modalReviewPageSize = 10;

class ReviewBloomFilter {
  private readonly bits = new Uint8Array(2048);

  add(value: string) {
    this.getHashes(value).forEach((hash) => {
      this.bits[hash] = 1;
    });
  }

  has(value: string) {
    return this.getHashes(value).every((hash) => this.bits[hash] === 1);
  }

  private getHashes(value: string) {
    let hashA = 0;
    let hashB = 5381;

    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      hashA = (hashA * 31 + code) % this.bits.length;
      hashB = ((hashB << 5) + hashB + code) % this.bits.length;
    }

    return [hashA, hashB, (hashA + hashB) % this.bits.length];
  }
}

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
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
  const {
    data: reviewPreview,
    isLoading: isReviewsLoading,
  } = useQuery({
    enabled: Boolean(restaurantId),
    queryKey: ["restaurant-reviews", restaurantId, "preview"],
    queryFn: () =>
      reviewService.getByRestaurant(restaurantId, {
        page: 0,
        size: previewReviewSize,
      }),
  });
  const [menuImageSizes, setMenuImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalReviews, setModalReviews] = useState<RestaurantReview[]>([]);
  const [modalReviewPage, setModalReviewPage] = useState(0);
  const [modalReviewTotalPages, setModalReviewTotalPages] = useState(0);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState(false);
  const [reviewBloomFilter, setReviewBloomFilter] = useState(
    () => new ReviewBloomFilter(),
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const favoriteMutation = useMutation({
    mutationFn: ({
      favorite,
      restaurantId,
    }: {
      favorite: boolean;
      restaurantId: string;
    }) =>
      favorite
        ? favoriteService.deleteByRestaurant(restaurantId)
        : favoriteService.create({ idCuaHang: restaurantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-detail", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: () => {
      messageApi.error("Không thể cập nhật yêu thích. Vui lòng thử lại.");
    },
  });
  const createReviewMutation = useMutation({
    mutationFn: () =>
      reviewService.createByRestaurant(restaurantId, {
        danhGia: reviewContent.trim(),
        diemDanhGia: reviewRating,
      }),
    onSuccess: (createdReview) => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-reviews", restaurantId] });
      setReviewContent("");
      setReviewRating(5);
      messageApi.success("Đã gửi đánh giá.");

      if (isReviewModalOpen && !reviewBloomFilter.has(createdReview.id)) {
        reviewBloomFilter.add(createdReview.id);
        setModalReviews((currentReviews) => [createdReview, ...currentReviews]);
      }
    },
    onError: () => {
      messageApi.error("Không thể gửi đánh giá. Vui lòng thử lại.");
    },
  });

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

  const previewReviews = reviewPreview?.reviews ?? [];
  const reviewAverageRating = Number(reviewPreview?.averageRating ?? 0);
  const reviewTitle = (
    <Flex align="center" className="restaurant-detail__review-title" gap={8}>
      <Typography.Text strong>Đánh giá</Typography.Text>
      <Flex align="center" className="restaurant-detail__review-title-score" gap={4}>
        <Typography.Text strong>
          {reviewAverageRating > 0 ? reviewAverageRating.toFixed(1) : "0.0"}
        </Typography.Text>
        <StarFilled />
      </Flex>
    </Flex>
  );

  const formatReviewDate = (value: string) => {
    if (!value) {
      return "";
    }

    const parsedDate = dayjs(value);

    return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY HH:mm") : value;
  };

  const appendModalReviews = (
    nextReviews: RestaurantReview[],
    bloomFilter = reviewBloomFilter,
  ) => {
    const uniqueReviews = nextReviews.filter((review) => {
      if (bloomFilter.has(review.id)) {
        return false;
      }

      bloomFilter.add(review.id);

      return true;
    });

    if (uniqueReviews.length > 0) {
      setModalReviews((currentReviews) => [...currentReviews, ...uniqueReviews]);
    }
  };

  const openReviewModal = async () => {
    const nextBloomFilter = new ReviewBloomFilter();

    setReviewBloomFilter(nextBloomFilter);
    setModalReviews([]);
    setModalReviewPage(0);
    setModalReviewTotalPages(0);
    setIsReviewModalOpen(true);
    setIsLoadingMoreReviews(true);

    try {
      const firstPage = await reviewService.getByRestaurant(restaurantId, {
        page: 0,
        size: modalReviewPageSize,
      });

      appendModalReviews(firstPage.reviews, nextBloomFilter);
      setModalReviewPage(firstPage.page + 1);
      setModalReviewTotalPages(firstPage.totalPages);
    } catch {
      messageApi.error("Không thể tải danh sách đánh giá.");
    } finally {
      setIsLoadingMoreReviews(false);
    }
  };

  const loadMoreReviews = async () => {
    if (
      isLoadingMoreReviews ||
      modalReviewPage >= modalReviewTotalPages ||
      !restaurantId
    ) {
      return;
    }

    setIsLoadingMoreReviews(true);

    try {
      const nextPage = await reviewService.getByRestaurant(restaurantId, {
        page: modalReviewPage,
        size: modalReviewPageSize,
      });

      appendModalReviews(nextPage.reviews);
      setModalReviewPage(nextPage.page + 1);
      setModalReviewTotalPages(nextPage.totalPages);
    } catch {
      messageApi.error("Không thể tải thêm đánh giá.");
    } finally {
      setIsLoadingMoreReviews(false);
    }
  };

  const handleReviewModalScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    if (distanceToBottom < 96) {
      loadMoreReviews();
    }
  };

  const handleSubmitReview = () => {
    const normalizedContent = reviewContent.trim();

    if (!normalizedContent) {
      messageApi.warning("Vui lòng nhập nội dung đánh giá.");

      return;
    }

    if (!getAccessToken()) {
      navigate("/login");

      return;
    }

    createReviewMutation.mutate();
  };

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
      {messageContextHolder}
      <Row align="top" gutter={[16, 16]}>
        <Col lg={15} span={24}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card className="restaurant-detail__info-card">
              <Button
                aria-label={restaurant.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                className={`favorite-button restaurant-detail__favorite-button ${
                  restaurant.favorite ? "favorite-button--active" : ""
                }`}
                icon={restaurant.favorite ? <HeartFilled /> : <HeartOutlined />}
                loading={favoriteMutation.isPending}
                shape="circle"
                type="text"
                onClick={() => {
                  if (!getAccessToken()) {
                    navigate("/login");

                    return;
                  }

                  favoriteMutation.mutate({
                    favorite: restaurant.favorite,
                    restaurantId: restaurant.id,
                  });
                }}
              />
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
        <Col span={24}>
          <Card className="restaurant-detail__review-card" title={reviewTitle}>
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
              {isReviewsLoading ? (
                <Spin>
                  <div className="restaurant-detail__review-loading">
                    Đang tải đánh giá...
                  </div>
                </Spin>
              ) : previewReviews.length > 0 ? (
                <div className="restaurant-detail__review-list">
                  {previewReviews.map((review) => (
                    <div className="restaurant-detail__review-item" key={review.id}>
                      <Flex align="start" justify="space-between" gap={12}>
                        <Space direction="vertical" size={4}>
                          <Typography.Text strong>{review.author}</Typography.Text>
                          <Rate disabled value={review.rating} />
                        </Space>
                        <Typography.Text type="secondary">
                          {formatReviewDate(review.createdAt)}
                        </Typography.Text>
                      </Flex>
                      <Typography.Paragraph className="restaurant-detail__review-content">
                        {review.content}
                      </Typography.Paragraph>
                    </div>
                  ))}
                </div>
              ) : (
                <TrangThaiRong description="Chưa có đánh giá nào." />
              )}
              {(reviewPreview?.totalElements ?? 0) > previewReviewSize ? (
                <Button
                  className="restaurant-detail__show-reviews-button"
                  type="text"
                  onClick={openReviewModal}
                >
                  Hiển thị tất cả
                </Button>
              ) : null}
              <div className="restaurant-detail__review-form">
                <Rate value={reviewRating} onChange={setReviewRating} />
                <Input
                  className="restaurant-detail__review-input"
                  placeholder="Nhập đánh giá của bạn"
                  value={reviewContent}
                  onChange={(event) => setReviewContent(event.target.value)}
                  onPressEnter={handleSubmitReview}
                />
                <Button
                  aria-label="Gửi đánh giá"
                  className="restaurant-detail__review-submit"
                  icon={<SendOutlined />}
                  loading={createReviewMutation.isPending}
                  shape="circle"
                  type="primary"
                  onClick={handleSubmitReview}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      <Modal
        centered
        footer={null}
        open={isReviewModalOpen}
        title="Tất cả đánh giá"
        width={720}
        onCancel={() => setIsReviewModalOpen(false)}
      >
        <div
          className="restaurant-detail__review-modal-list"
          onScroll={handleReviewModalScroll}
        >
          {modalReviews.length > 0 ? (
            modalReviews.map((review) => (
              <div className="restaurant-detail__review-item" key={review.id}>
                <Flex align="start" justify="space-between" gap={12}>
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>{review.author}</Typography.Text>
                    <Rate disabled value={review.rating} />
                  </Space>
                  <Typography.Text type="secondary">
                    {formatReviewDate(review.createdAt)}
                  </Typography.Text>
                </Flex>
                <Typography.Paragraph className="restaurant-detail__review-content">
                  {review.content}
                </Typography.Paragraph>
              </div>
            ))
          ) : !isLoadingMoreReviews ? (
            <TrangThaiRong description="Chưa có đánh giá nào." />
          ) : null}
          {isLoadingMoreReviews ? (
            <Flex justify="center" className="restaurant-detail__review-more-loading">
              <Spin />
            </Flex>
          ) : null}
        </div>
      </Modal>
    </KhungTrang>
  );
}

export default CuaHangDetailPage;
