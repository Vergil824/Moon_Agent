import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChatHeader from "./ChatHeader";

describe("ChatHeader", () => {
  it("renders the header with correct brand title", () => {
    render(<ChatHeader />);
    expect(screen.getByText("满月 Moon")).toBeInTheDocument();
  });

  it("has sticky positioning", () => {
    render(<ChatHeader />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky");
    expect(header).toHaveClass("top-0");
  });

  it("has white background with border", () => {
    render(<ChatHeader />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-white");
    expect(header).toHaveClass("border-b");
  });

  it("has correct shadow styling", () => {
    render(<ChatHeader />);
    const header = screen.getByRole("banner");
    // Check for shadow class (Tailwind arbitrary value)
    expect(header.className).toContain("shadow");
  });

  it("displays title with correct brand color", () => {
    render(<ChatHeader />);
    const title = screen.getByText("满月 Moon");
    expect(title).toHaveClass("text-moon-purple");
    expect(title).toHaveClass("font-bold");
  });
});

