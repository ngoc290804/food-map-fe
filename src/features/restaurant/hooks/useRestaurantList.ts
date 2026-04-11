import { useQuery } from "@tanstack/react-query";

import {
  restaurantService,
  type RestaurantListParams,
} from "@/features/restaurant/services/restaurant.service";

export function useRestaurantList(params?: RestaurantListParams) {
  const normalizedKeyword = params?.keyword?.trim();

  return useQuery({
    queryKey: [
      "restaurants",
      normalizedKeyword,
      params?.category,
      params?.detail,
      params?.page,
      params?.size,
    ],
    queryFn: () =>
      restaurantService.getList({
        ...params,
        keyword: normalizedKeyword,
      }),
  });
}
