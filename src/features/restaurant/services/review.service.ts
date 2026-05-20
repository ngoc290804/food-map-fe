import type { ApiResponse } from "@/types/api.type";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export type ReviewVo = {
  id: string;
  idTaiKhoan?: string | null;
  idCuaHang?: string | null;
  tenTaiKhoan?: string | null;
  tenQuanAn?: string | null;
  danhGia?: string | null;
  diemDanhGia?: number | null;
  ngayTao?: string | null;
};

export type RestaurantReviewListVo = {
  idCuaHang: string;
  diemDanhGiaTrungBinh?: number | string | null;
  soLuongDanhGia?: number | null;
  page?: number | null;
  size?: number | null;
  totalElements?: number | null;
  totalPages?: number | null;
  danhSachDanhGia?: ReviewVo[] | null;
};

export type RestaurantReview = {
  id: string;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
};

export type RestaurantReviewPage = {
  averageRating: number;
  page: number;
  reviews: RestaurantReview[];
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ReviewCreatePayload = {
  danhGia: string;
  diemDanhGia: number;
};

function normalizeReview(item: ReviewVo): RestaurantReview {
  return {
    id: item.id,
    author: item.tenTaiKhoan || "Người dùng",
    content: item.danhGia || "",
    rating: Number(item.diemDanhGia ?? 0),
    createdAt: item.ngayTao || "",
  };
}

function normalizeReviewPage(data?: RestaurantReviewListVo | null): RestaurantReviewPage {
  return {
    averageRating: Number(data?.diemDanhGiaTrungBinh ?? 0),
    page: Number(data?.page ?? 0),
    reviews: Array.isArray(data?.danhSachDanhGia)
      ? data.danhSachDanhGia.map(normalizeReview)
      : [],
    size: Number(data?.size ?? 0),
    totalElements: Number(data?.totalElements ?? data?.soLuongDanhGia ?? 0),
    totalPages: Number(data?.totalPages ?? 0),
  };
}

export const reviewService = {
  getByRestaurant: async (
    restaurantId: string,
    params: { page?: number; size?: number } = {},
  ) => {
    const response = await baseService.get<ApiResponse<RestaurantReviewListVo>>(
      `${endpoints.reviews}/restaurants/${restaurantId}`,
      {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    );

    return normalizeReviewPage(response.data);
  },
  createByRestaurant: async (restaurantId: string, payload: ReviewCreatePayload) => {
    const response = await baseService.post<ApiResponse<ReviewVo>>(
      `${endpoints.reviews}/restaurants/${restaurantId}`,
      payload,
    );

    return normalizeReview(response.data);
  },
};
