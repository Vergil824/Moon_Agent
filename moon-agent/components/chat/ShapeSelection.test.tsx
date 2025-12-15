import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShapeSelection } from "./ShapeSelection";

describe("ShapeSelection", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all three chest type options", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    expect(screen.getByText("圆盘型")).toBeInTheDocument();
    expect(screen.getByText("纺锤型")).toBeInTheDocument();
    expect(screen.getByText("半球型")).toBeInTheDocument();
  });

  it("renders descriptions for all options", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    expect(screen.getByText("底盘宽，分布均匀")).toBeInTheDocument();
    expect(screen.getByText("底盘小，隆起高")).toBeInTheDocument();
    expect(screen.getByText("底盘中等，饱满均衡")).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    expect(screen.getByRole("button", { name: "确认选择" })).toBeInTheDocument();
  });

  it("disables confirm button when no selection", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    const confirmButton = screen.getByRole("button", { name: "确认选择" });
    expect(confirmButton).toBeDisabled();
  });

  it("enables confirm button after selection", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    // Click to select an option
    fireEvent.click(screen.getByText("圆盘型"));
    
    const confirmButton = screen.getByRole("button", { name: "确认选择" });
    expect(confirmButton).not.toBeDisabled();
  });

  it("selects an option when clicked", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    // Click to select 圆盘型
    fireEvent.click(screen.getByText("圆盘型"));
    
    // The card should now be selected (has checkmark)
    expect(screen.getByTestId("checkmark-icon")).toBeInTheDocument();
  });

  it("changes selection when different option clicked", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    // Select 圆盘型 first
    fireEvent.click(screen.getByText("圆盘型"));
    expect(screen.getByTestId("checkmark-icon")).toBeInTheDocument();
    
    // Select 纺锤型
    fireEvent.click(screen.getByText("纺锤型"));
    
    // Should still only have one checkmark (single selection)
    const checkmarks = screen.getAllByTestId("checkmark-icon");
    expect(checkmarks).toHaveLength(1);
  });

  it("calls onSelect with natural language message when confirmed", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    // Select an option
    fireEvent.click(screen.getByText("圆盘型"));
    
    // Click confirm
    fireEvent.click(screen.getByRole("button", { name: "确认选择" }));
    
    // Should call onSelect with natural language message
    expect(mockOnSelect).toHaveBeenCalledWith("我选择了圆盘型");
  });

  it("sends correct message for spindle type", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByText("纺锤型"));
    fireEvent.click(screen.getByRole("button", { name: "确认选择" }));
    
    expect(mockOnSelect).toHaveBeenCalledWith("我选择了纺锤型");
  });

  it("sends correct message for hemisphere type", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByText("半球型"));
    fireEvent.click(screen.getByRole("button", { name: "确认选择" }));
    
    expect(mockOnSelect).toHaveBeenCalledWith("我选择了半球型");
  });

  it("renders within a container with correct styling", () => {
    render(<ShapeSelection onSelect={mockOnSelect} />);
    
    const container = screen.getByTestId("shape-selection-panel");
    expect(container).toBeInTheDocument();
  });
});
