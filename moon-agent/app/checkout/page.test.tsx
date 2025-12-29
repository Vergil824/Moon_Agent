/**
 * Checkout Page Tests
 * Story 4.4: Task 1 - Basic checkout page structure tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CheckoutPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { accessToken: "test-token" },
    status: "authenticated",
  }),
}));

// Mock React Query hooks
vi.mock("@/lib/payment/useSettlement", () => ({
  useCheckout: () => ({
    settlement: null,
    items: [],
    address: null,
    price: {
      totalPrice: 0,
      discountPrice: 0,
      deliveryPrice: 0,
      payPrice: 0,
    },
    isLoading: false,
    error: null,
    isCreatingOrder: false,
    createOrder: vi.fn(),
    createOrderError: null,
  }),
}));

// Mock address hooks
vi.mock("@/lib/address/useAddress", () => ({
  useAddress: () => ({
    addresses: [],
    defaultAddress: null,
    isLoading: false,
  }),
}));

vi.mock("@/lib/address/addressStore", () => ({
  useSelectedAddressStore: () => ({
    selectedAddressId: null,
    setSelectedAddressId: vi.fn(),
  }),
}));

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders checkout page with correct test id", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("checkout-page")).toBeInTheDocument();
  });

  it("renders CheckoutHeader", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("checkout-header")).toBeInTheDocument();
    expect(screen.getByText("确认订单")).toBeInTheDocument();
  });

  it("has brand gradient background", () => {
    render(<CheckoutPage />);

    const page = screen.getByTestId("checkout-page");
    expect(page).toHaveClass("bg-gradient-to-b");
    expect(page).toHaveClass("from-[#FFF5F7]");
    expect(page).toHaveClass("to-[#FAF5FF]");
  });

  it("has correct layout structure", () => {
    render(<CheckoutPage />);

    const page = screen.getByTestId("checkout-page");
    expect(page).toHaveClass("flex");
    expect(page).toHaveClass("flex-col");
    expect(page).toHaveClass("min-h-screen");
  });

  it("renders checkout footer", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("checkout-footer")).toBeInTheDocument();
  });

  it("renders address card", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("address-card")).toBeInTheDocument();
  });

  it("renders payment method selector", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("payment-method-selector")).toBeInTheDocument();
  });

  it("renders order remark", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("order-remark")).toBeInTheDocument();
  });
});
