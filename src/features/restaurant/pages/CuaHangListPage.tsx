import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  AimOutlined,
  RightOutlined,
  SearchOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Flex, Input, Space, Typography, message } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import TheTrangThai from "@/components/common/TheTrangThai";
import {
  AREA_QUERY_KEY,
  FOOD_DETAIL_QUERY_KEY,
  FoodCategoryFilter,
  getAreaByValue,
  getFoodFilterByPath,
} from "@/config/food-filter.config";
import { favoriteService } from "@/features/restaurant/services/favorite.service";
import {
  buildDistanceCacheKey,
  getCachedDistance,
  getDrivingDistance,
  saveCachedDistance,
  type RouteDistance,
} from "@/features/restaurant/services/distance.service";
import { useRestaurantList } from "@/features/restaurant/hooks/useRestaurantList";
import { useDebounce } from "@/hooks/useDebounce";
import {
  clearLocationPromptPending,
  getUserSessionLocation,
  hasLocationPromptPending,
  saveUserSessionLocation,
  type UserSessionLocation,
} from "@/utils/session-location";
import { getAccessToken } from "@/utils/token";

function CuaHangListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState<UserSessionLocation | null>(
    () => getUserSessionLocation(),
  );
  const [restaurantDistances, setRestaurantDistances] = useState<
    Record<string, RouteDistance>
  >({});
  const requestedDistanceIds = useRef(new Set<string>());
  const debouncedKeyword = useDebounce(keyword);
  const currentCategory = getFoodFilterByPath(location.pathname);
  const isHomePage = currentCategory.value === FoodCategoryFilter.HOME;
  const currentDetail = currentCategory.children?.find(
    (option) => option.value === searchParams.get(FOOD_DETAIL_QUERY_KEY),
  );
  const currentArea = getAreaByValue(searchParams.get(AREA_QUERY_KEY));
  const { data, isLoading } = useRestaurantList({
    keyword: debouncedKeyword,
    category: isHomePage ? undefined : currentCategory.value,
    detail: currentDetail?.value,
    page: 0,
    size: 10,
  });
  const pageTitle = currentDetail?.label ?? currentCategory.label;
  const pageDescription = currentDetail
    ? `${currentCategory.label} - ${currentDetail.label} tại ${currentArea.label}.`
    : `${currentCategory.description} Khu vực: ${currentArea.label}.`;
  const items = data?.items ?? [];

  useEffect(() => {
    setShowLocationPrompt(isHomePage && hasLocationPromptPending());
  }, [isHomePage]);

  useEffect(() => {
    if (!userLocation || items.length === 0) {
      return;
    }

    const origin = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };
    const cachedDistances: Record<string, RouteDistance> = {};
    const targetItems = items.filter((item) => {
      if (
        item.latitude === null ||
        item.longitude === null ||
        restaurantDistances[item.id] ||
        requestedDistanceIds.current.has(item.id)
      ) {
        return false;
      }

      const destination = {
        latitude: item.latitude,
        longitude: item.longitude,
      };
      const cacheKey = buildDistanceCacheKey(item.id, origin, destination);
      const cachedDistance = getCachedDistance(cacheKey);

      if (cachedDistance) {
        cachedDistances[item.id] = cachedDistance;

        return false;
      }

      return true;
    });

    if (Object.keys(cachedDistances).length > 0) {
      setRestaurantDistances((current) => ({
        ...current,
        ...cachedDistances,
      }));
    }

    if (targetItems.length === 0) {
      return;
    }

    let isActive = true;
    targetItems.forEach((item) => requestedDistanceIds.current.add(item.id));

    Promise.allSettled(
      targetItems.map(async (item) => {
        const destination = {
          latitude: item.latitude ?? 0,
          longitude: item.longitude ?? 0,
        };
        const distance = await getDrivingDistance(origin, destination);

        saveCachedDistance(
          buildDistanceCacheKey(item.id, origin, destination),
          distance,
        );

        return {
          restaurantId: item.id,
          distance,
        };
      }),
    ).then((results) => {
      if (!isActive) {
        return;
      }

      const nextDistances: Record<string, RouteDistance> = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          nextDistances[result.value.restaurantId] = result.value.distance;
        }
      });

      if (Object.keys(nextDistances).length > 0) {
        setRestaurantDistances((current) => ({
          ...current,
          ...nextDistances,
        }));
      }
    });

    return () => {
      isActive = false;
    };
  }, [items, restaurantDistances, userLocation]);

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
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: () => {
      messageApi.error("Không thể cập nhật yêu thích. Vui lòng thử lại.");
    },
  });

  const openDetail = (restaurantId: string) => {
    navigate(`/cua-hang/${restaurantId}`);
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    restaurantId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail(restaurantId);
    }
  };

  const toggleFavorite = (restaurantId: string, favorite: boolean) => {
    if (!getAccessToken()) {
      navigate("/login");

      return;
    }

    favoriteMutation.mutate({ favorite, restaurantId });
  };

  const dismissLocationPrompt = () => {
    clearLocationPromptPending();
    setShowLocationPrompt(false);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      messageApi.warning("Trình duyệt không hỗ trợ lấy vị trí.");
      dismissLocationPrompt();

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
          capturedAt: new Date().toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        saveUserSessionLocation(nextLocation);
        setUserLocation(nextLocation);
        messageApi.success("Đã lưu vị trí tạm thời trong phiên đăng nhập.");
        dismissLocationPrompt();
      },
      () => {
        // messageApi.warning("Không thể lấy vị trí. Bạn vẫn có thể sử dụng FoodMap bình thường.");
        dismissLocationPrompt();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  };

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      {messageContextHolder}
      {showLocationPrompt ? (
        <Alert
          action={
            <Space size={8}>
              <Button size="small" onClick={dismissLocationPrompt}>
                Không chia sẻ
              </Button>
              <Button size="small" type="primary" onClick={requestLocation}>
                Chia sẻ vị trí
              </Button>
            </Space>
          }
          closable
          description="FoodMap có thể dùng vị trí hiện tại để gợi ý quán ăn gần bạn trong phiên sử dụng này."
          message="Bạn có muốn chia sẻ vị trí không?"
          showIcon
          type="info"
          onClose={dismissLocationPrompt}
        />
      ) : null}
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
          <div
            className="offer-card"
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => openDetail(item.id)}
            onKeyDown={(event) => handleCardKeyDown(event, item.id)}
          >
            <Button
              aria-label={item.favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              className={`favorite-button ${item.favorite ? "favorite-button--active" : ""}`}
              icon={item.favorite ? <HeartFilled /> : <HeartOutlined />}
              loading={favoriteMutation.isPending}
              shape="circle"
              type="text"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(item.id, item.favorite);
              }}
            />
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
              {restaurantDistances[item.id] ? (
                <Flex align="center" className="offer-card__distance" gap={6}>
                  <AimOutlined />
                  <Typography.Text>
                    Cách bạn{" "}
                    <Typography.Text strong>
                      {restaurantDistances[item.id].distanceKm.toFixed(1)} km
                    </Typography.Text>
                  </Typography.Text>
                </Flex>
              ) : null}
              <Flex align="center" className="offer-card__rating" gap={6}>
                <StarFilled />
                <Typography.Text strong>
                  {item.averageRating > 0 ? item.averageRating.toFixed(1) : "Chưa có đánh giá"}
                </Typography.Text>
                {item.reviewCount > 0 ? (
                  <Typography.Text type="secondary">
                    ({item.reviewCount})
                  </Typography.Text>
                ) : null}
              </Flex>
            </div>
            <div className="offer-card__footer">
              <span>Mở cửa đến {item.closeTime}</span>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <Typography.Text>Đang tải danh sách quán ăn...</Typography.Text>
      ) : null}
    </Space>
  );
}

export default CuaHangListPage;
