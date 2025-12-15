import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectCard } from "./SelectCard";

describe("SelectCard", () => {
  const defaultProps = {
    title: "圆盘型",
    description: "底盘宽，分布均匀",
    imageSrc: "/assets/shapes/圆盘型.png",
    selected: false,
    onClick: vi.fn()
  };

  it("renders title and description", () => {
    render(<SelectCard {...defaultProps} />);
    
    expect(screen.getByText("圆盘型")).toBeInTheDocument();
    expect(screen.getByText("底盘宽，分布均匀")).toBeInTheDocument();
  });

  it("renders image with correct src", () => {
    render(<SelectCard {...defaultProps} />);
    
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "圆盘型");
  });

  it("applies default styling when not selected", () => {
    render(<SelectCard {...defaultProps} />);
    
    const card = screen.getByTestId("select-card");
    expect(card).toHaveClass("border-gray-200");
    expect(card).toHaveClass("bg-white");
    expect(card).not.toHaveClass("border-moon-purple");
    expect(card).not.toHaveClass("bg-purple-50");
  });

  it("applies selected styling when selected", () => {
    render(<SelectCard {...defaultProps} selected={true} />);
    
    const card = screen.getByTestId("select-card");
    expect(card).toHaveClass("border-moon-purple");
    expect(card).toHaveClass("bg-purple-50");
  });

  it("shows checkmark icon when selected", () => {
    render(<SelectCard {...defaultProps} selected={true} />);
    
    expect(screen.getByTestId("checkmark-icon")).toBeInTheDocument();
  });

  it("hides checkmark icon when not selected", () => {
    render(<SelectCard {...defaultProps} selected={false} />);
    
    expect(screen.queryByTestId("checkmark-icon")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<SelectCard {...defaultProps} onClick={onClick} />);
    
    fireEvent.click(screen.getByTestId("select-card"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has accessible button role", () => {
    render(<SelectCard {...defaultProps} />);
    
    const card = screen.getByRole("button");
    expect(card).toBeInTheDocument();
  });
});
