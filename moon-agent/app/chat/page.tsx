"use client";

import { useRef, useEffect, useState, useCallback } from "react";
// Story 2.6: Removed unused imports - streaming logic moved to store
import { Mic, Send, ImagePlus } from "lucide-react";
import { useChatStore, useChatStoreHydrated } from "@/lib/core/store";
import { getStateComponent } from "@/components/chat/StateComponents";
import { ChatInterface } from "@/components/chat/ChatInterface";

const BOOTSTRAP_INPUT = "你好";

// Story 2.5: Removed SESSION_ID_KEY, WELCOME_SHOWN_KEY_PREFIX, getOrCreateSessionId,
// hasShownWelcome, markShownWelcome - sessionId now managed by useChatStore with persistence
// Story 2.6: Removed TYPE_DELAY_MS - typewriter logic moved to ChatInterface

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
      className="fixed left-0 right-0 bottom-14 z-40 flex items-center gap-2 px-4 py-3 bg-[#faf5ff] pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
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
 * Story 2.6: Refactored to use store's streamAssistantReply for background streaming (AC: 3, 7, 8, 10)
 */
export default function ChatPage() {
  const {
    messages,
    isTyping,
    isStreaming,
    currentState,
    addMessage,
    setCurrentState,
    streamAssistantReply // Story 2.6: Use store's global streaming action
  } = useChatStore();
  const isHydrated = useChatStoreHydrated(); // Story 2.5: Wait for hydration before initialization
  const hasInitialized = useRef(false);

  // Story 2.6: Removed local streaming logic (typingQueueRef, flushTimerRef, etc.)
  // Streaming is now handled by the store and continues even when page unmounts (AC: 3)

  // Initialize with welcome message on first load
  // Story 2.5: Wait for hydration before checking messages to avoid duplicate initialization
  // Story 2.6: Uses store's streamAssistantReply that runs in background
  useEffect(() => {
    if (!isHydrated) return; // Wait for sessionStorage state to be restored
    if (hasInitialized.current) return;
    if (messages.length === 0) {
      hasInitialized.current = true;
      // Trigger bootstrap input to get real welcome message from backend
      void streamAssistantReply(BOOTSTRAP_INPUT);
    }
  }, [isHydrated, messages.length, streamAssistantReply]);

  // Handle sending messages
  // Story 2.6: Uses store's streamAssistantReply instead of local function
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
  const currentStep = (currentState as any)?.step;
  const isMeasurementLocked = currentStep === "size_input";
  const isSummaryPhase = currentStep === "summary";
  const allowDuringStreaming = isSummaryPhase;
  const shouldRenderState =
    StateComponent && !isTyping && (!isStreaming || allowDuringStreaming);

  return (
    <div
      data-testid="chat-page"
      className="flex flex-col flex-1 pb-32"
    >
      <ChatInterface
        mode="embedded"
        scrollKey={currentState?.step}
        afterMessages={
          shouldRenderState ? (
            <StateComponent
              onSelect={handleOptionSelect}
              payload={currentState ?? undefined}
            />
          ) : null
        }
      />

      <ChatInput onSend={handleSend} disabled={isMeasurementLocked} />
    </div>
  );
}

