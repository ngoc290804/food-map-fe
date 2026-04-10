import type { ApiResponse, PageResponse } from "@/types/api.type";

import type {
  AreaFilter,
  FoodCategoryFilter,
  FoodDetailFilter,
} from "@/config/food-filter.config";
import type { RestaurantDto } from "@/features/restaurant/types/restaurant.dto";

import { endpoints } from "@/services/api/endpoints";
import { baseService } from "@/services/base/base.service";

export type RestaurantListParams = {
  keyword?: string;
  category?: FoodCategoryFilter;
  detail?: FoodDetailFilter;
  area?: AreaFilter;
};

function normalizeParams(params?: RestaurantListParams) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => Boolean(value)),
  );
}

export const restaurantService = {
  getList: async (params?: RestaurantListParams) => {
    const response = await baseService.get<
      ApiResponse<PageResponse<RestaurantDto>>
    >(endpoints.restaurants, normalizeParams(params));

    return response.data;
  },
};
