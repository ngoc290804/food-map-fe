import { useEffect, useState } from 'react'

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
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
} from 'antd'
import type { TableProps } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import {
  FoodCategoryFilter,
  FoodDetailFilter,
  foodFilterMenuOptions,
} from '@/config/food-filter.config'

type MenuManageItem = {
  id: string
  name: string
  price: number
  mainIngredient: string
  description: string
}

type RestaurantManageItem = {
  id: string
  name: string
  address: string
  description: string
  category: FoodCategoryFilter
  detail: FoodDetailFilter
  openTime: string
  closeTime: string
  active: boolean
  menuItems: MenuManageItem[]
}

type RestaurantFormValues = {
  name: string
  address: string
  description?: string
  category?: FoodCategoryFilter
  detail?: FoodDetailFilter
  openTime?: Dayjs
  closeTime?: Dayjs
  active?: boolean
}

type MenuFormValues = {
  name: string
  price: number
  mainIngredient: string
  description?: string
}

const initialRestaurants: RestaurantManageItem[] = [
  {
    id: 'restaurant-1',
    name: 'Bếp Nhà Gạo',
    address: '24 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    description: 'Quán cơm gia đình phục vụ bữa trưa và tối.',
    category: FoodCategoryFilter.RESTAURANT,
    detail: FoodDetailFilter.RICE,
    openTime: '08:00',
    closeTime: '22:00',
    active: true,
    menuItems: [
      {
        id: 'menu-1',
        name: 'Cơm gà xối mỡ',
        price: 55000,
        mainIngredient: 'Gà, cơm, rau ăn kèm',
        description: 'Gà chiên giòn ăn cùng cơm nóng.',
      },
      {
        id: 'menu-2',
        name: 'Canh chua cá',
        price: 65000,
        mainIngredient: 'Cá, cà chua, dứa',
        description: 'Vị chua nhẹ, hợp dùng theo phần gia đình.',
      },
    ],
  },
  {
    id: 'restaurant-2',
    name: 'Phở Bò Đêm',
    address: '12 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
    description: 'Phở bò mở muộn cho khách ăn đêm.',
    category: FoodCategoryFilter.RESTAURANT,
    detail: FoodDetailFilter.BUN_PHO,
    openTime: '06:00',
    closeTime: '23:30',
    active: true,
    menuItems: [
      {
        id: 'menu-3',
        name: 'Phở tái nạm',
        price: 50000,
        mainIngredient: 'Bánh phở, thịt bò, nước dùng',
        description: 'Tô phở bò truyền thống.',
      },
    ],
  },
]

function createEmptyRestaurant(): RestaurantManageItem {
  const detail = getCategoryDetailOptions(FoodCategoryFilter.RESTAURANT)[0]

  return {
    id: `restaurant-${Date.now()}`,
    name: '',
    address: '',
    description: '',
    category: FoodCategoryFilter.RESTAURANT,
    detail: detail.value,
    openTime: '08:00',
    closeTime: '22:00',
    active: true,
    menuItems: [],
  }
}

function timeToDayjs(value: string) {
  return dayjs(`2000-01-01T${value}:00`)
}

function formatTime(value?: Dayjs) {
  return value ? value.format('HH:mm') : ''
}

const manageableCategoryValues: FoodCategoryFilter[] = [
  FoodCategoryFilter.RESTAURANT,
  FoodCategoryFilter.PUB,
  FoodCategoryFilter.DRINK,
  FoodCategoryFilter.CAFE,
  FoodCategoryFilter.DESSERT_SNACK,
]

const categoryOptions = foodFilterMenuOptions
  .filter((option) => manageableCategoryValues.includes(option.value))
  .map((option) => ({
    value: option.value,
    label: option.label,
  }))

function getCategoryDetailOptions(category?: FoodCategoryFilter) {
  return (
    foodFilterMenuOptions
      .find((option) => option.value === category)
      ?.children?.map((option) => ({
        value: option.value,
        label: option.label,
      })) ?? []
  )
}

