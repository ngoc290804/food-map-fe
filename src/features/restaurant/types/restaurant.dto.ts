import type {
  FoodCategoryFilter,
  FoodDetailFilter,
} from "@/config/food-filter.config";

export type CuaHangVo = {
  id: string;
  tenQuanAn?: string | null;
  diaChi?: string | null;
  gioMoCua?: string | null;
  gioDongCua?: string | null;
  moTa?: string | null;
  hinhAnh?: string | null;
  trangThai?: string | null;
  loaiCuaHang?: FoodCategoryFilter | null;
  loaiKinhDoanh?: FoodDetailFilter | null;
};

export type RestaurantDto = {
  id: string;
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  description: string;
  imageUrl: string | null;
  status: string;
  loaiCuaHang?: FoodCategoryFilter;
  loaiKinhDoanh?: FoodDetailFilter;
};

export type MonAnVo = {
  id: string;
  idCuaHang?: string | null;
  tenCuaHang?: string | null;
  tenMonAn?: string | null;
  giaTien?: number | string | null;
  nguyenLieuChinh?: string | null;
  moTa?: string | null;
  hinhAnh?: string | null;
  conBan?: boolean | null;
};

export type MenuItemDto = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  mainIngredient: string;
  description: string;
  imageUrl: string | null;
  available: boolean;
};
