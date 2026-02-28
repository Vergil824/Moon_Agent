/**
 * CheckoutProductItem Component Tests
 * Story 4.4: Task 3.2 - Checkout product item tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutProductItem } from "./CheckoutProductItem";
import { type SettlementItem } from "@/lib/order/orderApi";

const mockItem: SettlementItem = {
  spuId: 1,
  spuName: "云朵棉无钢圈内衣套装",
  skuId: 101,
  count: 2,
  cartId: 1001,
  categoryId: 1,
  price: 16800, // 168.00 yuan
  picUrl: "http://example.com/product.jpg",
  stock: 100,
  properties: [
    { propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "云朵白" },
    { propertyId: 2, propertyName: "尺码", valueId: 2, valueName: "M" },
  ],
};

describe("CheckoutProductItem", () => {
  it("renders with correct test id", () => {
    render(<CheckoutProductItem item={mockItem} />);

    expect(screen.getByTestId("checkout-product-item")).toBeInTheDocument();
  });

  it("displays product name", () => {
    render(<CheckoutProductItem item={mockItem} />);

    expect(screen.getByTestId("product-name")).toHaveTextContent(
      "云朵棉无钢圈内衣套装"
    );
  });

  it("displays product properties", () => {
    render(<CheckoutProductItem item={mockItem} />);

    expect(screen.getByTestId("product-properties")).toHaveTextContent("云朵白; M");
  });

  it("displays formatted price in yuan", () => {
    render(<CheckoutProductItem item={mockItem} />);

    expect(screen.getByTestId("product-price")).toHaveTextContent("¥168.00");
  });

  it("displays quantity", () => {
    render(<CheckoutProductItem item={mockItem} />);

    expect(screen.getByTestId("product-count")).toHaveTextContent("x2");
  });

  it("handles item with no properties", () => {
    const itemNoProps: SettlementItem = {
      ...mockItem,
      properties: [],
    };
    render(<CheckoutProductItem item={itemNoProps} />);

    expect(screen.queryByTestId("product-properties")).not.toBeInTheDocument();
  });

  it("renders product image", () => {
    render(<CheckoutProductItem item={mockItem} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", mockItem.spuName);
  });
});

