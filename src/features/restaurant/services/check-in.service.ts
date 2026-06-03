import type { ApiResponse, PageResponse } from "@/types/api.type";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export type CheckInPayload = {
  idQuanAn: string;
  latitude: number;
  longitude: number;
};

export type CheckInVo = {
  id: string;
  idTaiKhoan?: string | null;
  idQuanAn?: string | null;
  tenQuanAn?: string | null;
  checkin?: number | null;
  thanhCong?: boolean | null;
  latitudeHienTai?: number | string | null;
  longitudeHienTai?: number | string | null;
  latitudeQuanAn?: number | string | null;
  longitudeQuanAn?: number | string | null;
  khoangCachMet?: number | null;
  nguongChoPhepMet?: number | null;
  ngayTao?: string | null;
};

export type CheckInResult = {
  message: string;
  data: CheckInVo;
};

export type CheckInRankingVo = {
  tenTaiKhoan?: string | null;
  hoTen?: string | null;
  soLanCheckinThanhCong?: number | string | null;
};

export type CheckInRankingItem = {
  username: string;
  fullName: string;
  checkInCount: number;
};

function normalizeCheckInRankingItem(item: CheckInRankingVo): CheckInRankingItem {
  return {
    username: item.tenTaiKhoan ?? "",
    fullName: item.hoTen ?? "",
    checkInCount: Number(item.soLanCheckinThanhCong ?? 0),
  };
}

export const checkInService = {
  checkIn: async (payload: CheckInPayload) => {
    const response = await baseService.post<ApiResponse<CheckInVo>>(
      endpoints.checkIns,
      payload,
    );

    return {
      message: response.message,
      data: response.data,
    };
  },
  getRanking: async (params: { page?: number; size?: number } = {}) => {
    const response = await baseService.get<
      ApiResponse<PageResponse<CheckInRankingVo>>
    >(`${endpoints.checkIns}/ranking`, {
      page: params.page ?? 0,
      size: params.size ?? 10,
    });
    const data = response.data;

    return {
      page: data?.page ?? params.page ?? 0,
      size: data?.size ?? params.size ?? 10,
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
      items: Array.isArray(data?.items)
        ? data.items.map(normalizeCheckInRankingItem)
        : [],
    };
  },
};
