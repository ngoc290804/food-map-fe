import type { ApiResponse } from "@/types/api.type";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export type ChatbotRestaurantVo = {
  id: string;
  tenQuanAn?: string | null;
  diaChi?: string | null;
  moTa?: string | null;
  diemDanhGiaTrungBinh?: number | string | null;
};

export type ChatbotAskResponse = {
  sessionId: string;
  answer: string;
  cuaHangs?: ChatbotRestaurantVo[] | null;
};

export type ChatHistoryItem = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export type ChatbotAskLocation = {
  latitude: number;
  longitude: number;
};

export const chatbotService = {
  ask: async (question: string, location?: ChatbotAskLocation | null) => {
    const response = await baseService.post<ApiResponse<ChatbotAskResponse>>(
      `${endpoints.chatbot}/ask`,
      {
        question,
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
      {
        skipAuthRedirect: true,
      },
    );

    return response.data;
  },
  history: async () => {
    const response = await baseService.get<ApiResponse<ChatHistoryItem[]>>(
      `${endpoints.chatbot}/history`,
    );

    return response.data ?? [];
  },
};
