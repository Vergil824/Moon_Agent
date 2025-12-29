/**
 * CheckoutFooter Component Tests
 * Story 4.4: Task 5 - Checkout footer tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutFooter } from "./CheckoutFooter";

describe("CheckoutFooter", () => {
  it("renders with correct test id", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByTestId("checkout-footer")).toBeInTheDocument();
  });

  it("displays item count", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={3}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("件，合计:")).toBeInTheDocument();
  });

  it("displays total amount in yuan", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={() => {}}
      />
    );

    // Price is now inline with the summary text
    expect(screen.getByText("¥168.00")).toBeInTheDocument();
  });

  it("displays submit button with correct text", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByTestId("checkout-submit-btn")).toHaveTextContent("立即支付");
  });

  it("calls onSubmit when button is clicked", () => {
    const onSubmit = vi.fn();
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByTestId("checkout-submit-btn"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={() => {}}
        isLoading={true}
      />
    );

    expect(screen.getByText("提交中...")).toBeInTheDocument();
  });

  it("disables button when disabled is true", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={() => {}}
        disabled={true}
      />
    );

    expect(screen.getByTestId("checkout-submit-btn")).toBeDisabled();
  });

  it("does not call onSubmit when disabled", () => {
    const onSubmit = vi.fn();
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={onSubmit}
        disabled={true}
      />
    );

    fireEvent.click(screen.getByTestId("checkout-submit-btn"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit when loading", () => {
    const onSubmit = vi.fn();
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={onSubmit}
        isLoading={true}
      />
    );

    fireEvent.click(screen.getByTestId("checkout-submit-btn"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("has gradient background on submit button", () => {
    render(
      <CheckoutFooter
        totalAmount={16800}
        itemCount={2}
        onSubmit={() => {}}
      />
    );

    const btn = screen.getByTestId("checkout-submit-btn");
    expect(btn).toHaveStyle({
      background: "linear-gradient(105deg, #DA3568 9.87%, #FB7185 92.16%)",
    });
  });
});

