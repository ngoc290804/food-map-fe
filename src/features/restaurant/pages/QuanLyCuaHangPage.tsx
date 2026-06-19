import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  TimePicker,
  Typography,
  Upload,
  message,
} from "antd";
import type { TableProps, UploadProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { LeafletEvent, LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import Gallery, {
  type PhotoProps,
  type RenderImageProps,
} from "react-photo-gallery";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { APP_AUTHORITIES, DEFAULT_PAGE_SIZE } from "@/config/constants";
import {
  FoodCategoryFilter,
  FoodDetailFilter,
  foodFilterMenuOptions,
} from "@/config/food-filter.config";
import { useRestaurantList } from "@/features/restaurant/hooks/useRestaurantList";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  type MenuItemPayload,
  restaurantService,
  type RestaurantPayload,
} from "@/features/restaurant/services/restaurant.service";
import type { RestaurantDto } from "@/features/restaurant/types/restaurant.dto";
import { useDebounce } from "@/hooks/useDebounce";
import { uploadService } from "@/services/upload/upload.service";

type MenuManagePhoto = PhotoProps<{
  title?: string;
}>;

type MenuManageItem = {
  id: string;
  name: string;
  price: number;
  mainIngredient: string;
  description: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  imageFile?: File | null;
  available: boolean;
};

type RestaurantManageItem = {
  id: string;
  ownerId: string | null;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: FoodCategoryFilter;
  detail: FoodDetailFilter;
  openTime: string;
  closeTime: string;
  active: boolean;
  menuItems: MenuManageItem[];
};

type RestaurantFormValues = {
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string | null;
  category?: FoodCategoryFilter;
  detail?: FoodDetailFilter;
  openTime?: Dayjs;
  closeTime?: Dayjs;
  active?: boolean;
};

type MenuFormValues = {
  name: string;
  price: number;
  mainIngredient: string;
  description?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  available?: boolean;
};

const emptyRestaurants: RestaurantManageItem[] = [];
type MapPosition = [number, number];

const defaultRestaurantPosition: MapPosition = [10.7769, 106.7009];
const defaultRestaurantMapZoom = 16;
const selectedRestaurantMapZoom = 17;

function createEmptyRestaurant(): RestaurantManageItem {
  const detail = getCategoryDetailOptions(FoodCategoryFilter.RESTAURANT)[0];

  return {
    id: `restaurant-${Date.now()}`,
    ownerId: null,
    name: "",
    address: "",
    latitude: null,
    longitude: null,
    description: "",
    imageUrl: null,
    imagePublicId: null,
    category: FoodCategoryFilter.RESTAURANT,
    detail: detail?.value ?? FoodDetailFilter.BUN_PHO,
    openTime: "08:00",
    closeTime: "22:00",
    active: true,
    menuItems: [],
  };
}

function timeToDayjs(value?: string) {
  const normalizedValue = value?.match(/^(\d{2}:\d{2})/)?.[1];

  return normalizedValue
    ? dayjs(`2000-01-01T${normalizedValue}:00`)
    : undefined;
}

function formatTime(value?: Dayjs) {
  return value ? value.format("HH:mm") : "";
}

function normalizeFormCoordinate(value?: number | string | null) {
  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : null;
}

function isValidRestaurantPosition(latitude?: number | null, longitude?: number | null) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }

  return Math.abs(latitude) > 0.01 || Math.abs(longitude) > 0.01;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const manageableCategoryValues: FoodCategoryFilter[] = [
  FoodCategoryFilter.RESTAURANT,
  FoodCategoryFilter.PUB,
  FoodCategoryFilter.DRINK,
  FoodCategoryFilter.CAFE,
  FoodCategoryFilter.DESSERT_SNACK,
];

const categoryOptions = foodFilterMenuOptions
  .filter((option) => manageableCategoryValues.includes(option.value))
  .map((option) => ({
    value: option.value,
    label: option.label,
  }));

function getCategoryDetailOptions(category?: FoodCategoryFilter) {
  return (
    foodFilterMenuOptions
      .find((option) => option.value === category)
      ?.children?.map((option) => ({
        value: option.value,
        label: option.label,
      })) ?? []
  );
}

function getManageableCategory(category?: FoodCategoryFilter) {
  return category && manageableCategoryValues.includes(category)
    ? category
    : FoodCategoryFilter.RESTAURANT;
}

function getManageableDetail(
  category: FoodCategoryFilter,
  detail?: FoodDetailFilter,
) {
  const detailOptions = getCategoryDetailOptions(category);

  return detail && detailOptions.some((option) => option.value === detail)
    ? detail
    : (detailOptions[0]?.value ?? FoodDetailFilter.BUN_PHO);
}

function RestaurantMapCenter({ position }: { position: MapPosition }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, selectedRestaurantMapZoom);
  }, [map, position]);

  return null;
}

