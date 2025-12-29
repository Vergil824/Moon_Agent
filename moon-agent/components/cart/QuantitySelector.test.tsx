import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuantitySelector } from "./QuantitySelector";

describe("QuantitySelector", () => {
  const defaultProps = {
    value: 1,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct initial value", () => {
    render(<QuantitySelector {...defaultProps} value={5} />);
    
    expect(screen.getByTestId("quantity-selector")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onChange with decremented value when minus is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<QuantitySelector {...defaultProps} value={3} onChange={handleChange} />);
    
    const minusButton = screen.getByRole("button", { name: "减少数量" });
    await user.click(minusButton);
    
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it("calls onChange with incremented value when plus is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<QuantitySelector {...defaultProps} value={3} onChange={handleChange} />);
    
    const plusButton = screen.getByRole("button", { name: "增加数量" });
    await user.click(plusButton);
    
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("disables minus button when value equals min", () => {
    render(<QuantitySelector {...defaultProps} value={1} min={1} />);
    
    const minusButton = screen.getByRole("button", { name: "减少数量" });
    expect(minusButton).toBeDisabled();
  });

  it("disables plus button when value equals max", () => {
    render(<QuantitySelector {...defaultProps} value={10} max={10} />);
    
    const plusButton = screen.getByRole("button", { name: "增加数量" });
    expect(plusButton).toBeDisabled();
  });

  it("disables both buttons when disabled prop is true", () => {
    render(<QuantitySelector {...defaultProps} value={5} disabled={true} />);
    
    const minusButton = screen.getByRole("button", { name: "减少数量" });
    const plusButton = screen.getByRole("button", { name: "增加数量" });
    
    expect(minusButton).toBeDisabled();
    expect(plusButton).toBeDisabled();
  });

  it("does not call onChange when minus is clicked at min value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<QuantitySelector {...defaultProps} value={1} min={1} onChange={handleChange} />);
    
    const minusButton = screen.getByRole("button", { name: "减少数量" });
    await user.click(minusButton);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("does not call onChange when plus is clicked at max value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<QuantitySelector {...defaultProps} value={99} max={99} onChange={handleChange} />);
    
    const plusButton = screen.getByRole("button", { name: "增加数量" });
    await user.click(plusButton);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("uses custom min value", () => {
    render(<QuantitySelector {...defaultProps} value={0} min={0} />);
    
    const minusButton = screen.getByRole("button", { name: "减少数量" });
    expect(minusButton).toBeDisabled();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("has proper accessibility labels", () => {
    render(<QuantitySelector {...defaultProps} value={3} />);
    
    expect(screen.getByRole("button", { name: "减少数量" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "增加数量" })).toBeInTheDocument();
    expect(screen.getByLabelText("当前数量: 3")).toBeInTheDocument();
  });
});

