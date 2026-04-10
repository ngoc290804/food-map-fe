export const FoodCategoryFilter = {
  HOME: 'TRANG_CHU',
  RESTAURANT: 'QUAN_AN',
  PUB: 'QUAN_NHAU',
  DRINK: 'TRA_SUA_DO_UONG',
  CAFE: 'CAFE',
  DESSERT_SNACK: 'BANH_NGOT_AN_VAT',
  FAVORITE: 'YEU_THICH',
} as const

export type FoodCategoryFilter =
  (typeof FoodCategoryFilter)[keyof typeof FoodCategoryFilter]

export const FoodDetailFilter = {
  SUGGESTED_TODAY: 'GOI_Y_HOM_NAY',
  NEARBY: 'GAN_BAN',
  OPEN_NOW: 'DANG_MO_CUA',
  BUN_PHO: 'BUN_PHO',
  RICE: 'COM',
  BANH_MI: 'BANH_MI',
  PORRIDGE: 'CHAO',
  NOODLE: 'MI_MIEN',
  HOTPOT: 'LAU',
  SEAFOOD: 'HAI_SAN',
  GRILL: 'NUONG',
  PUB_HOTPOT: 'LAU_NHAU',
  DRAFT_BEER: 'BIA_HOI',
  PUB_SNACK: 'MOI_NHAU',
  MILK_TEA: 'TRA_SUA',
  JUICE: 'NUOC_EP',
  SMOOTHIE: 'SINH_TO',
  FRUIT_TEA: 'TRA_TRAI_CAY',
  HEALTHY_DRINK: 'DO_UONG_HEALTHY',
  TRADITIONAL_COFFEE: 'CAFE_TRUYEN_THONG',
  MACHINE_COFFEE: 'CAFE_MAY',
  COLD_BREW: 'COLD_BREW',
  WORK_CAFE: 'CAFE_HOC_TAP_LAM_VIEC',
  GARDEN_CAFE: 'CAFE_SAN_VUON',
  SWEET_CAKE: 'BANH_NGOT',
  RICE_PAPER: 'BANH_TRANG',
  SKEWER: 'XIEN_QUE',
  SWEET_SOUP: 'CHE',
  ICE_CREAM: 'KEM',
  KOREAN_SNACK: 'AN_VAT_HAN_QUOC',
} as const

export type FoodDetailFilter =
  (typeof FoodDetailFilter)[keyof typeof FoodDetailFilter]

export const AreaFilter = {
  HA_NOI: 'HA_NOI',
  HO_CHI_MINH: 'HO_CHI_MINH',
  DA_NANG: 'DA_NANG',
  HAI_PHONG: 'HAI_PHONG',
  CAN_THO: 'CAN_THO',
} as const

export type AreaFilter = (typeof AreaFilter)[keyof typeof AreaFilter]

export const FOOD_DETAIL_QUERY_KEY = 'detail'
export const AREA_QUERY_KEY = 'area'

export type FoodFilterSubOption = {
  value: FoodDetailFilter
  label: string
}

export type FoodFilterMenuOption = {
  value: FoodCategoryFilter
  label: string
  path: string
  description: string
  children?: FoodFilterSubOption[]
}

export type AreaOption = {
  value: AreaFilter
  label: string
}

