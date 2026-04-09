import type { ApiResponse, PageResponse } from "@/types/api.type";

import type { RestaurantDto } from "@/features/restaurant/types/restaurant.dto";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export const restaurantService = {
  getList: async () => {
    const response = await baseService.get<
      ApiResponse<PageResponse<RestaurantDto>>
    >(endpoints.restaurants);

    return response.data;
  },
};
