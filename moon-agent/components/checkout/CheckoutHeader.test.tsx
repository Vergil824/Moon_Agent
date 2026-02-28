/**
 * CheckoutHeader Component Tests
 * Story 4.4: Task 1.2 - CheckoutHeader component tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutHeader } from "./CheckoutHeader";

// Mock next/navigation
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: vi.fn(),
  }),
}));

describe("CheckoutHeader", () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it("renders with correct title", () => {
    render(<CheckoutHeader />);

    expect(screen.getByText("确认订单")).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(<CheckoutHeader />);

    expect(screen.getByTestId("checkout-header")).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<CheckoutHeader />);

    const backBtn = screen.getByTestId("checkout-back-btn");
    expect(backBtn).toBeInTheDocument();
  });

  it("navigates back when back button is clicked", () => {
    render(<CheckoutHeader />);

    const backBtn = screen.getByTestId("checkout-back-btn");
    fireEvent.click(backBtn);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("has correct styling - fixed position and white background", () => {
    render(<CheckoutHeader />);

    const header = screen.getByTestId("checkout-header");
    expect(header).toHaveClass("fixed");
    expect(header).toHaveClass("bg-white");
  });
});

