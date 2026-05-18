import type { ApiResponse, PageResponse } from "@/types/api.type";

import type {
  FoodCategoryFilter,
  FoodDetailFilter,
} from "@/config/food-filter.config";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import type {
  CuaHangVo,
  MenuItemDto,
  MonAnVo,
  RestaurantDto,
} from "@/features/restaurant/types/restaurant.dto";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export type RestaurantListParams = {
  keyword?: string;
  category?: FoodCategoryFilter;
  detail?: FoodDetailFilter;
  page?: number;
  size?: number;
};

export type RestaurantPayload = {
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  description: string;
  imageUrl: string | null;
  imageFile?: File | null;
  imagePublicId?: string | null;
  loaiCuaHang: FoodCategoryFilter;
  loaiKinhDoanh: FoodDetailFilter;
  status?: string;
};

export type MenuItemPayload = {
  idCuaHang: string;
  tenMonAn: string;
  giaTien: number;
  nguyenLieuChinh: string;
  moTa: string;
  hinhAnh: string | null;
  imagePublicId?: string | null;
  conBan: boolean;
};

function normalizeParams(params?: RestaurantListParams) {
  return Object.fromEntries(
    Object.entries({
      keyword: params?.keyword,
      loaiCuaHang: params?.category,
      loaiKinhDoanh: params?.detail,
      page: params?.page ?? 0,
      size: params?.size ?? DEFAULT_PAGE_SIZE,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
}

function normalizeCoordinate(value?: number | string | null) {
  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : null;
}

function normalizeRestaurant(item?: CuaHangVo | null): RestaurantDto {
  return {
    id: item?.id ?? "",
    name: item?.tenQuanAn ?? "",
    address: item?.diaChi ?? "",
    openTime: item?.gioMoCua ?? "",
    closeTime: item?.gioDongCua ?? "",
    description: item?.moTa ?? "",
    imageUrl: item?.hinhAnh ?? null,
    imagePublicId: item?.imagePublicId ?? null,
    latitude: normalizeCoordinate(item?.latitude),
    longitude: normalizeCoordinate(item?.longitude),
    status: item?.trangThai ?? "ACTIVE",
    loaiCuaHang: item?.loaiCuaHang ?? undefined,
    loaiKinhDoanh: item?.loaiKinhDoanh ?? undefined,
  };
}

function normalizeMenuItem(item?: MonAnVo | null): MenuItemDto {
  return {
    id: item?.id ?? "",
    restaurantId: item?.idCuaHang ?? "",
    restaurantName: item?.tenCuaHang ?? "",
    name: item?.tenMonAn ?? "",
    price: Number(item?.giaTien ?? 0),
    mainIngredient: item?.nguyenLieuChinh ?? "",
    description: item?.moTa ?? "",
    imageUrl: item?.hinhAnh ?? null,
    imagePublicId: item?.imagePublicId ?? null,
    available: item?.conBan ?? true,
  };
}

function buildRestaurantFormData(payload: RestaurantPayload) {
  const formData = new FormData();

  formData.append("tenQuanAn", payload.name);
  formData.append("diaChi", payload.address);
  formData.append("gioMoCua", payload.openTime);
  formData.append("gioDongCua", payload.closeTime);
  formData.append("moTa", payload.description);
  formData.append("loaiCuaHang", payload.loaiCuaHang);
  formData.append("loaiKinhDoanh", payload.loaiKinhDoanh);

  if (payload.status) {
    formData.append("trangThai", payload.status);
  }

  if (payload.imageUrl && !payload.imageFile) {
    formData.append("hinhAnh", payload.imageUrl);
  }

  if (payload.imagePublicId && !payload.imageFile) {
    formData.append("imagePublicId", payload.imagePublicId);
  }

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
}

export const restaurantService = {
  getList: async (params?: RestaurantListParams) => {
    const response = await baseService.get<
      ApiResponse<PageResponse<CuaHangVo>>
    >(endpoints.restaurants, normalizeParams(params));

    const data = response.data;

    return {
      page: data?.page ?? params?.page ?? 0,
      size: data?.size ?? params?.size ?? DEFAULT_PAGE_SIZE,
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
      items: Array.isArray(data?.items)
        ? data.items.map(normalizeRestaurant)
        : [],
    };
  },
  getDetail: async (id: string) => {
    const response = await baseService.get<ApiResponse<CuaHangVo>>(
      `${endpoints.restaurants}/${id}`,
    );

    return normalizeRestaurant(response.data);
  },
  create: async (payload: RestaurantPayload) => {
    const response = await baseService.post<ApiResponse<CuaHangVo>>(
      endpoints.restaurants,
      payload.imageFile ? buildRestaurantFormData(payload) : payload,
    );

    return normalizeRestaurant(response.data);
  },
  update: async (id: string, payload: RestaurantPayload) => {
    const response = await baseService.put<ApiResponse<CuaHangVo>>(
      `${endpoints.restaurants}/${id}`,
      payload.imageFile ? buildRestaurantFormData(payload) : payload,
    );

    return normalizeRestaurant(response.data);
  },
  delete: async (id: string) => {
    const response = await baseService.delete<ApiResponse<string>>(
      `${endpoints.restaurants}/${id}`,
      {
        skipAuth: true,
        skipAuthRedirect: true,
      },
    );

    return response.data;
  },
  getMenuItems: async (restaurantId: string) => {
    const response = await baseService.get<ApiResponse<MonAnVo[]>>(
      `${endpoints.restaurants}/${restaurantId}/menu-items`,
    );

    return Array.isArray(response.data)
      ? response.data.map(normalizeMenuItem)
      : [];
  },
  createMenuItem: async (restaurantId: string, payload: MenuItemPayload) => {
    const response = await baseService.post<ApiResponse<MonAnVo>>(
      `${endpoints.restaurants}/${restaurantId}/menu-items`,
      payload,
    );

    return normalizeMenuItem(response.data);
  },
  updateMenuItem: async (id: string, payload: MenuItemPayload) => {
    const response = await baseService.put<ApiResponse<MonAnVo>>(
      `${endpoints.menus}/${id}`,
      payload,
    );

    return normalizeMenuItem(response.data);
  },
  deleteMenuItem: async (id: string) => {
    const response = await baseService.delete<ApiResponse<string>>(
      `${endpoints.menus}/${id}`,
    );

    return response.data;
  },
};
