import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatPage from "./page";
import { useChatStore } from "@/lib/store";

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
vi.mock("@/lib/store", () => ({
  useChatStore: vi.fn()
}));

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

describe("ChatPage", () => {
  const mockAddMessage = vi.fn();
  const mockAppendToMessage = vi.fn();
  const mockUpdateMessageContent = vi.fn();
  const mockSetIsTyping = vi.fn();
  const mockSetCurrentState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("", {
          status: 200,
          headers: { "content-type": "application/json" }
        })
      )
    );
  });

  it("renders the chat header with title", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    expect(screen.getByText("撑撑姐")).toBeInTheDocument();
  });

  it("renders the chat input at the bottom", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    expect(screen.getByPlaceholderText("输入消息...")).toBeInTheDocument();
  });

  it("renders WelcomeOptions when currentState.step is 'welcome'", () => {
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
      isStreaming: false,
      currentState: { step: "welcome" },
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    expect(screen.getByText("准备好了！")).toBeInTheDocument();
    expect(screen.getByText("有点紧张")).toBeInTheDocument();
  });

  it("disables chat input when currentState.step is 'size_input'", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: { step: "size_input" },
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    expect(screen.getByPlaceholderText("输入消息...")).toBeDisabled();
  });

  it("sends user message when option is selected", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: { step: "welcome" },
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    fireEvent.click(screen.getByText("准备好了！"));

    expect(mockAddMessage).toHaveBeenCalledWith({
      role: "user",
      content: "准备好了！"
    });
  });

  it("clears currentState after option is selected", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: { step: "welcome" },
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    fireEvent.click(screen.getByText("准备好了！"));

    expect(mockSetCurrentState).toHaveBeenCalledWith(null);
  });

  it("has full height layout for mobile viewport", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState
    });

    render(<ChatPage />);

    const container = screen.getByTestId("chat-page");
    expect(container).toHaveClass("h-screen");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("flex-col");
  });
});

