import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WelcomeOptions } from "./WelcomeOptions";

function stripMotionProps<T extends Record<string, unknown>>(props: T) {
  const {
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    layout,
    layoutId,
    variants,
    ...rest
  } = props as Record<string, unknown>;
  return rest as T;
}

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => {
      const safe = stripMotionProps(props as Record<string, unknown>);
      return <div {...safe}>{children}</div>;
    },
    button: ({
      children,
      onClick,
      ...props
    }: React.PropsWithChildren<{ onClick?: () => void }>) => (
      <button onClick={onClick} {...stripMotionProps(props as any)}>
        {children}
      </button>
    )
  }
}));

describe("WelcomeOptions", () => {
  it("renders welcome options buttons", () => {
    const mockOnSelect = vi.fn();
    render(<WelcomeOptions onSelect={mockOnSelect} />);

    expect(screen.getByText("准备好了！")).toBeInTheDocument();
    expect(screen.getByText("有点紧张")).toBeInTheDocument();
  });

  it("calls onSelect with correct value when button is clicked", () => {
    const mockOnSelect = vi.fn();
    render(<WelcomeOptions onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText("准备好了！"));
    expect(mockOnSelect).toHaveBeenCalledWith("准备好了！");

    fireEvent.click(screen.getByText("有点紧张"));
    expect(mockOnSelect).toHaveBeenCalledWith("有点紧张");
  });

  it("renders buttons with correct styling - outline style with purple border", () => {
    const mockOnSelect = vi.fn();
    render(<WelcomeOptions onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("border-violet-500");
      expect(button).toHaveClass("text-violet-500");
    });
  });

  it("renders buttons as pill-shaped (rounded-full)", () => {
    const mockOnSelect = vi.fn();
    render(<WelcomeOptions onSelect={mockOnSelect} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("rounded-full");
    });
  });
});

