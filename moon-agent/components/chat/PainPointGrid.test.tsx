import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PainPointGrid } from "./PainPointGrid";

describe("PainPointGrid", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders all 5 pain point options", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    expect(screen.getByText("钢圈戳腋下")).toBeInTheDocument();
    expect(screen.getByText("疯狂跑杯")).toBeInTheDocument();
    expect(screen.getByText("压胸/四个胸")).toBeInTheDocument();
    expect(screen.getByText("上半截空杯")).toBeInTheDocument();
    expect(screen.getByText("肩带勒肉/滑落")).toBeInTheDocument();
  });

  it("renders grid layout with 2 columns", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    const grid = screen.getByTestId("pain-point-grid");
    expect(grid).toHaveClass("grid-cols-2");
  });

  it("renders selected count header", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    expect(screen.getByText("已选择")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("个痛点")).toBeInTheDocument();
  });

  it("allows multiselect - toggling items", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    // Select first item
    fireEvent.click(screen.getByText("钢圈戳腋下"));
    expect(screen.getByText("1")).toBeInTheDocument();
    
    // Select second item
    fireEvent.click(screen.getByText("疯狂跑杯"));
    expect(screen.getByText("2")).toBeInTheDocument();
    
    // Deselect first item
    fireEvent.click(screen.getByText("钢圈戳腋下"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    expect(screen.getByText("确认痛点")).toBeInTheDocument();
  });

  it("calls onSelect with natural language message on confirm", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    // Select items
    fireEvent.click(screen.getByText("钢圈戳腋下"));
    fireEvent.click(screen.getByText("疯狂跑杯"));
    
    // Confirm
    fireEvent.click(screen.getByText("确认痛点"));
    
    expect(mockOnSelect).toHaveBeenCalledWith("我有钢圈戳腋下、疯狂跑杯的问题");
  });

  it("allows submission with 0 selections (edge case)", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    // Confirm without selection
    fireEvent.click(screen.getByText("确认痛点"));
    
    expect(mockOnSelect).toHaveBeenCalledWith("我没有特别的内衣问题");
  });

  it("has correct panel styling", () => {
    render(<PainPointGrid onSelect={mockOnSelect} />);
    
    const panel = screen.getByTestId("pain-point-panel");
    expect(panel).toHaveClass("bg-white");
    expect(panel).toHaveClass("rounded-3xl");
    expect(panel).toHaveClass("shadow-lg");
  });
});

