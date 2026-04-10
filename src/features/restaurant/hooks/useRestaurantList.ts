import { useQuery } from "@tanstack/react-query";

import {
  restaurantService,
  type RestaurantListParams,
} from "@/features/restaurant/services/restaurant.service";

export function useRestaurantList(params?: RestaurantListParams) {
  const normalizedKeyword = params?.keyword?.trim().toLowerCase();

  return useQuery({
    queryKey: [
      "restaurants",
      normalizedKeyword,
      params?.category,
      params?.detail,
      params?.area,
    ],
    queryFn: () =>
      restaurantService.getList({
        ...params,
        keyword: normalizedKeyword,
      }),
    select: (data) => {
      const items = normalizedKeyword
        ? data.items.filter(
            (item) =>
              item.name.toLowerCase().includes(normalizedKeyword) ||
              item.address.toLowerCase().includes(normalizedKeyword),
          )
        : data.items;

      return {
        ...data,
        items,
        totalElements: items.length,
        totalPages: items.length > 0 ? 1 : 0,
        size: items.length || data.size,
        page: 0,
      };
    },
  });
}