export const foodFilterMenuOptions: FoodFilterMenuOption[] = [
  {
    value: FoodCategoryFilter.HOME,
    label: 'Trang chủ',
    path: '/',
    description: 'Gợi ý nổi bật và ưu đãi mới nhất quanh bạn.',
    children: [
      { value: FoodDetailFilter.SUGGESTED_TODAY, label: 'Gợi ý hôm nay' },
      { value: FoodDetailFilter.NEARBY, label: 'Gần bạn' },
      { value: FoodDetailFilter.OPEN_NOW, label: 'Đang mở cửa' },
    ],
  },
  {
    value: FoodCategoryFilter.RESTAURANT,
    label: 'Quán ăn',
    path: '/quan-an',
    description: 'Danh sách quán ăn theo món và khu vực bạn chọn.',
    children: [
      { value: FoodDetailFilter.BUN_PHO, label: 'Bún phở' },
      { value: FoodDetailFilter.RICE, label: 'Cơm' },
      { value: FoodDetailFilter.BANH_MI, label: 'Bánh mì' },
      { value: FoodDetailFilter.PORRIDGE, label: 'Cháo' },
      { value: FoodDetailFilter.NOODLE, label: 'Mì/miến' },
      { value: FoodDetailFilter.HOTPOT, label: 'Lẩu' },
    ],
  },
  {
    value: FoodCategoryFilter.PUB,
    label: 'Quán nhậu',
    path: '/quan-nhau',
    description: 'Quán nhậu, món nướng, lẩu và đồ uống phù hợp tụ họp.',
    children: [
      { value: FoodDetailFilter.SEAFOOD, label: 'Hải sản' },
      { value: FoodDetailFilter.GRILL, label: 'Nướng' },
      { value: FoodDetailFilter.PUB_HOTPOT, label: 'Lẩu nhậu' },
      { value: FoodDetailFilter.DRAFT_BEER, label: 'Bia hơi' },
      { value: FoodDetailFilter.PUB_SNACK, label: 'Mồi nhậu' },
    ],
  },
  {
    value: FoodCategoryFilter.DRINK,
    label: 'Trà sữa/Đồ uống',
    path: '/tra-sua-do-uong',
    description: 'Trà sữa, nước ép, sinh tố và các lựa chọn đồ uống nhanh.',
    children: [
      { value: FoodDetailFilter.MILK_TEA, label: 'Trà sữa' },
      { value: FoodDetailFilter.JUICE, label: 'Nước ép' },
      { value: FoodDetailFilter.SMOOTHIE, label: 'Sinh tố' },
      { value: FoodDetailFilter.FRUIT_TEA, label: 'Trà trái cây' },
      { value: FoodDetailFilter.HEALTHY_DRINK, label: 'Đồ uống healthy' },
    ],
  },
  {
    value: FoodCategoryFilter.CAFE,
    label: 'Cafe',
    path: '/cafe',
    description: 'Cafe uống nhanh, ngồi làm việc hoặc gặp bạn bè.',
    children: [
      { value: FoodDetailFilter.TRADITIONAL_COFFEE, label: 'Cafe truyền thống' },
      { value: FoodDetailFilter.MACHINE_COFFEE, label: 'Cafe máy' },
      { value: FoodDetailFilter.COLD_BREW, label: 'Cold brew' },
      { value: FoodDetailFilter.WORK_CAFE, label: 'Học tập/làm việc' },
      { value: FoodDetailFilter.GARDEN_CAFE, label: 'Cafe sân vườn' },
    ],
  },
  {
    value: FoodCategoryFilter.DESSERT_SNACK,
    label: 'Bánh ngọt/Ăn vặt',
    path: '/banh-ngot-an-vat',
    description: 'Bánh ngọt, chè, kem và các món ăn vặt dễ chọn.',
    children: [
      { value: FoodDetailFilter.SWEET_CAKE, label: 'Bánh ngọt' },
      { value: FoodDetailFilter.RICE_PAPER, label: 'Bánh tráng' },
      { value: FoodDetailFilter.SKEWER, label: 'Xiên que' },
      { value: FoodDetailFilter.SWEET_SOUP, label: 'Chè' },
      { value: FoodDetailFilter.ICE_CREAM, label: 'Kem' },
      { value: FoodDetailFilter.KOREAN_SNACK, label: 'Ăn vặt Hàn Quốc' },
    ],
  },
  {
    value: FoodCategoryFilter.FAVORITE,
    label: 'Yêu thích',
    path: '/yeu-thich',
    description: 'Các quán và món bạn đã lưu để xem lại nhanh.',
  },
]

export const areaOptions: AreaOption[] = [
  { value: AreaFilter.HA_NOI, label: 'Hà Nội' },
  { value: AreaFilter.HO_CHI_MINH, label: 'Hồ Chí Minh' },
  { value: AreaFilter.DA_NANG, label: 'Đà Nẵng' },
  { value: AreaFilter.HAI_PHONG, label: 'Hải Phòng' },
  { value: AreaFilter.CAN_THO, label: 'Cần Thơ' },
]

export const defaultFoodFilter = foodFilterMenuOptions[0]
export const defaultArea = areaOptions[0]

export function buildDetailMenuKey(path: string, detail: FoodDetailFilter) {
  return `${path}?${FOOD_DETAIL_QUERY_KEY}=${detail}`
}

export function getFoodFilterByPath(pathname: string) {
  return foodFilterMenuOptions.find((option) => option.path === pathname) ?? defaultFoodFilter
}

export function getFoodDetailByValue(value: string | null) {
  return foodFilterMenuOptions
    .flatMap((option) => option.children ?? [])
    .find((option) => option.value === value)
}

export function getAreaByValue(value: string | null) {
  return areaOptions.find((option) => option.value === value) ?? defaultArea
}
