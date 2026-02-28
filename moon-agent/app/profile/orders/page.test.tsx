import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OrdersPage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: vi.fn(),
  }),
}));

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock useOrderList
const mockUseOrderList = vi.fn();
vi.mock("@/lib/order/useOrders", () => ({
  useOrderList: () => mockUseOrderList(),
}));

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, "scrollTo", { value: mockScrollTo, writable: true });

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to welcome when unauthenticated", () => {
    mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
    mockUseOrderList.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<OrdersPage />);

    expect(mockPush).toHaveBeenCalledWith("/welcome");
  });

  it("shows skeleton while loading", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<OrdersPage />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows empty state when no orders", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: { list: [], total: 0 },
      isLoading: false,
      error: null,
    });

    render(<OrdersPage />);

    expect(screen.getByText("暂无订单")).toBeInTheDocument();
  });

  it("displays order list with order data", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: {
        list: [
          {
            id: 1,
            no: "202312250001",
            status: 30,
            payPrice: 16800,
            createTime: "2023-12-25T10:00:00Z",
            items: [
              {
                id: 101,
                orderId: 1,
                spuId: 1,
                spuName: "测试商品",
                skuId: 1,
                picUrl: "https://example.com/pic.jpg",
                count: 2,
                price: 8400,
                properties: [{ propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "白色" }],
              },
            ],
          },
        ],
        total: 1,
      },
      isLoading: false,
      error: null,
    });

    render(<OrdersPage />);

    expect(screen.getByText("订单号:")).toBeInTheDocument();
    expect(screen.getByText("202312250001")).toBeInTheDocument();
    expect(screen.getByText("测试商品")).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("¥168.00")).toBeInTheDocument();
  });

  it("shows pagination when multiple pages", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: {
        list: Array(10)
          .fill(null)
          .map((_, i) => ({
            id: i + 1,
            no: `202312250${String(i + 1).padStart(3, "0")}`,
            status: 30,
            payPrice: 10000,
            createTime: "2023-12-25T10:00:00Z",
            items: [],
          })),
        total: 25,
      },
      isLoading: false,
      error: null,
    });

    render(<OrdersPage />);

    // Should show pagination
    expect(screen.getByLabelText("第一页")).toBeInTheDocument();
    expect(screen.getByLabelText("上一页")).toBeInTheDocument();
    expect(screen.getByLabelText("下一页")).toBeInTheDocument();
    expect(screen.getByLabelText("最后一页")).toBeInTheDocument();

    // Should show page info
    expect(screen.getByText(/第 1 \/ 3 页/)).toBeInTheDocument();
  });

  it("navigates back when back button clicked", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: { list: [], total: 0 },
      isLoading: false,
      error: null,
    });

    render(<OrdersPage />);

    const backButton = screen.getByLabelText("返回");
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("shows error state with reload button", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<OrdersPage />);

    expect(screen.getByText("加载失败，请稍后重试")).toBeInTheDocument();
    expect(screen.getByText("重新加载")).toBeInTheDocument();
  });

  it("renders page title correctly", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseOrderList.mockReturnValue({
      data: { list: [], total: 0 },
      isLoading: false,
      error: null,
    });

    render(<OrdersPage />);

    expect(screen.getByText("我的订单")).toBeInTheDocument();
  });
});

