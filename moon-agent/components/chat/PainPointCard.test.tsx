import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PainPointCard } from "./PainPointCard";

describe("PainPointCard", () => {
  const defaultProps = {
    title: "钢圈戳腋下",
    imageSrc: "/assets/pain_points/钢圈戳腋下.png",
    selected: false,
    onToggle: vi.fn()
  };

  it("renders title correctly", () => {
    render(<PainPointCard {...defaultProps} />);
    
    expect(screen.getByText("钢圈戳腋下")).toBeInTheDocument();
  });

  it("renders image with correct src", () => {
    render(<PainPointCard {...defaultProps} />);
    
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "钢圈戳腋下");
  });

  it("applies default styling when not selected", () => {
    render(<PainPointCard {...defaultProps} />);
    
    const card = screen.getByTestId("pain-point-card");
    expect(card).toHaveClass("border-gray-200");
    expect(card).not.toHaveClass("border-moon-purple");
    expect(card).not.toHaveClass("bg-purple-50");
  });

  it("applies selected styling when selected (Figma purple theme)", () => {
    render(<PainPointCard {...defaultProps} selected={true} />);
    
    const card = screen.getByTestId("pain-point-card");
    expect(card).toHaveClass("border-moon-purple");
    expect(card).toHaveClass("bg-purple-50");
  });

  it("shows checkmark when selected", () => {
    render(<PainPointCard {...defaultProps} selected={true} />);
    
    expect(screen.getByTestId("checkmark")).toBeInTheDocument();
  });

  it("hides checkmark when not selected", () => {
    render(<PainPointCard {...defaultProps} selected={false} />);
    
    expect(screen.queryByTestId("checkmark")).not.toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<PainPointCard {...defaultProps} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByTestId("pain-point-card"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("has accessible button role", () => {
    render(<PainPointCard {...defaultProps} />);
    
    const card = screen.getByRole("button");
    expect(card).toBeInTheDocument();
  });
});

