import { useQuery } from "@tanstack/react-query";

import { restaurantService } from "@/features/restaurant/services/restaurant.service";

type RestaurantListParams = {
  keyword?: string;
};

export function useRestaurantList(params?: RestaurantListParams) {
  const normalizedKeyword = params?.keyword?.trim().toLowerCase();

  return useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantService.getList(),
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