function RestaurantMapSizeFixer() {
  const map = useMap();

  useEffect(() => {
    const invalidateMapSize = () => map.invalidateSize();
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(invalidateMapSize);
    const timeoutId = window.setTimeout(invalidateMapSize, 250);

    resizeObserver.observe(container);
    invalidateMapSize();

    return () => {
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

function RestaurantLocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (position: MapPosition) => void;
}) {
  const selectedPosition =
    isValidRestaurantPosition(latitude, longitude)
      ? ([latitude, longitude] as MapPosition)
      : null;
  const center = selectedPosition ?? defaultRestaurantPosition;

  const handleChange = useCallback(
    (position: MapPosition) => {
      onChange([
        Number(position[0].toFixed(7)),
        Number(position[1].toFixed(7)),
      ]);
    },
    [onChange],
  );

  function MapClickHandler() {
    useMapEvents({
      click(event: LeafletMouseEvent) {
        handleChange([event.latlng.lat, event.latlng.lng]);
      },
    });

    return null;
  }

  return (
    <div className="restaurant-management__location-picker">
      <MapContainer
        center={center}
        className="restaurant-management__location-map"
        zoom={selectedPosition ? selectedRestaurantMapZoom : defaultRestaurantMapZoom}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={19}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RestaurantMapSizeFixer />
        <MapClickHandler />
        {selectedPosition ? (
          <>
            <RestaurantMapCenter position={selectedPosition} />
            <Marker
              draggable
              position={selectedPosition}
              eventHandlers={{
                dragend: (event: LeafletEvent) => {
                  const marker = event.target as LeafletMarker;
                  const position = marker.getLatLng();

                  handleChange([position.lat, position.lng]);
                },
              }}
            />
          </>
        ) : null}
      </MapContainer>
      <Typography.Text
        className="restaurant-management__location-help"
        type={selectedPosition ? "secondary" : "danger"}
      >
        {selectedPosition
          ? `Tọa độ đã chọn: ${selectedPosition[0].toFixed(7)}, ${selectedPosition[1].toFixed(7)}`
          : "Bấm vào bản đồ để chọn vị trí chính xác của quán."}
      </Typography.Text>
    </div>
  );
}

function mapRestaurantDtoToManageItem(
  item: RestaurantDto,
): RestaurantManageItem {
  const category = getManageableCategory(item.loaiCuaHang);

  return {
    id: item.id,
    ownerId: item.ownerId,
    name: item.name,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    description: item.description,
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId,
    category,
    detail: getManageableDetail(category, item.loaiKinhDoanh),
    openTime: item.openTime,
    closeTime: item.closeTime,
    active: item.status === "ACTIVE",
    menuItems: [],
  };
}

function buildRestaurantPayload(
  values: RestaurantFormValues,
  status?: string,
  imageFile?: File | null,
): RestaurantPayload {
  const category = values.category ?? FoodCategoryFilter.RESTAURANT;
  const detail = values.detail ?? getManageableDetail(category);

  return {
    name: values.name,
    address: values.address,
    latitude: normalizeFormCoordinate(values.latitude),
    longitude: normalizeFormCoordinate(values.longitude),
    openTime: formatTime(values.openTime),
    closeTime: formatTime(values.closeTime),
    description: values.description ?? "",
    imageUrl: values.imageUrl?.trim() || null,
    imageFile: imageFile ?? null,
    imagePublicId: values.imagePublicId ?? null,
    loaiCuaHang: category,
    loaiKinhDoanh: detail,
    ...(status ? { status } : {}),
  };
}

function buildMenuItemPayload(
  restaurantId: string,
  values: MenuFormValues,
): MenuItemPayload {
  return {
    idCuaHang: restaurantId,
    tenMonAn: values.name,
    giaTien: values.price,
    nguyenLieuChinh: values.mainIngredient,
    moTa: values.description ?? "",
    hinhAnh: values.imageUrl ?? null,
    imagePublicId: values.imagePublicId ?? null,
    conBan: values.available ?? true,
  };
}

function getRestaurantFormValues(item: RestaurantManageItem): RestaurantFormValues {
  return {
    name: item.name,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    description: item.description,
    imageUrl: item.imageUrl ?? "",
    imagePublicId: item.imagePublicId,
    category: item.category,
    detail: item.detail,
    openTime: timeToDayjs(item.openTime),
    closeTime: timeToDayjs(item.closeTime),
    active: item.active,
  };
}

function hasRole(roles: string[] | undefined, role: string) {
  const normalizedRole = role.toLowerCase();

  return (
    roles?.some((item) => {
      const normalizedItem = item.toLowerCase();

      return normalizedItem === normalizedRole || normalizedItem === `role_${normalizedRole}`;
    }) ?? false
  );
}

function isNotFoundError(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 404;
}

function QuanLyCuaHangPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isStoreOwnerMode = hasRole(user?.roles, APP_AUTHORITIES.STORE_OWNER);
  const [messageApi, messageContextHolder] = message.useMessage();
  const [restaurantForm] = Form.useForm<RestaurantFormValues>();
  const [menuForm] = Form.useForm<MenuFormValues>();
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [restaurantPageSize, setRestaurantPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const { data: restaurantData, isLoading: isRestaurantListLoading } =
    useRestaurantList({
      page: restaurantPage - 1,
      size: restaurantPageSize,
      enabled: !isStoreOwnerMode,
    });
  const {
    data: ownerRestaurant,
    isLoading: isOwnerRestaurantLoading,
  } = useQuery({
    enabled: isStoreOwnerMode,
    queryKey: ["restaurant-mine"],
    queryFn: async () => {
      try {
        return await restaurantService.getMyRestaurant();
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }

        throw error;
      }
    },
  });
  const restaurantRows = useMemo(
    () =>
      restaurantData?.items.map(mapRestaurantDtoToManageItem) ??
      emptyRestaurants,
    [restaurantData?.items],
  );
  const [restaurants, setRestaurants] =
    useState<RestaurantManageItem[]>(emptyRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantManageItem | null>(null);
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
  const [restaurantImageFile, setRestaurantImageFile] = useState<File | null>(
    null,
  );
  const [menuImageSizes, setMenuImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuListError, setMenuListError] = useState(false);
  const selectedRestaurantId = selectedRestaurant?.id;
  const menuRestaurantId = isStoreOwnerMode
    ? ownerRestaurant?.id
    : selectedRestaurantId;
  const selectedCategory =
    Form.useWatch("category", restaurantForm) ??
    selectedRestaurant?.category ??
    FoodCategoryFilter.RESTAURANT;
  const selectedAddress = Form.useWatch("address", restaurantForm)?.trim() ?? "";
  const debouncedAddress = useDebounce(selectedAddress, 650);
  const selectedLatitude = Form.useWatch("latitude", restaurantForm);
  const selectedLongitude = Form.useWatch("longitude", restaurantForm);
  const imageUrlPreview = Form.useWatch("imageUrl", restaurantForm)?.trim();
  const detailOptions = getCategoryDetailOptions(selectedCategory);
  const normalizedSelectedLatitude = normalizeFormCoordinate(selectedLatitude);
  const normalizedSelectedLongitude = normalizeFormCoordinate(selectedLongitude);
  const shouldAutoGeocodeAddress =
    debouncedAddress.length >= 3 &&
    (isCreatingRestaurant ||
      !isValidRestaurantPosition(
        normalizedSelectedLatitude,
        normalizedSelectedLongitude,
      ) ||
      debouncedAddress !== (selectedRestaurant?.address?.trim() ?? ""));
  const [lastAutoGeocodedAddress, setLastAutoGeocodedAddress] = useState("");
  const {
    data: autoGeocodedLocation,
    isFetching: isAutoGeocodingAddress,
  } = useQuery({
    enabled: shouldAutoGeocodeAddress,
    queryKey: ["restaurant-geocode", debouncedAddress],
    queryFn: () => restaurantService.geocodeAddress(debouncedAddress),
    staleTime: 5 * 60 * 1000,
  });
  const createRestaurantMutation = useMutation({
    mutationFn: (payload: RestaurantPayload) =>
      restaurantService.create(payload),
  });
  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RestaurantPayload }) =>
      restaurantService.update(id, payload),
  });
  const deleteRestaurantMutation = useMutation({
    mutationFn: (id: string) => restaurantService.delete(id),
  });
  const createMenuItemMutation = useMutation({
    mutationFn: ({
      restaurantId,
      payload,
    }: {
      restaurantId: string;
      payload: MenuItemPayload;
    }) => restaurantService.createMenuItem(restaurantId, payload),
  });
  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MenuItemPayload }) =>
      restaurantService.updateMenuItem(id, payload),
  });
  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: string) => restaurantService.deleteMenuItem(id),
  });
  const {
    data: fetchedMenuItems = [],
    error: menuItemsError,
    isLoading: isMenuItemsLoading,
  } = useQuery({
      enabled: Boolean(
        menuRestaurantId &&
          (restaurantModalOpen || isStoreOwnerMode) &&
          !isCreatingRestaurant,
      ),
      queryKey: ["restaurant-menu-items", menuRestaurantId],
      queryFn: () => restaurantService.getMenuItems(menuRestaurantId ?? ""),
    });
  const isSavingRestaurant =
    createRestaurantMutation.isPending || updateRestaurantMutation.isPending;
  const isDeletingRestaurant = deleteRestaurantMutation.isPending;
  const isSavingMenuItem =
    createMenuItemMutation.isPending || updateMenuItemMutation.isPending;
  const isDeletingMenuItem = deleteMenuItemMutation.isPending;
  const selectedMenuItems: MenuManageItem[] = isCreatingRestaurant
    ? (selectedRestaurant?.menuItems ?? [])
    : fetchedMenuItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        mainIngredient: item.mainIngredient,
        description: item.description,
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId,
        available: item.available,
      }));
  const selectedMenuImages = selectedMenuItems.filter((item) => item.imageUrl);
  const menuGalleryPhotos = useMemo<MenuManagePhoto[]>(
    () =>
      selectedMenuImages.map((item) => {
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
    [menuImageSizes, selectedMenuImages],
  );

  useEffect(() => {
    selectedMenuImages.forEach((item) => {
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
  }, [menuImageSizes, selectedMenuImages]);

  useEffect(() => {
    setLastAutoGeocodedAddress("");
  }, [isCreatingRestaurant, selectedRestaurantId]);

  useEffect(() => {
    if (
      !autoGeocodedLocation ||
      !shouldAutoGeocodeAddress ||
      debouncedAddress !== selectedAddress ||
      lastAutoGeocodedAddress === debouncedAddress
    ) {
      return;
    }

    restaurantForm.setFieldsValue({
      latitude: autoGeocodedLocation.latitude,
      longitude: autoGeocodedLocation.longitude,
    });
    setLastAutoGeocodedAddress(debouncedAddress);
  }, [
    autoGeocodedLocation,
    debouncedAddress,
    lastAutoGeocodedAddress,
    restaurantForm,
    selectedAddress,
    shouldAutoGeocodeAddress,
  ]);

  useEffect(() => {
    if (menuItemsError) {
      messageApi.error("Không thể tải danh sách món ăn của quán.");
    }
  }, [menuItemsError, messageApi]);

  const renderMenuGalleryPhoto = ({
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

  const selectMenuItemImage = async (record: MenuManageItem, file: File) => {
    if (!file.type.startsWith("image/")) {
      messageApi.error("Vui lòng chọn file hình ảnh.");

      return Upload.LIST_IGNORE;
    }

    if (!selectedRestaurant) {
      return Upload.LIST_IGNORE;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);

      if (isCreatingRestaurant) {
        setSelectedRestaurant((current) =>
          current
            ? {
                ...current,
                menuItems: current.menuItems.map((item) =>
                  item.id === record.id
                    ? {
                        ...item,
                        imageUrl: previewUrl,
                        imageFile: file,
                        imagePublicId: null,
                      }
                    : item,
                ),
              }
            : current,
        );
      } else {
        const uploadedImage = await uploadService.uploadImage(file);
        await updateMenuItemMutation.mutateAsync({
          id: record.id,
          payload: buildMenuItemPayload(selectedRestaurant.id, {
            ...record,
            imageUrl: uploadedImage.url,
            imagePublicId: uploadedImage.publicId,
          }),
        });
        await queryClient.invalidateQueries({
          queryKey: ["restaurant-menu-items", selectedRestaurant.id],
        });
        messageApi.success("Đã cập nhật ảnh món ăn");
      }
    } catch {
      messageApi.error("Không thể cập nhật ảnh món ăn. Vui lòng thử lại.");
    }

    return false;
  };

  useEffect(() => {
    setRestaurants(restaurantRows);
  }, [restaurantRows]);

  useEffect(() => {
    if (!isStoreOwnerMode || isOwnerRestaurantLoading) {
      return;
    }

    setMenuListError(false);
    setRestaurantImageFile(null);

    if (ownerRestaurant) {
      const nextRestaurant = mapRestaurantDtoToManageItem(ownerRestaurant);

      setSelectedRestaurant(nextRestaurant);
      setIsCreatingRestaurant(false);
      restaurantForm.setFieldsValue(getRestaurantFormValues(nextRestaurant));
      return;
    }

    const emptyRestaurant = createEmptyRestaurant();

    setSelectedRestaurant(emptyRestaurant);
    setIsCreatingRestaurant(true);
    restaurantForm.setFieldsValue(getRestaurantFormValues(emptyRestaurant));
  }, [
    isOwnerRestaurantLoading,
    isStoreOwnerMode,
    ownerRestaurant,
    restaurantForm,
  ]);

  useEffect(() => {
    if (!selectedRestaurant || (!restaurantModalOpen && !isStoreOwnerMode)) {
      return;
    }

    if (isCreatingRestaurant) {
      return;
    }

    restaurantForm.setFieldsValue(getRestaurantFormValues(selectedRestaurant));
  }, [isCreatingRestaurant, restaurantForm, restaurantModalOpen, selectedRestaurant]);

  const restaurantColumns: TableProps<RestaurantManageItem>["columns"] = [
    {
      title: "STT",
      width: 72,
      render: (_value, _record, index) =>
        (restaurantPage - 1) * restaurantPageSize + index + 1,
    },
    {
      title: "Tên quán",
      dataIndex: "name",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Giờ mở cửa",
      dataIndex: "openTime",
      width: 130,
    },
    {
      title: "Giờ đóng cửa",
      dataIndex: "closeTime",
      width: 140,
    },
  ];

  const menuColumns: TableProps<MenuManageItem>["columns"] = [
    {
      title: "Tên món",
      dataIndex: "name",
    },
    {
      title: "Giá món",
      dataIndex: "price",
      render: (value?: number) =>
        `${Number(value ?? 0).toLocaleString("vi-VN")} đ`,
      width: 120,
    },
    {
      title: "Nguyên liệu chính",
      dataIndex: "mainIngredient",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      render: (_value, record) => (
        <Space align="center" size={8}>
          {record.imageUrl ? (
            <Image
              alt={record.name}
              height={44}
              src={record.imageUrl}
              style={{ borderRadius: 8, objectFit: "cover" }}
              width={44}
            />
          ) : (
            <Flex
              align="center"
              justify="center"
              style={{
                background: "var(--app-muted-bg)",
                borderRadius: 8,
                height: 44,
                width: 44,
              }}
            >
              <PictureOutlined />
            </Flex>
          )}
          <Upload
            accept="image/*"
            beforeUpload={(file) => selectMenuItemImage(record, file)}
            maxCount={1}
            showUploadList={false}
          >
            <Button
              icon={<UploadOutlined />}
              loading={!isCreatingRestaurant && isSavingMenuItem}
              size="small"
            >
              {record.imageUrl ? "Đổi ảnh" : "Chọn ảnh"}
            </Button>
          </Upload>
        </Space>
      ),
      width: 190,
    },
    {
      title: "Trạng thái",
      dataIndex: "available",
      render: (value: boolean) => (value ? "Còn bán" : "Ngừng bán"),
      width: 120,
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_value, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="link"
            onClick={() => openEditMenuModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            cancelText="Hủy"
            okText="Xóa"
            title="Xóa món ăn này?"
            onConfirm={() => deleteMenuItem(record.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingMenuItem}
              size="small"
              type="link"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const selectRestaurant = (record: RestaurantManageItem) => {
    setMenuListError(false);
    setRestaurantImageFile(null);
    setSelectedRestaurant({
      ...record,
      menuItems: [...record.menuItems],
    });
    setIsCreatingRestaurant(false);
    setRestaurantModalOpen(true);
  };

  const openCreateRestaurantForm = () => {
    const emptyRestaurant = createEmptyRestaurant();

    setMenuListError(false);
    setRestaurantImageFile(null);
    restaurantForm.resetFields();
    restaurantForm.setFieldsValue(getRestaurantFormValues(emptyRestaurant));
    setSelectedRestaurant(emptyRestaurant);
    setIsCreatingRestaurant(true);
    setRestaurantModalOpen(true);
  };

  const closeRestaurantModal = () => {
    setRestaurantModalOpen(false);
    setMenuModalOpen(false);
    setSelectedRestaurant(null);
    setIsCreatingRestaurant(false);
    setRestaurantImageFile(null);
    setEditingMenuId(null);
    setMenuListError(false);
    restaurantForm.resetFields();
    menuForm.resetFields();
  };

  const selectRestaurantImage: UploadProps["beforeUpload"] = async (file) => {
    if (!file.type.startsWith("image/")) {
      messageApi.error("Vui lòng chọn file hình ảnh.");

      return Upload.LIST_IGNORE;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      restaurantForm.setFieldValue("imageUrl", dataUrl);
      restaurantForm.setFieldValue("imagePublicId", null);
      setRestaurantImageFile(file);
    } catch {
      messageApi.error("Không thể đọc file hình ảnh. Vui lòng thử lại.");
    }

    return false;
  };

  const removeRestaurantImage = () => {
    restaurantForm.setFieldValue("imageUrl", "");
    restaurantForm.setFieldValue("imagePublicId", null);
    setRestaurantImageFile(null);
  };

  const selectRestaurantLocation = useCallback(
    ([latitude, longitude]: MapPosition) => {
      restaurantForm.setFieldsValue({ latitude, longitude });
    },
    [restaurantForm],
  );

  const openCreateMenuModal = () => {
    setEditingMenuId(null);
    menuForm.resetFields();
    menuForm.setFieldValue("available", true);
    setMenuModalOpen(true);
  };

  const openEditMenuModal = (record: MenuManageItem) => {
    setEditingMenuId(record.id);
    menuForm.setFieldsValue(record);
    setMenuModalOpen(true);
  };

  const saveMenuItem = async () => {
    const values = await menuForm.validateFields();

    if (!selectedRestaurant) {
      return;
    }

    const editingMenuItem = editingMenuId
      ? selectedMenuItems.find((item) => item.id === editingMenuId)
      : undefined;

    if (!isCreatingRestaurant) {
      try {
        if (editingMenuId) {
          await updateMenuItemMutation.mutateAsync({
            id: editingMenuId,
            payload: buildMenuItemPayload(selectedRestaurant.id, {
              ...values,
              imageUrl: editingMenuItem?.imageUrl,
              imagePublicId: editingMenuItem?.imagePublicId,
            }),
          });
          messageApi.success("Đã cập nhật món ăn");
        } else {
          await createMenuItemMutation.mutateAsync({
            restaurantId: selectedRestaurant.id,
            payload: buildMenuItemPayload(selectedRestaurant.id, values),
          });
          messageApi.success("Đã thêm món ăn");
        }

        await queryClient.invalidateQueries({
          queryKey: ["restaurant-menu-items", selectedRestaurant.id],
        });
        setMenuModalOpen(false);
        setEditingMenuId(null);
        setMenuListError(false);
        menuForm.resetFields();
      } catch {
        messageApi.error("Không thể lưu món ăn. Vui lòng thử lại.");
      }

      return;
    }

    setSelectedRestaurant((current) => {
      if (!current) {
        return current;
      }

      const nextMenuItem: MenuManageItem = {
        id: editingMenuId ?? `menu-${Date.now()}`,
        name: values.name,
        price: values.price,
        mainIngredient: values.mainIngredient,
        description: values.description ?? "",
        imageUrl: editingMenuItem?.imageUrl ?? null,
        imagePublicId: editingMenuItem?.imagePublicId ?? null,
        imageFile: editingMenuItem?.imageFile ?? null,
        available: values.available ?? true,
      };
      const menuItems = editingMenuId
        ? current.menuItems.map((item) =>
            item.id === editingMenuId ? nextMenuItem : item,
          )
        : [...current.menuItems, nextMenuItem];

      return {
        ...current,
        menuItems,
      };
    });

    setMenuModalOpen(false);
    setEditingMenuId(null);
    setMenuListError(false);
    menuForm.resetFields();
  };

  const deleteMenuItem = async (menuId: string) => {
    if (!selectedRestaurant) {
      return;
    }

    if (!isCreatingRestaurant) {
      try {
        await deleteMenuItemMutation.mutateAsync(menuId);
        await queryClient.invalidateQueries({
          queryKey: ["restaurant-menu-items", selectedRestaurant.id],
        });
        messageApi.success("Đã xóa món ăn");
      } catch {
        messageApi.error("Không thể xóa món ăn. Vui lòng thử lại.");
      }

      return;
    }

    setSelectedRestaurant((current) =>
      current
        ? {
            ...current,
            menuItems: current.menuItems.filter((item) => item.id !== menuId),
          }
        : current,
    );
  };

  const saveRestaurant = async () => {
    if (!selectedRestaurant) {
      return;
    }

    const values = await restaurantForm.validateFields();

    try {
      let savedRestaurant: RestaurantDto;

      if (isCreatingRestaurant) {
        const createdRestaurant = await createRestaurantMutation.mutateAsync(
          buildRestaurantPayload(values, undefined, restaurantImageFile),
        );
        savedRestaurant = createdRestaurant;
        await Promise.all(
          selectedRestaurant.menuItems.map(async (item) => {
            const uploadedImage = item.imageFile
              ? await uploadService.uploadImage(item.imageFile)
              : null;

            return restaurantService.createMenuItem(
              createdRestaurant.id,
              buildMenuItemPayload(createdRestaurant.id, {
                name: item.name,
                price: item.price,
                mainIngredient: item.mainIngredient,
                description: item.description,
                imageUrl: uploadedImage?.url ?? item.imageUrl,
                imagePublicId: uploadedImage?.publicId ?? item.imagePublicId,
                available: item.available,
              }),
            );
          }),
        );
        messageApi.success("Đã thêm quán ăn");
      } else {
        savedRestaurant = await updateRestaurantMutation.mutateAsync({
          id: selectedRestaurant.id,
          payload: buildRestaurantPayload(
            values,
            values.active ? "ACTIVE" : "INACTIVE",
            restaurantImageFile,
          ),
        });
        messageApi.success("Đã cập nhật quán ăn");
      }

      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      await queryClient.invalidateQueries({ queryKey: ["restaurant-mine"] });
      if (isStoreOwnerMode) {
        const nextRestaurant = mapRestaurantDtoToManageItem(savedRestaurant);

        setSelectedRestaurant(nextRestaurant);
        setIsCreatingRestaurant(false);
        setRestaurantImageFile(null);
        restaurantForm.setFieldsValue(getRestaurantFormValues(nextRestaurant));
        return;
      }

      closeRestaurantModal();
    } catch {
      messageApi.error("Không thể lưu quán ăn. Vui lòng thử lại.");
    }
  };

  const deleteRestaurant = async () => {
    if (!selectedRestaurant) {
      return;
    }

    try {
      await deleteRestaurantMutation.mutateAsync(selectedRestaurant.id);
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      messageApi.success("Đã xóa quán ăn");
      closeRestaurantModal();
    } catch {
      messageApi.error("Không thể xóa quán ăn. Vui lòng thử lại.");
    }
  };

  const restaurantEditor = selectedRestaurant ? (
    <>
      <Form form={restaurantForm} layout="vertical">
        <Form.Item
          label="Tên quán"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên quán" },
          ]}
        >
          <Input placeholder="Nhập tên quán" />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>
        {isAutoGeocodingAddress ? (
          <Typography.Text type="secondary">
            Đang tính tọa độ từ địa chỉ...
          </Typography.Text>
        ) : null}
        <Form.Item
          hidden
          name="latitude"
          rules={[
            { required: true, message: "Vui lòng chọn vị trí quán trên bản đồ" },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          hidden
          name="longitude"
          rules={[
            { required: true, message: "Vui lòng chọn vị trí quán trên bản đồ" },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item label="Vị trí trên bản đồ" required>
          <RestaurantLocationPicker
            latitude={normalizeFormCoordinate(selectedLatitude)}
            longitude={normalizeFormCoordinate(selectedLongitude)}
            onChange={selectRestaurantLocation}
          />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea placeholder="Nhập mô tả ngắn" rows={3} />
        </Form.Item>
        <Form.Item hidden name="imageUrl">
          <Input />
        </Form.Item>
        <Form.Item hidden name="imagePublicId">
          <Input />
        </Form.Item>
        <Form.Item label="Hình ảnh quán">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Space wrap>
              <Upload
                accept="image/*"
                beforeUpload={selectRestaurantImage}
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  {imageUrlPreview ? "Thay đổi hình ảnh" : "Chọn hình ảnh"}
                </Button>
              </Upload>
              {imageUrlPreview ? (
                <Button onClick={removeRestaurantImage}>Xóa hình ảnh</Button>
              ) : null}
            </Space>
            <Typography.Text type="secondary">
              Chọn file ảnh từ máy tính. Ảnh sẽ được hiển thị trước khi lưu.
            </Typography.Text>
          </Space>
        </Form.Item>
        {imageUrlPreview ? (
          <Image
            alt="Hình ảnh quán"
            height={180}
            src={imageUrlPreview}
            style={{
              borderRadius: 8,
              marginBottom: 16,
              objectFit: "cover",
            }}
            width="100%"
          />
        ) : null}
        <Row gutter={12}>
          <Col sm={12} span={24}>
            <Form.Item
              label="Nhóm chính"
              name="category"
              rules={[{ required: true, message: "Chọn nhóm chính" }]}
            >
              <Select
                options={categoryOptions}
                placeholder="Chọn nhóm chính"
                onChange={(value: FoodCategoryFilter) => {
                  restaurantForm.setFieldValue(
                    "detail",
                    getCategoryDetailOptions(value)[0]?.value,
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col sm={12} span={24}>
            <Form.Item
              label="Nhóm chi tiết"
              name="detail"
              rules={[
                { required: true, message: "Chọn nhóm chi tiết" },
              ]}
            >
              <Select
                disabled={detailOptions.length === 0}
                options={detailOptions}
                placeholder="Chọn nhóm chi tiết"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col sm={12} span={24}>
            <Form.Item
              label="Giờ mở cửa"
              name="openTime"
              rules={[{ required: true, message: "Chọn giờ mở cửa" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col sm={12} span={24}>
            <Form.Item
              label="Giờ đóng cửa"
              name="closeTime"
              rules={[{ required: true, message: "Chọn giờ đóng cửa" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="active" valuePropName="checked">
          <Checkbox>Còn hoạt động</Checkbox>
        </Form.Item>
      </Form>

      <Flex
        align="center"
        className="restaurant-management__menu-toolbar"
        justify="space-between"
      >
        <Typography.Title level={4}>Menu quán</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateMenuModal}
        >
          Thêm món ăn
        </Button>
      </Flex>
      <Table
        columns={menuColumns}
        dataSource={selectedMenuItems}
        loading={isMenuItemsLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 720 }}
        size="small"
      />
      {menuListError ? (
        <Typography.Text
          className="restaurant-management__menu-error"
          type="danger"
        >
          Vui lòng thêm ít nhất 1 món ăn trước khi lưu quán mới.
        </Typography.Text>
      ) : null}

      <Card
        className="restaurant-management__image-card"
        size="small"
        title="Ảnh món vừa thêm"
      >
        {menuGalleryPhotos.length > 0 ? (
          <Gallery
            direction="row"
            margin={8}
            photos={menuGalleryPhotos}
            renderImage={renderMenuGalleryPhoto}
            targetRowHeight={(containerWidth) =>
              containerWidth < 640 ? 120 : 150
            }
          />
        ) : (
          <Typography.Text type="secondary">
            Chưa có ảnh món ăn nào được chọn.
          </Typography.Text>
        )}
      </Card>

      <div className="restaurant-management__footer">
        <Button
          loading={isSavingRestaurant}
          type="primary"
          onClick={saveRestaurant}
        >
          Lưu
        </Button>
        {isCreatingRestaurant ? (
          !isStoreOwnerMode ? (
            <Button
              disabled={isSavingRestaurant}
              onClick={closeRestaurantModal}
            >
              Hủy
            </Button>
          ) : null
        ) : (
          <>
            {!isStoreOwnerMode ? (
              <Button
                disabled={isSavingRestaurant || isDeletingRestaurant}
                onClick={closeRestaurantModal}
              >
                Đóng
              </Button>
            ) : null}
            {!isStoreOwnerMode ? (
              <Popconfirm
                cancelText="Hủy"
                okText="Xóa"
                title="Xóa quán ăn này?"
                onConfirm={deleteRestaurant}
              >
                <Button danger loading={isDeletingRestaurant}>
                  Xóa
                </Button>
              </Popconfirm>
            ) : null}
          </>
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      {messageContextHolder}
      <Space className="restaurant-management" direction="vertical" size={20}>
        {isStoreOwnerMode ? (
          <>
            <Flex align="center" justify="space-between" wrap="wrap">
              <div>
                <Typography.Title level={2} style={{ marginBottom: 6 }}>
                  Quản lý quán ăn của bạn
                </Typography.Title>
                <Typography.Text type="secondary">
                  Cập nhật thông tin quán và menu món ăn đang kinh doanh.
                </Typography.Text>
              </div>
            </Flex>

            <Card
              loading={isOwnerRestaurantLoading}
              title={isCreatingRestaurant ? "Thêm mới quán ăn" : "Chi tiết quán ăn"}
            >
              {restaurantEditor}
            </Card>
          </>
        ) : (
          <>
        <Flex align="center" justify="space-between" wrap="wrap">
          <div>
            <Typography.Title level={2} style={{ marginBottom: 6 }}>
              Quản lý danh sách quán ăn
            </Typography.Title>
            <Typography.Text type="secondary">
              Chọn một dòng để xem chi tiết hoặc tạo mới quán ăn.
            </Typography.Text>
          </div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={openCreateRestaurantForm}
          >
            Thêm quán ăn
          </Button>
        </Flex>

        <Card title="Danh sách quán ăn">
          <Table
            className="restaurant-management__list-table"
            columns={restaurantColumns}
            dataSource={restaurants}
            loading={isRestaurantListLoading}
            pagination={{
              current: restaurantPage,
              pageSize: restaurantPageSize,
              pageSizeOptions: [10, 20, 50],
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} quán`,
              total: restaurantData?.totalElements ?? 0,
            }}
            rowKey="id"
            scroll={{ x: 760 }}
            onChange={(pagination) => {
              setRestaurantPage(pagination.current ?? 1);
              setRestaurantPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
            }}
            onRow={(record) => ({
              onClick: () => selectRestaurant(record),
            })}
          />
        </Card>

        <Modal
          destroyOnHidden
          footer={null}
          open={restaurantModalOpen}
          title={isCreatingRestaurant ? "Thêm mới quán ăn" : "Chi tiết quán ăn"}
          width={960}
          onCancel={closeRestaurantModal}
        >
          {selectedRestaurant ? (
            <>
              <Form form={restaurantForm} layout="vertical">
                <Form.Item
                  label="Tên quán"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên quán" },
                  ]}
                >
                  <Input placeholder="Nhập tên quán" />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
                {isAutoGeocodingAddress ? (
                  <Typography.Text type="secondary">
                    Đang tính tọa độ từ địa chỉ...
                  </Typography.Text>
                ) : null}
                <Form.Item
                  hidden
                  name="latitude"
                  rules={[
                    { required: true, message: "Vui lòng chọn vị trí quán trên bản đồ" },
                  ]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  hidden
                  name="longitude"
                  rules={[
                    { required: true, message: "Vui lòng chọn vị trí quán trên bản đồ" },
                  ]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item label="Vị trí trên bản đồ" required>
                  <RestaurantLocationPicker
                    latitude={normalizeFormCoordinate(selectedLatitude)}
                    longitude={normalizeFormCoordinate(selectedLongitude)}
                    onChange={selectRestaurantLocation}
                  />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea placeholder="Nhập mô tả ngắn" rows={3} />
                </Form.Item>
                <Form.Item hidden name="imageUrl">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="imagePublicId">
                  <Input />
                </Form.Item>
                <Form.Item label="Hình ảnh quán">
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space wrap>
                      <Upload
                        accept="image/*"
                        beforeUpload={selectRestaurantImage}
                        maxCount={1}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />}>
                          {imageUrlPreview ? "Thay đổi hình ảnh" : "Chọn hình ảnh"}
                        </Button>
                      </Upload>
                      {imageUrlPreview ? (
                        <Button onClick={removeRestaurantImage}>Xóa hình ảnh</Button>
                      ) : null}
                    </Space>
                    <Typography.Text type="secondary">
                      Chọn file ảnh từ máy tính. Ảnh sẽ được hiển thị trước khi lưu.
                    </Typography.Text>
                  </Space>
                </Form.Item>
                {imageUrlPreview ? (
                  <Image
                    alt="Hình ảnh quán"
                    height={180}
                    src={imageUrlPreview}
                    style={{
                      borderRadius: 8,
                      marginBottom: 16,
                      objectFit: "cover",
                    }}
                    width="100%"
                  />
                ) : null}
                <Row gutter={12}>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Nhóm chính"
                      name="category"
                      rules={[{ required: true, message: "Chọn nhóm chính" }]}
                    >
                      <Select
                        options={categoryOptions}
                        placeholder="Chọn nhóm chính"
                        onChange={(value: FoodCategoryFilter) => {
                          restaurantForm.setFieldValue(
                            "detail",
                            getCategoryDetailOptions(value)[0]?.value,
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Nhóm chi tiết"
                      name="detail"
                      rules={[
                        { required: true, message: "Chọn nhóm chi tiết" },
                      ]}
                    >
                      <Select
                        disabled={detailOptions.length === 0}
                        options={detailOptions}
                        placeholder="Chọn nhóm chi tiết"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Giờ mở cửa"
                      name="openTime"
                      rules={[{ required: true, message: "Chọn giờ mở cửa" }]}
                    >
                      <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Giờ đóng cửa"
                      name="closeTime"
                      rules={[{ required: true, message: "Chọn giờ đóng cửa" }]}
                    >
                      <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="active" valuePropName="checked">
                  <Checkbox>Còn hoạt động</Checkbox>
                </Form.Item>
              </Form>

              <Flex
                align="center"
                className="restaurant-management__menu-toolbar"
                justify="space-between"
              >
                <Typography.Title level={4}>Menu quán</Typography.Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateMenuModal}
                >
                  Thêm món ăn
                </Button>
              </Flex>
              <Table
                columns={menuColumns}
                dataSource={selectedMenuItems}
                loading={isMenuItemsLoading}
                pagination={false}
                rowKey="id"
                scroll={{ x: 720 }}
                size="small"
              />
              {menuListError ? (
                <Typography.Text
                  className="restaurant-management__menu-error"
                  type="danger"
                >
                  Vui lòng thêm ít nhất 1 món ăn trước khi lưu quán mới.
                </Typography.Text>
              ) : null}

              <Card
                className="restaurant-management__image-card"
                size="small"
                title="Ảnh món vừa thêm"
              >
                {menuGalleryPhotos.length > 0 ? (
                  <Gallery
                    direction="row"
                    margin={8}
                    photos={menuGalleryPhotos}
                    renderImage={renderMenuGalleryPhoto}
                    targetRowHeight={(containerWidth) =>
                      containerWidth < 640 ? 120 : 150
                    }
                  />
                ) : (
                  <Typography.Text type="secondary">
                    Chưa có ảnh món ăn nào được chọn.
                  </Typography.Text>
                )}
              </Card>

              <div className="restaurant-management__footer">
                <Button
                  loading={isSavingRestaurant}
                  type="primary"
                  onClick={saveRestaurant}
                >
                  Lưu
                </Button>
                {isCreatingRestaurant ? (
                  <Button
                    disabled={isSavingRestaurant}
                    onClick={closeRestaurantModal}
                  >
                    Hủy
                  </Button>
                ) : (
                  <>
                    <Button
                      disabled={isSavingRestaurant || isDeletingRestaurant}
                      onClick={closeRestaurantModal}
                    >
                      Đóng
                    </Button>
                    <Popconfirm
                      cancelText="Hủy"
                      okText="Xóa"
                      title="Xóa quán ăn này?"
                      onConfirm={deleteRestaurant}
                    >
                      <Button danger loading={isDeletingRestaurant}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </div>
            </>
          ) : null}
        </Modal>
          </>
        )}

        <Modal
          destroyOnHidden
          confirmLoading={isSavingMenuItem}
          okText="Lưu"
          open={menuModalOpen}
          title={editingMenuId ? "Sửa thông tin món ăn" : "Thêm mới món ăn"}
          onCancel={() => setMenuModalOpen(false)}
          onOk={saveMenuItem}
        >
          <Form form={menuForm} layout="vertical">
            <Form.Item
              label="Tên món"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên món" }]}
            >
              <Input placeholder="Nhập tên món" />
            </Form.Item>
            <Form.Item
              label="Giá món"
              name="price"
              rules={[{ required: true, message: "Vui lòng nhập giá món" }]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập giá món"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="Nguyên liệu chính"
              name="mainIngredient"
              rules={[
                { required: true, message: "Vui lòng nhập nguyên liệu chính" },
              ]}
            >
              <Input placeholder="Ví dụ: thịt bò, bánh phở, rau thơm" />
            </Form.Item>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea placeholder="Nhập mô tả món ăn" rows={3} />
            </Form.Item>
            <Form.Item name="available" valuePropName="checked">
              <Checkbox>Còn bán</Checkbox>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </>
  );
}

export default QuanLyCuaHangPage;
