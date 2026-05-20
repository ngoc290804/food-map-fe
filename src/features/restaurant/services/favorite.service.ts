import type { ApiResponse } from '@/types/api.type'

import { endpoints } from '@/services/api/endpoints'
import { baseService } from '@/services/base/base.service'

export type FavoritePayload = {
  idCuaHang: string
}

export const favoriteService = {
  create: async (payload: FavoritePayload) => {
    const response = await baseService.post<ApiResponse<unknown>>(
      endpoints.favorites,
      payload,
    )

    return response.data
  },
  deleteByRestaurant: async (restaurantId: string) => {
    const response = await baseService.delete<ApiResponse<string>>(
      `${endpoints.favorites}/restaurants/${restaurantId}`,
    )

    return response.data
  },
}
