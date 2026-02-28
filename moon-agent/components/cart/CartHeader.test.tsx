import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartHeader } from "./CartHeader";

describe("CartHeader", () => {
  it("renders with correct title and item count", () => {
    render(<CartHeader itemCount={5} />);
    
    expect(screen.getByTestId("cart-header")).toBeInTheDocument();
    expect(screen.getByText("购物车")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
  });

  it("displays zero count when cart is empty", () => {
    render(<CartHeader itemCount={0} />);
    
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });
});