function QuanLyCuaHangPage() {
  const [restaurantForm] = Form.useForm<RestaurantFormValues>()
  const [menuForm] = Form.useForm<MenuFormValues>()
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [selectedRestaurant, setSelectedRestaurant] = useState(initialRestaurants[0])
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false)
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null)
  const selectedCategory = Form.useWatch('category', restaurantForm) ?? selectedRestaurant.category
  const detailOptions = getCategoryDetailOptions(selectedCategory)

  useEffect(() => {
    restaurantForm.setFieldsValue({
      name: selectedRestaurant.name,
      address: selectedRestaurant.address,
      description: selectedRestaurant.description,
      category: selectedRestaurant.category,
      detail: selectedRestaurant.detail,
      openTime: timeToDayjs(selectedRestaurant.openTime),
      closeTime: timeToDayjs(selectedRestaurant.closeTime),
      active: selectedRestaurant.active,
    })
  }, [
    restaurantForm,
    selectedRestaurant.active,
    selectedRestaurant.address,
    selectedRestaurant.category,
    selectedRestaurant.closeTime,
    selectedRestaurant.description,
    selectedRestaurant.detail,
    selectedRestaurant.id,
    selectedRestaurant.name,
    selectedRestaurant.openTime,
  ])

  const restaurantColumns: TableProps<RestaurantManageItem>['columns'] = [
    {
      title: 'STT',
      width: 72,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Tên quán',
      dataIndex: 'name',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
    },
    {
      title: 'Giờ mở cửa',
      dataIndex: 'openTime',
      width: 130,
    },
    {
      title: 'Giờ đóng cửa',
      dataIndex: 'closeTime',
      width: 140,
    },
  ]

  const menuColumns: TableProps<MenuManageItem>['columns'] = [
    {
      title: 'Tên món',
      dataIndex: 'name',
    },
    {
      title: 'Giá món',
      dataIndex: 'price',
      render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
      width: 120,
    },
    {
      title: 'Nguyên liệu chính',
      dataIndex: 'mainIngredient',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
    },
    {
      title: 'Thao tác',
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
            <Button danger icon={<DeleteOutlined />} size="small" type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const selectRestaurant = (record: RestaurantManageItem) => {
    setSelectedRestaurant({
      ...record,
      menuItems: [...record.menuItems],
    })
    setIsCreatingRestaurant(false)
  }

  const openCreateRestaurantForm = () => {
    setSelectedRestaurant(createEmptyRestaurant())
    setIsCreatingRestaurant(true)
  }

  const openCreateMenuModal = () => {
    setEditingMenuId(null)
    menuForm.resetFields()
    setMenuModalOpen(true)
  }

  const openEditMenuModal = (record: MenuManageItem) => {
    setEditingMenuId(record.id)
    menuForm.setFieldsValue(record)
    setMenuModalOpen(true)
  }

  const saveMenuItem = async () => {
    const values = await menuForm.validateFields()

    setSelectedRestaurant((current) => {
      const nextMenuItem: MenuManageItem = {
        id: editingMenuId ?? `menu-${Date.now()}`,
        name: values.name,
        price: values.price,
        mainIngredient: values.mainIngredient,
        description: values.description ?? '',
      }
      const menuItems = editingMenuId
        ? current.menuItems.map((item) => (item.id === editingMenuId ? nextMenuItem : item))
        : [...current.menuItems, nextMenuItem]

      return {
        ...current,
        menuItems,
      }
    })

    setMenuModalOpen(false)
    setEditingMenuId(null)
    menuForm.resetFields()
  }

  const deleteMenuItem = (menuId: string) => {
    setSelectedRestaurant((current) => ({
      ...current,
      menuItems: current.menuItems.filter((item) => item.id !== menuId),
    }))
  }

  const saveRestaurant = async () => {
    const values = await restaurantForm.validateFields()
    const nextRestaurant: RestaurantManageItem = {
      ...selectedRestaurant,
      name: values.name,
      address: values.address,
      description: values.description ?? '',
      category: values.category ?? FoodCategoryFilter.RESTAURANT,
      detail: values.detail ?? getCategoryDetailOptions(values.category)[0]?.value,
      openTime: formatTime(values.openTime),
      closeTime: formatTime(values.closeTime),
      active: Boolean(values.active),
    }

    setRestaurants((current) =>
      isCreatingRestaurant
        ? [nextRestaurant, ...current]
        : current.map((item) => (item.id === nextRestaurant.id ? nextRestaurant : item)),
    )
    setSelectedRestaurant(nextRestaurant)
    setIsCreatingRestaurant(false)
  }

  const deleteRestaurant = () => {
    if (isCreatingRestaurant) {
      selectRestaurant(restaurants[0])
      return
    }

    const nextRestaurants = restaurants.filter((item) => item.id !== selectedRestaurant.id)
    setRestaurants(nextRestaurants)
    if (nextRestaurants.length > 0) {
      selectRestaurant(nextRestaurants[0])
      return
    }

    setSelectedRestaurant(createEmptyRestaurant())
    setIsCreatingRestaurant(true)
  }

  return (
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
        <Button icon={<PlusOutlined />} type="primary" onClick={openCreateRestaurantForm}>
          Thêm quán ăn
        </Button>
      </Flex>

      <Row gutter={[20, 20]}>
        <Col lg={13} span={24}>
          <Card title="Danh sách quán ăn">
            <Table
              columns={restaurantColumns}
              dataSource={restaurants}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              rowClassName={(record) =>
                record.id === selectedRestaurant.id ? 'restaurant-management__row--active' : ''
              }
              rowKey="id"
              scroll={{ x: 760 }}
              onRow={(record) => ({
                onClick: () => selectRestaurant(record),
              })}
            />
          </Card>
        </Col>

        <Col lg={11} span={24}>
          <Card title={isCreatingRestaurant ? 'Thêm mới quán ăn' : 'Chi tiết quán ăn'}>
            <Form form={restaurantForm} layout="vertical">
              <Form.Item
                label="Tên quán"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên quán' }]}
              >
                <Input placeholder="Nhập tên quán" />
              </Form.Item>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
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
                    rules={[{ required: true, message: 'Chọn nhóm chính' }]}
                  >
                    <Select
                      options={categoryOptions}
                      placeholder="Chọn nhóm chính"
                      onChange={(value: FoodCategoryFilter) => {
                        restaurantForm.setFieldValue(
                          'detail',
                          getCategoryDetailOptions(value)[0]?.value,
                        )
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col sm={12} span={24}>
                  <Form.Item
                    label="Nhóm chi tiết"
                    name="detail"
                    rules={[{ required: true, message: 'Chọn nhóm chi tiết' }]}
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
                    rules={[{ required: true, message: 'Chọn giờ mở cửa' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col sm={12} span={24}>
                  <Form.Item
                    label="Giờ đóng cửa"
                    name="closeTime"
                    rules={[{ required: true, message: 'Chọn giờ đóng cửa' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="active" valuePropName="checked">
                <Checkbox>Còn hoạt động</Checkbox>
              </Form.Item>
            </Form>

            <Flex align="center" className="restaurant-management__menu-toolbar" justify="space-between">
              <Typography.Title level={4}>Menu quán</Typography.Title>
              <Button type = "primary" icon={<PlusOutlined />} onClick={openCreateMenuModal}>
                Thêm món ăn
              </Button>
            </Flex>
            <Table
              columns={menuColumns}
              dataSource={selectedRestaurant.menuItems}
              pagination={false}
              rowKey="id"
              scroll={{ x: 720 }}
              size="small"
            />

            <div className="restaurant-management__footer">
              <Button type="primary" onClick={saveRestaurant}>
                Lưu
              </Button>
              <Popconfirm
                cancelText="Hủy"
                okText="Xóa"
                title="Xóa quán ăn này?"
                onConfirm={deleteRestaurant}
              >
                <Button danger>Xóa</Button>
              </Popconfirm>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        destroyOnHidden
        okText="Lưu"
        open={menuModalOpen}
        title={editingMenuId ? 'Sửa thông tin món ăn' : 'Thêm mới món ăn'}
        onCancel={() => setMenuModalOpen(false)}
        onOk={saveMenuItem}
      >
        <Form form={menuForm} layout="vertical">
          <Form.Item
            label="Tên món"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên món' }]}
          >
            <Input placeholder="Nhập tên món" />
          </Form.Item>
          <Form.Item
            label="Giá món"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá món' }]}
          >
            <InputNumber min={0} placeholder="Nhập giá món" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Nguyên liệu chính"
            name="mainIngredient"
            rules={[{ required: true, message: 'Vui lòng nhập nguyên liệu chính' }]}
          >
            <Input placeholder="Ví dụ: thịt bò, bánh phở, rau thơm" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả món ăn" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default QuanLyCuaHangPage
