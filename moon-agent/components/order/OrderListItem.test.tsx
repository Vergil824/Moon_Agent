import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderListItem from "./OrderListItem";
import { AppTradeOrderPageItem, OrderStatus } from "@/lib/order/orderApi";

describe("OrderListItem", () => {
  const createMockOrder = (overrides?: Partial<AppTradeOrderPageItem>): AppTradeOrderPageItem => ({
    id: 1,
    no: "202312250001",
    status: OrderStatus.COMPLETED,
    payPrice: 16800,
    createTime: "2023-12-25T10:00:00Z",
    items: [
      {
        id: 101,
        orderId: 1,
        spuId: 1,
        spuName: "测试商品名称",
        skuId: 1,
        picUrl: "",
        count: 2,
        price: 8400,
        properties: [
          { propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "白色" },
          { propertyId: 2, propertyName: "尺码", valueId: 2, valueName: "M" },
        ],
      },
    ],
    ...overrides,
  });

  it("renders order number", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    expect(screen.getByText("202312250001")).toBeInTheDocument();
  });

  it("renders completed status with correct styling", () => {
    const order = createMockOrder({ status: OrderStatus.COMPLETED });
    render(<OrderListItem order={order} />);

    expect(screen.getByText("已完成")).toBeInTheDocument();
  });

  it("renders unpaid status", () => {
    const order = createMockOrder({ status: OrderStatus.UNPAID });
    render(<OrderListItem order={order} />);

    expect(screen.getByText("待付款")).toBeInTheDocument();
  });

  it("renders undelivered status", () => {
    const order = createMockOrder({ status: OrderStatus.UNDELIVERED });
    render(<OrderListItem order={order} />);

    expect(screen.getByText("待发货")).toBeInTheDocument();
  });

  it("renders delivered status", () => {
    const order = createMockOrder({ status: OrderStatus.DELIVERED });
    render(<OrderListItem order={order} />);

    expect(screen.getByText("待收货")).toBeInTheDocument();
  });

  it("renders cancelled status", () => {
    const order = createMockOrder({ status: OrderStatus.CANCELLED });
    render(<OrderListItem order={order} />);

    expect(screen.getByText("已取消")).toBeInTheDocument();
  });

  it("renders item name", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    expect(screen.getByText("测试商品名称")).toBeInTheDocument();
  });

  it("renders item properties", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    expect(screen.getByText("白色; M")).toBeInTheDocument();
  });

  it("renders item price in yuan", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    // Item price: 8400 cents = 84.00 yuan
    expect(screen.getByText("¥84.00")).toBeInTheDocument();
  });

  it("renders item count", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    expect(screen.getByText("x2")).toBeInTheDocument();
  });

  it("renders total price in yuan", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    // Pay price: 16800 cents = 168.00 yuan
    expect(screen.getByText("¥168.00")).toBeInTheDocument();
  });

  it("renders total item count", () => {
    const order = createMockOrder({
      items: [
        {
          id: 101,
          orderId: 1,
          spuId: 1,
          spuName: "商品1",
          skuId: 1,
          picUrl: "",
          count: 2,
          price: 5000,
          properties: [],
        },
        {
          id: 102,
          orderId: 1,
          spuId: 2,
          spuName: "商品2",
          skuId: 2,
          picUrl: "",
          count: 3,
          price: 3000,
          properties: [],
        },
      ],
    });
    render(<OrderListItem order={order} />);

    expect(screen.getByText("共5件")).toBeInTheDocument();
  });

  it("renders placeholder when no image", () => {
    const order = createMockOrder();
    render(<OrderListItem order={order} />);

    expect(screen.getByText("暂无图片")).toBeInTheDocument();
  });
});

