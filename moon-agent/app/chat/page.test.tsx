import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatPage from "./page";
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
  const mockGetOrCreateSessionId = vi.fn().mockReturnValue("test-session-id"); // Story 2.5
  const mockStreamAssistantReply = vi.fn().mockResolvedValue(undefined); // Story 2.6

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

  // NOTE: ChatHeader is now rendered globally in app/layout.tsx (Story 1.4)
  // The header test is moved to components/layout/ChatHeader.test.tsx
  it("renders the chat page container", () => {
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
    });

    render(<ChatPage />);

    expect(screen.getByTestId("chat-page")).toBeInTheDocument();
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
    });

    render(<ChatPage />);

    expect(screen.getByText("准备好了！")).toBeInTheDocument();
    expect(screen.getByText("有点紧张")).toBeInTheDocument();
  });

  it("renders LoadingAnalysis when currentState.step is 'summary'", () => {
    vi.mocked(useChatStore).mockReturnValue({
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "（正在分析）",
          timestamp: Date.now()
        }
      ],
      isTyping: false,
      isStreaming: false,
      currentState: { step: "summary" },
      addMessage: mockAddMessage,
      appendToMessage: mockAppendToMessage,
      updateMessageContent: mockUpdateMessageContent,
      setIsTyping: mockSetIsTyping,
      setIsStreaming: vi.fn(),
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
    });

    render(<ChatPage />);

    expect(screen.getByTestId("loading-analysis")).toBeInTheDocument();
    // The UI includes an ellipsis ("生成中...") but we only care about the core label.
    expect(screen.getByText(/生成中/)).toBeInTheDocument();
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
    });

    render(<ChatPage />);

    fireEvent.click(screen.getByText("准备好了！"));

    expect(mockSetCurrentState).toHaveBeenCalledWith(null);
  });

  // NOTE: Full height layout is now controlled by app/layout.tsx (Story 1.4)
  // ChatPage uses flex-1 to fill available space within the global layout
  it("has flexible layout to fill available space", () => {
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
      setCurrentState: mockSetCurrentState,
      getOrCreateSessionId: mockGetOrCreateSessionId, // Story 2.5
      streamAssistantReply: mockStreamAssistantReply // Story 2.6
    });

    render(<ChatPage />);

    const container = screen.getByTestId("chat-page");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("flex-col");
    expect(container).toHaveClass("flex-1");
  });
});

