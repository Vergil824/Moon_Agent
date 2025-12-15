"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ArrowLeft, Mic, Send, ImagePlus } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { getStateComponent } from "@/components/chat/StateComponents";
import { ChatInterface } from "@/components/chat/ChatInterface";
import {
  createN8nDualChannelJsonlParser,
  createN8nDualChannelSseParser
} from "@/lib/n8nDualChannel";

const BOOTSTRAP_INPUT = "你好";

const SESSION_ID_KEY = "moon-agent.sessionId";
const WELCOME_SHOWN_KEY_PREFIX = "moon-agent.welcomeShown:";
const TYPE_DELAY_MS = process.env.NODE_ENV === "test" ? 0 : 15;

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    // Fallback when storage is unavailable
    return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function hasShownWelcome(sessionId: string): boolean {
  try {
    return localStorage.getItem(`${WELCOME_SHOWN_KEY_PREFIX}${sessionId}`) === "1";
  } catch {
    return false;
  }
}

function markShownWelcome(sessionId: string) {
  try {
    localStorage.setItem(`${WELCOME_SHOWN_KEY_PREFIX}${sessionId}`, "1");
  } catch {
    // ignore
  }
}

/**
 * Chat Header component
 */
function ChatHeader() {
  return (
    <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>
      <h1 className="font-bold text-violet-500 text-lg">满月 Moon</h1>
      <div className="w-10" /> {/* Spacer for centering */}
    </header>
  );
}

/**
 * Chat Input component
 */
function ChatInput({
  onSend,
  disabled = false
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 flex items-center gap-2 px-4 py-3"
    >
      {/* Voice button */}
      <button
        type="button"
        disabled={disabled}
        className="shrink-0 size-12 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <Mic className="w-5 h-5 text-white" />
      </button>

      {/* Text input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入消息..."
        disabled={disabled}
        className="flex-1 h-12 px-4 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 placeholder-gray-500"
      />

      {/* Send/Image button */}
      <button
        type={input.trim() ? "submit" : "button"}
        disabled={disabled}
        className="shrink-0 size-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {input.trim() ? (
          <Send className="w-5 h-5 text-violet-500" />
        ) : (
          <ImagePlus className="w-5 h-5 text-gray-500" />
        )}
      </button>
    </form>
  );
}

/**
 * Main Chat Page component
 */
