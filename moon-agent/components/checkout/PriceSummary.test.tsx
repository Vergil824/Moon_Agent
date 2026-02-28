/**
 * PriceSummary Component Tests
 * Story 4.4: Task 5 - Price summary tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceSummary } from "./PriceSummary";
import { type SettlementPrice } from "@/lib/order/orderApi";

const mockPrice: SettlementPrice = {
  totalPrice: 33600, // 336.00 yuan
  discountPrice: 0,
  deliveryPrice: 0, // Free shipping
  payPrice: 33600,
};

const mockPriceWithDiscount: SettlementPrice = {
  totalPrice: 50000, // 500.00 yuan
  discountPrice: 5000, // 50.00 yuan discount
  deliveryPrice: 1000, // 10.00 yuan shipping
  payPrice: 46000, // 460.00 yuan
  couponPrice: 1000, // 10.00 yuan coupon
};

describe("PriceSummary", () => {
  it("renders with correct test id", () => {
    render(<PriceSummary price={mockPrice} />);

    expect(screen.getByTestId("price-summary")).toBeInTheDocument();
  });

  it("displays total price", () => {
    render(<PriceSummary price={mockPrice} />);

    expect(screen.getByText("商品总额")).toBeInTheDocument();
    // Total price appears twice (in summary and as pay price), so use getAllByText
    const priceElements = screen.getAllByText("¥336.00");
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays free shipping text when delivery is 0", () => {
    render(<PriceSummary price={mockPrice} />);

    expect(screen.getByText("运费")).toBeInTheDocument();
    expect(screen.getByText("顺丰包邮")).toBeInTheDocument();
  });

  it("displays shipping fee when not free", () => {
    const priceWithShipping: SettlementPrice = {
      ...mockPrice,
      deliveryPrice: 1500, // 15.00 yuan
      payPrice: 35100,
    };
    render(<PriceSummary price={priceWithShipping} />);

    expect(screen.getByText("¥15.00")).toBeInTheDocument();
  });

  it("displays pay price in pink color", () => {
    render(<PriceSummary price={mockPrice} />);

    const payPrice = screen.getByTestId("pay-price");
    expect(payPrice).toHaveTextContent("¥336.00");
    expect(payPrice).toHaveClass("text-[#EC4899]");
  });

  it("displays discount when present", () => {
    render(<PriceSummary price={mockPriceWithDiscount} />);

    expect(screen.getByText("优惠")).toBeInTheDocument();
    expect(screen.getByText("-¥50.00")).toBeInTheDocument();
  });

  it("displays coupon discount when present", () => {
    render(<PriceSummary price={mockPriceWithDiscount} />);

    expect(screen.getByText("优惠券")).toBeInTheDocument();
    expect(screen.getByText("-¥10.00")).toBeInTheDocument();
  });

  it("hides discount row when discount is 0", () => {
    render(<PriceSummary price={mockPrice} />);

    expect(screen.queryByText("优惠")).not.toBeInTheDocument();
  });
});

