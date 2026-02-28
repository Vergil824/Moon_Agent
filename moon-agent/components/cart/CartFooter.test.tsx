import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartFooter } from "./CartFooter";

describe("CartFooter", () => {
  const defaultProps = {
    isAllSelected: false,
    totalAmount: 16000, // 160.00 yuan in cents
    selectedCount: 2,
    onSelectAllChange: vi.fn(),
    onCheckout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required elements", () => {
    render(<CartFooter {...defaultProps} />);
    
    expect(screen.getByTestId("cart-footer")).toBeInTheDocument();
    expect(screen.getByText("全选")).toBeInTheDocument();
    expect(screen.getByText("合计:")).toBeInTheDocument();
    expect(screen.getByText("¥160")).toBeInTheDocument();
    expect(screen.getByText(/结算/)).toBeInTheDocument();
  });

  it("displays formatted price correctly (cents to yuan)", () => {
    render(<CartFooter {...defaultProps} totalAmount={28700} />);
    
    expect(screen.getByText("¥287")).toBeInTheDocument();
  });

  it("displays decimal prices correctly", () => {
    render(<CartFooter {...defaultProps} totalAmount={19999} />);
    
    expect(screen.getByText("¥199.99")).toBeInTheDocument();
  });

  it("shows selected count in checkout button", () => {
    render(<CartFooter {...defaultProps} selectedCount={3} />);
    
    expect(screen.getByText("结算(3)")).toBeInTheDocument();
  });

  it("calls onSelectAllChange when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const handleSelectAll = vi.fn();
    
    render(<CartFooter {...defaultProps} onSelectAllChange={handleSelectAll} />);
    
    // Find checkbox by role
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    
    expect(handleSelectAll).toHaveBeenCalledWith(true);
  });

  it("calls onCheckout when checkout button is clicked", async () => {
    const user = userEvent.setup();
    const handleCheckout = vi.fn();
    
    render(<CartFooter {...defaultProps} onCheckout={handleCheckout} />);
    
    const checkoutButton = screen.getByRole("button", { name: /结算/ });
    await user.click(checkoutButton);
    
    expect(handleCheckout).toHaveBeenCalledTimes(1);
  });

  it("disables checkout button when no items selected", () => {
    render(<CartFooter {...defaultProps} selectedCount={0} />);
    
    const checkoutButton = screen.getByRole("button", { name: /结算/ });
    expect(checkoutButton).toBeDisabled();
  });

  it("disables checkout button when disabled prop is true", () => {
    render(<CartFooter {...defaultProps} disabled={true} />);
    
    const checkoutButton = screen.getByRole("button", { name: /结算/ });
    expect(checkoutButton).toBeDisabled();
  });

  it("shows checkbox as checked when isAllSelected is true", () => {
    render(<CartFooter {...defaultProps} isAllSelected={true} />);
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("shows checkbox as unchecked when isAllSelected is false", () => {
    render(<CartFooter {...defaultProps} isAllSelected={false} />);
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });
});