export default function ChatPage() {
  const {
    messages,
    isTyping,
    isStreaming,
    currentState,
    addMessage,
    appendToMessage,
    updateMessageContent,
    setIsTyping,
    setIsStreaming,
    setCurrentState
  } = useChatStore();
  const hasInitialized = useRef(false);
  const typingQueueRef = useRef<string[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const flushInProgressRef = useRef(false);
  const flushOnDrainRef = useRef<(() => void) | null>(null);

  const flushTypingQueue = useCallback(
    (assistantId: string, onDrain?: () => void) => {
      if (onDrain) {
        flushOnDrainRef.current = onDrain;
      }
      if (flushInProgressRef.current) return;
      flushInProgressRef.current = true;

      const tick = () => {
        const next = typingQueueRef.current.shift();
        if (next) {
          appendToMessage(assistantId, next);
        }

        if (typingQueueRef.current.length > 0) {
          flushTimerRef.current = window.setTimeout(tick, TYPE_DELAY_MS);
        } else {
          flushInProgressRef.current = false;
          flushTimerRef.current = null;
          const cb = flushOnDrainRef.current;
          flushOnDrainRef.current = null;
          cb?.();
        }
      };

      flushTimerRef.current = window.setTimeout(tick, TYPE_DELAY_MS);
    },
    [appendToMessage]
  );

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) window.clearTimeout(flushTimerRef.current);
    };
  }, []);

  const streamAssistantReply = useCallback(
    async (chatInput: string) => {
      const sessionId = getOrCreateSessionId();
      const welcomeAlreadyShown = hasShownWelcome(sessionId);

      // Show typing indicator bubble (three dots) while waiting for first token
      setIsTyping(true);
      setIsStreaming(true);

      let assistantId: string | null = null;
      let anyText = false;
      let pendingState: unknown | null = null;
      let streamEnded = false;

      const maybeFinalize = () => {
        if (!streamEnded) return;
        if (typingQueueRef.current.length > 0) return;
        if (flushInProgressRef.current) return;

        setIsStreaming(false);
        setCurrentState(pendingState as any);
      };

      const ensureAssistantMessage = () => {
        if (assistantId) return assistantId;
        assistantId = addMessage({ role: "assistant", content: "" });
        // Once the assistant bubble exists, hide the separate typing indicator
        setIsTyping(false);
        return assistantId;
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, chatInput })
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(
            `Chat request failed: ${res.status} ${res.statusText} ${errText}`.trim()
          );
        }

        if (!res.body) {
          throw new Error("Chat response body is empty");
        }

        const contentType = res.headers.get("content-type") || "";
        const parser = contentType.includes("text/event-stream")
          ? createN8nDualChannelSseParser()
          : createN8nDualChannelJsonlParser();

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const events = parser.push(chunk);
          for (const e of events) {
            if (e.state !== undefined) {
              // Only show welcome options once per session
              const step =
                e.state && typeof (e.state as any).step === "string"
                  ? ((e.state as any).step as string)
                  : "";

              if (step === "welcome") {
                pendingState = e.state ?? null;
                // Keep the marker, but do not block rendering.
                markShownWelcome(sessionId);
              } else {
                pendingState = e.state ?? null;
              }
            }

            if (e.textDelta) {
              anyText = true;
              const id = ensureAssistantMessage();

              // Typewriter: enqueue chars, flush gradually (instant in tests)
              for (const ch of e.textDelta) typingQueueRef.current.push(ch);
              flushTypingQueue(id, maybeFinalize);
            }
          }
        }

        streamEnded = true;

        // Ensure typing indicator is hidden at the end
        setIsTyping(false);

        if (!anyText) {
          const id = ensureAssistantMessage();
          updateMessageContent(id, "（没有收到可显示的回复内容）");
        }

        maybeFinalize();
      } catch (err) {
        // Ensure typing indicator is hidden on error
        setIsTyping(false);
        setIsStreaming(false);
        const id = ensureAssistantMessage();
        const msg = err instanceof Error ? err.message : "Unknown chat error";
        updateMessageContent(id, `（请求失败：${msg}）`);
      }
    },
    [
      addMessage,
      flushTypingQueue,
      setCurrentState,
      setIsTyping,
      setIsStreaming,
      updateMessageContent
    ]
  );

  // Initialize with welcome message on first load
  useEffect(() => {
    if (hasInitialized.current) return;
    if (messages.length === 0) {
      hasInitialized.current = true;
      // Bootstrap: let n8n generate the opening message
      void streamAssistantReply(BOOTSTRAP_INPUT);
    }
  }, [messages.length, streamAssistantReply]);

  // Handle sending messages
  const handleSend = useCallback(
    (message: string) => {
      addMessage({ role: "user", content: message });
      // Clear current state options after user selects
      if (currentState) {
        setCurrentState(null);
      }
      void streamAssistantReply(message);
    },
    [addMessage, currentState, setCurrentState, streamAssistantReply]
  );

  // Handle option selection from state components
  const handleOptionSelect = useCallback(
    (option: string) => {
      handleSend(option);
    },
    [handleSend]
  );

  // Get state component to render
  const StateComponent = getStateComponent(currentState);
  const isMeasurementLocked = (currentState as any)?.step === "size_input";

  return (
    <div
      data-testid="chat-page"
      className="h-screen flex flex-col bg-gradient-to-br from-[#FFF5F7] to-[#FAF5FF]"
    >
      <ChatHeader />

      <ChatInterface
        mode="embedded"
        scrollKey={currentState?.step}
        afterMessages={
          StateComponent && !isTyping && !isStreaming ? (
            <StateComponent onSelect={handleOptionSelect} />
          ) : null
        }
      />

      <ChatInput onSend={handleSend} disabled={isMeasurementLocked} />
    </div>
  );
}

