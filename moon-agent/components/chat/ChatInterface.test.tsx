import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import { ChatInterface } from "./ChatInterface";
import { useChatStore } from "@/lib/core/store";

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

// Mock the store
vi.mock("@/lib/core/store", () => ({
  useChatStore: vi.fn(),
  useChatStoreHydrated: vi.fn().mockReturnValue(true) // Story 2.5: Always hydrated in tests
}));

// Mock framer-motion to avoid animation issues in tests
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
    }
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) => (
    <>{children}</>
  )
}));

describe("ChatInterface", () => {
  it("renders the chat container with correct background gradient", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    const container = screen.getByTestId("chat-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("bg-gradient-to-br");
    expect(container).toHaveClass("from-[#FFF5F7]");
    expect(container).toHaveClass("to-[#FAF5FF]");
  });

  it("renders bot messages with white bubble and gray text", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "来啦宝宝！",
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    const bubble = screen.getByTestId("message-bubble-1");
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveClass("bg-white");
    expect(bubble).toHaveClass("text-gray-800");
  });

  it("renders user messages with violet bubble and white text", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "1",
          role: "user",
          content: "准备好了",
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    const bubble = screen.getByTestId("message-bubble-1");
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveClass("bg-violet-500");
    expect(bubble).toHaveClass("text-white");
  });

  it("displays bot avatar for assistant messages", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "欢迎！",
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    const avatar = screen.getByTestId("bot-avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("does not display avatar for user messages", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "1",
          role: "user",
          content: "你好",
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    expect(screen.queryByTestId("bot-avatar")).not.toBeInTheDocument();
  });

  it("shows typing indicator when isTyping is true", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: true,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    expect(screen.getByTestId("typing-indicator")).toBeInTheDocument();
  });

  it("renders messages in correct order", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        { id: "1", role: "assistant", content: "First", timestamp: 1 },
        { id: "2", role: "user", content: "Second", timestamp: 2 },
        { id: "3", role: "assistant", content: "Third", timestamp: 3 }
      ],
      isTyping: false,
      streamingMessageId: null, // Story 2.6
      setIsTypewriterActive: vi.fn(), // Story 2.6
      setHasAutoOpenedCurrentState: vi.fn() // Story 2.6
    });

    render(<ChatInterface />);

    const messages = screen.getAllByTestId(/^message-bubble-/);
    expect(messages).toHaveLength(3);
  });

  it("keeps normal streaming pace for small lag (typewriter)", () => {
    vi.useFakeTimers();

    const fullContent = "你好，世界";
    const setIsTypewriterActive = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "normal-1",
          role: "assistant",
          content: "",
          fullContent,
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      streamingMessageId: "normal-1",
      setIsTypewriterActive,
      setHasAutoOpenedCurrentState: vi.fn()
    });

    render(<ChatInterface />);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const bubble = screen.getByTestId("message-bubble-normal-1");
    const firstLength = bubble.textContent?.length ?? 0;
    expect(firstLength).toBeGreaterThan(0);
    expect(firstLength).toBeLessThan(fullContent.length);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const secondLength = bubble.textContent?.length ?? 0;
    expect(secondLength - firstLength).toBeLessThanOrEqual(2);

    vi.useRealTimers();
  });

  it("enters catch-up mode for large lag without instant flush", () => {
    vi.useFakeTimers();

    const longContent = "流式".repeat(200); // 400 chars, ensures catch-up path
    const setIsTypewriterActive = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "catchup-1",
          role: "assistant",
          content: "",
          fullContent: longContent,
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      streamingMessageId: "catchup-1",
      setIsTypewriterActive,
      setHasAutoOpenedCurrentState: vi.fn()
    });

    render(<ChatInterface />);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const bubble = screen.getByTestId("message-bubble-catchup-1");
    const lengthAfterFirstTick = bubble.textContent?.length ?? 0;

    expect(lengthAfterFirstTick).toBeGreaterThan(4);
    expect(lengthAfterFirstTick).toBeLessThan(longContent.length);

    vi.useRealTimers();
  });
});

