import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  TimePicker,
  Typography,
  message,
} from "antd";
import type { TableProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import {
  FoodCategoryFilter,
  FoodDetailFilter,
  foodFilterMenuOptions,
} from "@/config/food-filter.config";
import { useRestaurantList } from "@/features/restaurant/hooks/useRestaurantList";
import {
  type MenuItemPayload,
  restaurantService,
  type RestaurantPayload,
} from "@/features/restaurant/services/restaurant.service";
import type { RestaurantDto } from "@/features/restaurant/types/restaurant.dto";

type MenuManageItem = {
  id: string;
  name: string;
  price: number;
  mainIngredient: string;
  description: string;
  available: boolean;
};

type RestaurantManageItem = {
  id: string;
  name: string;
  address: string;
  description: string;
  category: FoodCategoryFilter;
  detail: FoodDetailFilter;
  openTime: string;
  closeTime: string;
  active: boolean;
  menuItems: MenuManageItem[];
};

type RestaurantFormValues = {
  name: string;
  address: string;
  description?: string;
  category?: FoodCategoryFilter;
  detail?: FoodDetailFilter;
  openTime?: Dayjs;
  closeTime?: Dayjs;
  active?: boolean;
};

type MenuFormValues = {
  name: string;
  price: number;
  mainIngredient: string;
  description?: string;
  available?: boolean;
};

const emptyRestaurants: RestaurantManageItem[] = [];

function createEmptyRestaurant(): RestaurantManageItem {
  const detail = getCategoryDetailOptions(FoodCategoryFilter.RESTAURANT)[0];

  return {
    id: `restaurant-${Date.now()}`,
    name: "",
    address: "",
    description: "",
    category: FoodCategoryFilter.RESTAURANT,
    detail: detail?.value ?? FoodDetailFilter.BUN_PHO,
    openTime: "08:00",
    closeTime: "22:00",
    active: true,
    menuItems: [],
  };
}

function timeToDayjs(value?: string) {
  const normalizedValue = value?.match(/^(\d{2}:\d{2})/)?.[1];

  return normalizedValue
    ? dayjs(`2000-01-01T${normalizedValue}:00`)
    : undefined;
}

function formatTime(value?: Dayjs) {
  return value ? value.format("HH:mm") : "";
}

const manageableCategoryValues: FoodCategoryFilter[] = [
  FoodCategoryFilter.RESTAURANT,
  FoodCategoryFilter.PUB,
  FoodCategoryFilter.DRINK,
  FoodCategoryFilter.CAFE,
  FoodCategoryFilter.DESSERT_SNACK,
];

const categoryOptions = foodFilterMenuOptions
  .filter((option) => manageableCategoryValues.includes(option.value))
  .map((option) => ({
    value: option.value,
    label: option.label,
  }));

function getCategoryDetailOptions(category?: FoodCategoryFilter) {
  return (
    foodFilterMenuOptions
      .find((option) => option.value === category)
      ?.children?.map((option) => ({
        value: option.value,
        label: option.label,
      })) ?? []
  );
}

function getManageableCategory(category?: FoodCategoryFilter) {
  return category && manageableCategoryValues.includes(category)
    ? category
    : FoodCategoryFilter.RESTAURANT;
}

function getManageableDetail(
  category: FoodCategoryFilter,
  detail?: FoodDetailFilter,
) {
  const detailOptions = getCategoryDetailOptions(category);

  return detail && detailOptions.some((option) => option.value === detail)
    ? detail
    : (detailOptions[0]?.value ?? FoodDetailFilter.BUN_PHO);
}

function mapRestaurantDtoToManageItem(
  item: RestaurantDto,
): RestaurantManageItem {
  const category = getManageableCategory(item.loaiCuaHang);

  return {
    id: item.id,
    name: item.name,
    address: item.address,
    description: item.description,
    category,
    detail: getManageableDetail(category, item.loaiKinhDoanh),
    openTime: item.openTime,
    closeTime: item.closeTime,
    active: item.status === "ACTIVE",
    menuItems: [],
  };
}

function buildRestaurantPayload(
  values: RestaurantFormValues,
  status?: string,
): RestaurantPayload {
  const category = values.category ?? FoodCategoryFilter.RESTAURANT;
  const detail = values.detail ?? getManageableDetail(category);

  return {
    name: values.name,
    address: values.address,
    openTime: formatTime(values.openTime),
    closeTime: formatTime(values.closeTime),
    description: values.description ?? "",
    imageUrl: null,
    loaiCuaHang: category,
    loaiKinhDoanh: detail,
    ...(status ? { status } : {}),
  };
}

function buildMenuItemPayload(
  restaurantId: string,
  values: MenuFormValues,
): MenuItemPayload {
  return {
    idCuaHang: restaurantId,
    tenMonAn: values.name,
    giaTien: values.price,
    nguyenLieuChinh: values.mainIngredient,
    moTa: values.description ?? "",
    hinhAnh: null,
    conBan: values.available ?? true,
  };
}

function QuanLyCuaHangPage() {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [restaurantForm] = Form.useForm<RestaurantFormValues>();
  const [menuForm] = Form.useForm<MenuFormValues>();
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [restaurantPageSize, setRestaurantPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const { data: restaurantData, isLoading: isRestaurantListLoading } =
    useRestaurantList({
      page: restaurantPage - 1,
      size: restaurantPageSize,
    });
  const restaurantRows = useMemo(
    () =>
      restaurantData?.items.map(mapRestaurantDtoToManageItem) ??
      emptyRestaurants,
    [restaurantData?.items],
  );
  const [restaurants, setRestaurants] =
    useState<RestaurantManageItem[]>(emptyRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantManageItem | null>(null);
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuListError, setMenuListError] = useState(false);
  const selectedRestaurantId = selectedRestaurant?.id;
  const selectedCategory =
    Form.useWatch("category", restaurantForm) ??
    selectedRestaurant?.category ??
    FoodCategoryFilter.RESTAURANT;
  const detailOptions = getCategoryDetailOptions(selectedCategory);
  const createRestaurantMutation = useMutation({
    mutationFn: (payload: RestaurantPayload) =>
      restaurantService.create(payload),
  });
  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RestaurantPayload }) =>
      restaurantService.update(id, payload),
  });
  const deleteRestaurantMutation = useMutation({
    mutationFn: (id: string) => restaurantService.delete(id),
  });
  const createMenuItemMutation = useMutation({
    mutationFn: ({
      restaurantId,
      payload,
    }: {
      restaurantId: string;
      payload: MenuItemPayload;
    }) => restaurantService.createMenuItem(restaurantId, payload),
  });
  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MenuItemPayload }) =>
      restaurantService.updateMenuItem(id, payload),
  });
  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: string) => restaurantService.deleteMenuItem(id),
  });
  const { data: fetchedMenuItems = [], isLoading: isMenuItemsLoading } =
    useQuery({
      enabled: Boolean(
        selectedRestaurantId && restaurantModalOpen && !isCreatingRestaurant,
      ),
      queryKey: ["restaurant-menu-items", selectedRestaurantId],
      queryFn: () => restaurantService.getMenuItems(selectedRestaurantId ?? ""),
    });
  const isSavingRestaurant =
    createRestaurantMutation.isPending || updateRestaurantMutation.isPending;
  const isDeletingRestaurant = deleteRestaurantMutation.isPending;
  const isSavingMenuItem =
    createMenuItemMutation.isPending || updateMenuItemMutation.isPending;
  const isDeletingMenuItem = deleteMenuItemMutation.isPending;
  const selectedMenuItems = isCreatingRestaurant
    ? (selectedRestaurant?.menuItems ?? [])
    : fetchedMenuItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        mainIngredient: item.mainIngredient,
        description: item.description,
        available: item.available,
      }));

  useEffect(() => {
    setRestaurants(restaurantRows);
  }, [restaurantRows]);

  useEffect(() => {
    if (!selectedRestaurant || !restaurantModalOpen) {
      return;
    }

    restaurantForm.setFieldsValue({
      name: selectedRestaurant.name,
      address: selectedRestaurant.address,
      description: selectedRestaurant.description,
      category: selectedRestaurant.category,
      detail: selectedRestaurant.detail,
      openTime: timeToDayjs(selectedRestaurant.openTime),
      closeTime: timeToDayjs(selectedRestaurant.closeTime),
      active: selectedRestaurant.active,
    });
  }, [restaurantForm, restaurantModalOpen, selectedRestaurant]);

  const restaurantColumns: TableProps<RestaurantManageItem>["columns"] = [
    {
      title: "STT",
      width: 72,
      render: (_value, _record, index) =>
        (restaurantPage - 1) * restaurantPageSize + index + 1,
    },
    {
      title: "Tên quán",
      dataIndex: "name",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Giờ mở cửa",
      dataIndex: "openTime",
      width: 130,
    },
    {
      title: "Giờ đóng cửa",
      dataIndex: "closeTime",
      width: 140,
    },
  ];

  const menuColumns: TableProps<MenuManageItem>["columns"] = [
    {
      title: "Tên món",
      dataIndex: "name",
    },
    {
      title: "Giá món",
      dataIndex: "price",
      render: (value?: number) =>
        `${Number(value ?? 0).toLocaleString("vi-VN")} đ`,
      width: 120,
    },
    {
      title: "Nguyên liệu chính",
      dataIndex: "mainIngredient",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "available",
      render: (value: boolean) => (value ? "Còn bán" : "Ngừng bán"),
      width: 120,
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_value, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="link"
            onClick={() => openEditMenuModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            cancelText="Hủy"
            okText="Xóa"
            title="Xóa món ăn này?"
            onConfirm={() => deleteMenuItem(record.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingMenuItem}
              size="small"
              type="link"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const selectRestaurant = (record: RestaurantManageItem) => {
    setMenuListError(false);
    setSelectedRestaurant({
      ...record,
      menuItems: [...record.menuItems],
    });
    setIsCreatingRestaurant(false);
    setRestaurantModalOpen(true);
  };

  const openCreateRestaurantForm = () => {
    setMenuListError(false);
    restaurantForm.resetFields();
    setSelectedRestaurant(createEmptyRestaurant());
    setIsCreatingRestaurant(true);
    setRestaurantModalOpen(true);
  };

  const closeRestaurantModal = () => {
    setRestaurantModalOpen(false);
    setMenuModalOpen(false);
    setSelectedRestaurant(null);
    setIsCreatingRestaurant(false);
    setEditingMenuId(null);
    setMenuListError(false);
    restaurantForm.resetFields();
    menuForm.resetFields();
  };

  const openCreateMenuModal = () => {
    setEditingMenuId(null);
    menuForm.resetFields();
    menuForm.setFieldValue("available", true);
    setMenuModalOpen(true);
  };

  const openEditMenuModal = (record: MenuManageItem) => {
    setEditingMenuId(record.id);
    menuForm.setFieldsValue(record);
    setMenuModalOpen(true);
  };

  const saveMenuItem = async () => {
    const values = await menuForm.validateFields();

    if (!selectedRestaurant) {
      return;
    }

    if (!isCreatingRestaurant) {
      try {
        if (editingMenuId) {
          await updateMenuItemMutation.mutateAsync({
            id: editingMenuId,
            payload: buildMenuItemPayload(selectedRestaurant.id, values),
          });
          messageApi.success("Đã cập nhật món ăn");
        } else {
          await createMenuItemMutation.mutateAsync({
            restaurantId: selectedRestaurant.id,
            payload: buildMenuItemPayload(selectedRestaurant.id, values),
          });
          messageApi.success("Đã thêm món ăn");
        }

        await queryClient.invalidateQueries({
          queryKey: ["restaurant-menu-items", selectedRestaurant.id],
        });
        setMenuModalOpen(false);
        setEditingMenuId(null);
        setMenuListError(false);
        menuForm.resetFields();
      } catch {
        messageApi.error("Không thể lưu món ăn. Vui lòng thử lại.");
      }

      return;
    }

    setSelectedRestaurant((current) => {
      if (!current) {
        return current;
      }

      const nextMenuItem: MenuManageItem = {
        id: editingMenuId ?? `menu-${Date.now()}`,
        name: values.name,
        price: values.price,
        mainIngredient: values.mainIngredient,
        description: values.description ?? "",
        available: values.available ?? true,
      };
      const menuItems = editingMenuId
        ? current.menuItems.map((item) =>
            item.id === editingMenuId ? nextMenuItem : item,
          )
        : [...current.menuItems, nextMenuItem];

      return {
        ...current,
        menuItems,
      };
    });

    setMenuModalOpen(false);
    setEditingMenuId(null);
    setMenuListError(false);
    menuForm.resetFields();
  };

  const deleteMenuItem = async (menuId: string) => {
    if (!selectedRestaurant) {
      return;
    }

    if (!isCreatingRestaurant) {
      try {
        await deleteMenuItemMutation.mutateAsync(menuId);
        await queryClient.invalidateQueries({
          queryKey: ["restaurant-menu-items", selectedRestaurant.id],
        });
        messageApi.success("Đã xóa món ăn");
      } catch {
        messageApi.error("Không thể xóa món ăn. Vui lòng thử lại.");
      }

      return;
    }

    setSelectedRestaurant((current) =>
      current
        ? {
            ...current,
            menuItems: current.menuItems.filter((item) => item.id !== menuId),
          }
        : current,
    );
  };

  const saveRestaurant = async () => {
    if (!selectedRestaurant) {
      return;
    }

    const values = await restaurantForm.validateFields();

    try {
      if (isCreatingRestaurant) {
        const createdRestaurant = await createRestaurantMutation.mutateAsync(
          buildRestaurantPayload(values),
        );
        await Promise.all(
          selectedRestaurant.menuItems.map((item) =>
            restaurantService.createMenuItem(
              createdRestaurant.id,
              buildMenuItemPayload(createdRestaurant.id, {
                name: item.name,
                price: item.price,
                mainIngredient: item.mainIngredient,
                description: item.description,
                available: item.available,
              }),
            ),
          ),
        );
        messageApi.success("Đã thêm quán ăn");
      } else {
        await updateRestaurantMutation.mutateAsync({
          id: selectedRestaurant.id,
          payload: buildRestaurantPayload(
            values,
            values.active ? "ACTIVE" : "INACTIVE",
          ),
        });
        messageApi.success("Đã cập nhật quán ăn");
      }

      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      closeRestaurantModal();
    } catch {
      messageApi.error("Không thể lưu quán ăn. Vui lòng thử lại.");
    }
  };

  const deleteRestaurant = async () => {
    if (!selectedRestaurant) {
      return;
    }

    try {
      await deleteRestaurantMutation.mutateAsync(selectedRestaurant.id);
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      messageApi.success("Đã xóa quán ăn");
      closeRestaurantModal();
    } catch {
      messageApi.error("Không thể xóa quán ăn. Vui lòng thử lại.");
    }
  };

  return (
    <>
      {messageContextHolder}
      <Space className="restaurant-management" direction="vertical" size={20}>
        <Flex align="center" justify="space-between" wrap="wrap">
          <div>
            <Typography.Title level={2} style={{ marginBottom: 6 }}>
              Quản lý danh sách quán ăn
            </Typography.Title>
            <Typography.Text type="secondary">
              Chọn một dòng để xem chi tiết hoặc tạo mới quán ăn.
            </Typography.Text>
          </div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={openCreateRestaurantForm}
          >
            Thêm quán ăn
          </Button>
        </Flex>

        <Card title="Danh sách quán ăn">
          <Table
            className="restaurant-management__list-table"
            columns={restaurantColumns}
            dataSource={restaurants}
            loading={isRestaurantListLoading}
            pagination={{
              current: restaurantPage,
              pageSize: restaurantPageSize,
              pageSizeOptions: [10, 20, 50],
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} quán`,
              total: restaurantData?.totalElements ?? 0,
            }}
            rowKey="id"
            scroll={{ x: 760 }}
            onChange={(pagination) => {
              setRestaurantPage(pagination.current ?? 1);
              setRestaurantPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
            }}
            onRow={(record) => ({
              onClick: () => selectRestaurant(record),
            })}
          />
        </Card>

        <Modal
          destroyOnHidden
          footer={null}
          open={restaurantModalOpen}
          title={isCreatingRestaurant ? "Thêm mới quán ăn" : "Chi tiết quán ăn"}
          width={960}
          onCancel={closeRestaurantModal}
        >
          {selectedRestaurant ? (
            <>
              <Form form={restaurantForm} layout="vertical">
                <Form.Item
                  label="Tên quán"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên quán" },
                  ]}
                >
                  <Input placeholder="Nhập tên quán" />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea placeholder="Nhập mô tả ngắn" rows={3} />
                </Form.Item>
                <Row gutter={12}>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Nhóm chính"
                      name="category"
                      rules={[{ required: true, message: "Chọn nhóm chính" }]}
                    >
                      <Select
                        options={categoryOptions}
                        placeholder="Chọn nhóm chính"
                        onChange={(value: FoodCategoryFilter) => {
                          restaurantForm.setFieldValue(
                            "detail",
                            getCategoryDetailOptions(value)[0]?.value,
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Nhóm chi tiết"
                      name="detail"
                      rules={[
                        { required: true, message: "Chọn nhóm chi tiết" },
                      ]}
                    >
                      <Select
                        disabled={detailOptions.length === 0}
                        options={detailOptions}
                        placeholder="Chọn nhóm chi tiết"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Giờ mở cửa"
                      name="openTime"
                      rules={[{ required: true, message: "Chọn giờ mở cửa" }]}
                    >
                      <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col sm={12} span={24}>
                    <Form.Item
                      label="Giờ đóng cửa"
                      name="closeTime"
                      rules={[{ required: true, message: "Chọn giờ đóng cửa" }]}
                    >
                      <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="active" valuePropName="checked">
                  <Checkbox>Còn hoạt động</Checkbox>
                </Form.Item>
              </Form>

              <Flex
                align="center"
                className="restaurant-management__menu-toolbar"
                justify="space-between"
              >
                <Typography.Title level={4}>Menu quán</Typography.Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateMenuModal}
                >
                  Thêm món ăn
                </Button>
              </Flex>
              <Table
                columns={menuColumns}
                dataSource={selectedMenuItems}
                loading={isMenuItemsLoading}
                pagination={false}
                rowKey="id"
                scroll={{ x: 720 }}
                size="small"
              />
              {menuListError ? (
                <Typography.Text
                  className="restaurant-management__menu-error"
                  type="danger"
                >
                  Vui lòng thêm ít nhất 1 món ăn trước khi lưu quán mới.
                </Typography.Text>
              ) : null}

              <div className="restaurant-management__footer">
                <Button
                  loading={isSavingRestaurant}
                  type="primary"
                  onClick={saveRestaurant}
                >
                  Lưu
                </Button>
                {isCreatingRestaurant ? (
                  <Button
                    disabled={isSavingRestaurant}
                    onClick={closeRestaurantModal}
                  >
                    Hủy
                  </Button>
                ) : (
                  <Popconfirm
                    cancelText="Hủy"
                    okText="Xóa"
                    title="Xóa quán ăn này?"
                    onConfirm={deleteRestaurant}
                  >
                    <Button danger loading={isDeletingRestaurant}>
                      Xóa
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </>
          ) : null}
        </Modal>

        <Modal
          destroyOnHidden
          confirmLoading={isSavingMenuItem}
          okText="Lưu"
          open={menuModalOpen}
          title={editingMenuId ? "Sửa thông tin món ăn" : "Thêm mới món ăn"}
          onCancel={() => setMenuModalOpen(false)}
          onOk={saveMenuItem}
        >
          <Form form={menuForm} layout="vertical">
            <Form.Item
              label="Tên món"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên món" }]}
            >
              <Input placeholder="Nhập tên món" />
            </Form.Item>
            <Form.Item
              label="Giá món"
              name="price"
              rules={[{ required: true, message: "Vui lòng nhập giá món" }]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập giá món"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="Nguyên liệu chính"
              name="mainIngredient"
              rules={[
                { required: true, message: "Vui lòng nhập nguyên liệu chính" },
              ]}
            >
              <Input placeholder="Ví dụ: thịt bò, bánh phở, rau thơm" />
            </Form.Item>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea placeholder="Nhập mô tả món ăn" rows={3} />
            </Form.Item>
            <Form.Item name="available" valuePropName="checked">
              <Checkbox>Còn bán</Checkbox>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </>
  );
}

export default QuanLyCuaHangPage;
