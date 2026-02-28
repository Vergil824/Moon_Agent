import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LoadingAnalysis } from "./LoadingAnalysis";

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
    p: ({ children, ...props }: React.PropsWithChildren<object>) => {
      const safe = stripMotionProps(props as Record<string, unknown>);
      return <p {...safe}>{children}</p>;
    },
    span: ({ children, ...props }: React.PropsWithChildren<object>) => {
      const safe = stripMotionProps(props as Record<string, unknown>);
      return <span {...safe}>{children}</span>;
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
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) => (
    <>{children}</>
  )
}));

describe("LoadingAnalysis", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders main container with testid", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    expect(screen.getByTestId("loading-analysis")).toBeInTheDocument();
  });

  it("renders pulsing sphere with gradient", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    const sphere = screen.getByTestId("loading-analysis-sphere");
    expect(sphere).toHaveClass("animate-pulse");
    expect(sphere).toHaveClass("bg-gradient-to-br");
  });

  it("renders ring container", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    const ring = screen.getByTestId("loading-analysis-ring");
    expect(ring).toBeInTheDocument();
  });

  it("renders initial stage text (simplified Get!)", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    expect(screen.getByText("Get！数据齐全，分析即将开始～")).toBeInTheDocument();
  });

  it("renders spinner instead of progress bar", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    expect(screen.getByTestId("loading-analysis-progress-track")).toBeInTheDocument();
    expect(
      screen.getByTestId("loading-analysis-progress-indeterminate")
    ).toBeInTheDocument();
  });

  it("renders '生成中' text instead of percentage", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    // The UI includes an ellipsis ("生成中...") but we only care about the core label.
    expect(screen.getByText(/生成中/)).toBeInTheDocument();
  });

  it("renders timer starting at 00:00", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    expect(screen.getByTestId("loading-analysis-timer")).toHaveTextContent("00:00");
  });

  it("increments timer every second", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.getByTestId("loading-analysis-timer")).toHaveTextContent("00:03");
  });

  it("shows second stage text after 2 seconds", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    
    // Initially only first stage
    expect(screen.queryByText("正在为你重建3D体态模型...")).not.toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    
    expect(screen.getByText("正在为你重建3D体态模型...")).toBeInTheDocument();
  });

  it("shows third stage text after 4 seconds", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    
    // Advance to trigger stage 1 (2000ms)
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    
    // Advance to trigger stage 2 (additional 2000ms from stage 1)
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    
    // The UI text does not include the leading emoji; match the core phrase.
    expect(screen.getByText(/抗引力系数/)).toBeInTheDocument();
  });

  it("has mobile-friendly max-width", () => {
    render(<LoadingAnalysis onSelect={mockOnSelect} />);
    const container = screen.getByTestId("loading-analysis");
    expect(container).toHaveClass("max-w-[330px]");
  });
});
