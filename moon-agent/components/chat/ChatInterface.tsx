"use client";

import type { ReactNode } from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useChatStore, useChatStoreHydrated, Message } from "@/lib/core/store";
import { hasVisibleContent, filterVisibleSegments } from "@/lib/utils/contentUtils";

// Story 2.6: Typewriter delay in milliseconds (instant in tests)
const TYPE_DELAY_MS = process.env.NODE_ENV === "test" ? 0 : 15;

/**
 * Bot avatar component - displays the 撑撑姐 avatar
 */
function BotAvatar() {
  return (
    <div
      data-testid="bot-avatar"
      className="relative shrink-0 size-8 rounded-full shadow-lg overflow-hidden bg-gradient-to-br from-[#FFF5F7] to-[#FAF5FF]"
    >
      {/* Gradient ring avatar for 撑撑姐 */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-moon-purple to-moon-pink opacity-30" />
      <div className="absolute inset-2 rounded-full bg-white" />
    </div>
  );
}

/**
 * Typing indicator with animated dots
 */
function TypingIndicator() {
  return (
    <motion.div
      data-testid="typing-indicator"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-2"
    >
      <BotAvatar />
      <div className="bg-white text-gray-800 rounded-tl-[6px] rounded-tr-3xl rounded-br-3xl rounded-bl-3xl shadow-md px-4 py-3">
        <div className="flex gap-1">
          <motion.span
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Single bubble component - renders one bubble with optional avatar
 */
type SingleBubbleProps = {
  content: string;
  isUser: boolean;
  showAvatar: boolean;
  bubbleId: string;
};

function SingleBubble({ content, isUser, showAvatar, bubbleId }: SingleBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Bot avatar - only for assistant messages, first bubble only */}
      {!isUser && showAvatar && <BotAvatar />}
      {/* Spacer to align subsequent bubbles without avatar */}
      {!isUser && !showAvatar && <div className="shrink-0 size-8" />}

      {/* Message bubble */}
      <div
        data-testid={`message-bubble-${bubbleId}`}
        className={`max-w-[80%] px-4 py-3 shadow-md leading-relaxed ${
          isUser
            ? "bg-violet-500 text-white rounded-tl-3xl rounded-tr-[6px] rounded-br-3xl rounded-bl-3xl"
            : "bg-white text-gray-800 rounded-tl-[6px] rounded-tr-3xl rounded-br-3xl rounded-bl-3xl"
        }`}
      >
        <div
          className={`prose prose-sm max-w-none break-words ${
            isUser ? "prose-invert text-white" : "prose-slate"
          }`}
        >
          <ReactMarkdown
            components={{
              // Remove default margins from paragraphs to keep bubbles compact
              p: ({ children }) => <p className="m-0 last:mb-0">{children}</p>,
              // Style links
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline ${isUser ? "text-white" : "text-violet-600 hover:text-violet-700"}`}
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Story 2.6: Typewriter hook for streaming messages (AC: 9)
 * Handles catch-up animation when returning to chat page during streaming
 * 
 * @param fullContent - The complete content received from streaming
 * @param isCurrentlyStreaming - Whether this specific message is still being streamed
 * @returns The content to display (with typewriter effect)
 */
function useTypewriter(fullContent: string, isCurrentlyStreaming: boolean): string {
  // Story 2.6: Initialize displayedLength based on streaming state
  // If message is not streaming, start at full length to avoid replaying animation
  const [displayedLength, setDisplayedLength] = useState(() => 
    isCurrentlyStreaming ? 0 : fullContent.length
  );
  const { setIsTypewriterActive } = useChatStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullContentRef = useRef(fullContent);

  // Update ref on each render to avoid stale closure
  fullContentRef.current = fullContent;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Reset typewriter active state on unmount
      if (isCurrentlyStreaming) {
        setIsTypewriterActive(false);
      }
    };
  }, [isCurrentlyStreaming, setIsTypewriterActive]);

  // Story 2.6: Typewriter effect with catch-up logic (AC: 9)
  useEffect(() => {
    // If displayed length is already at full content, nothing to do
    if (displayedLength >= fullContent.length) {
      setIsTypewriterActive(false);
      return;
    }

    // Only jump to end if we are NOT currently streaming AND we haven't even started typing
    // This handles the case where we mount a message that finished long ago
    if (!isCurrentlyStreaming && displayedLength === 0) {
      setDisplayedLength(fullContent.length);
      return;
    }

    // Mark typewriter as active
    setIsTypewriterActive(true);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Story 2.6: Dynamic typing speed based on lag (AC: 9)
    // If we're far behind (e.g. catch-up), type faster. Otherwise type 1 char at a time.
    const lag = fullContent.length - displayedLength;
    const charsToType = lag > 50 ? Math.ceil(lag / 5) : 1; 

    // Schedule next character(s)
    timerRef.current = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(prev + charsToType, fullContentRef.current.length));
    }, TYPE_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [displayedLength, fullContent.length, isCurrentlyStreaming, setIsTypewriterActive]);

  return fullContent.slice(0, displayedLength);
}

/**
 * Story 2.6: Typewriter bubble wrapper for streaming assistant messages (AC: 9)
 * Displays content with typewriter animation that catches up when page is revisited
 */
type TypewriterBubbleProps = {
  message: Message;
  isCurrentlyStreaming: boolean;
};

function TypewriterBubble({ message, isCurrentlyStreaming }: TypewriterBubbleProps) {
  // If message has fullContent, use typewriter effect; otherwise use content directly
  const fullContent = message.fullContent ?? message.content;
  const displayedContent = useTypewriter(fullContent, isCurrentlyStreaming);

  // For assistant messages, split by \n\n and filter to visible content only
  const rawSegments = displayedContent.split(/\n\n+/).filter((s) => s.trim());
  const segments = filterVisibleSegments(rawSegments);

  // If no visible segments, don't render anything
  if (segments.length === 0) {
    return null;
  }

  // If only one segment, render single bubble
  if (segments.length === 1) {
    return (
      <SingleBubble
        content={segments[0]}
        isUser={false}
        showAvatar={true}
        bubbleId={message.id}
      />
    );
  }

  // Render multiple bubbles for split content
  return (
    <div className="flex flex-col gap-2">
      {segments.map((segment, index) => (
        <SingleBubble
          key={`${message.id}-${index}`}
          content={segment}
          isUser={false}
          showAvatar={index === 0}
          bubbleId={`${message.id}-${index}`}
        />
      ))}
    </div>
  );
}

/**
 * Message bubble component with role-specific styling
 * For assistant messages, splits content by \n\n into multiple bubbles
 * Only the first bubble shows the avatar
 * Story 2.6: Uses TypewriterBubble for streaming assistant messages (AC: 8, 9)
 */
type MessageBubbleProps = {
  message: Message;
  streamingMessageId: string | null;
};

function MessageBubble({ message, streamingMessageId }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isCurrentlyStreaming = message.id === streamingMessageId;

  // For user messages, render single bubble (skip if no visible content)
  if (isUser) {
    if (!hasVisibleContent(message.content)) {
      return null;
    }
    return (
      <SingleBubble
        content={message.content}
        isUser={true}
        showAvatar={false}
        bubbleId={message.id}
      />
    );
  }

  // Story 2.6: Use TypewriterBubble for assistant messages with fullContent (AC: 8, 9)
  // This handles both active streaming and catch-up when returning to the page
  if (message.fullContent !== undefined) {
    return (
      <TypewriterBubble
        message={message}
        isCurrentlyStreaming={isCurrentlyStreaming}
      />
    );
  }

  // Fallback for messages without fullContent (legacy messages)
  const rawSegments = message.content.split(/\n\n+/).filter((s) => s.trim());
  const segments = filterVisibleSegments(rawSegments);

  // If no visible segments, don't render anything
  if (segments.length === 0) {
    return null;
  }

  // If only one segment, render single bubble
  if (segments.length === 1) {
    return (
      <SingleBubble
        content={segments[0]}
        isUser={false}
        showAvatar={true}
        bubbleId={message.id}
      />
    );
  }

  // Render multiple bubbles for split content
  return (
    <div className="flex flex-col gap-2">
      {segments.map((segment, index) => (
        <SingleBubble
          key={`${message.id}-${index}`}
          content={segment}
          isUser={false}
          showAvatar={index === 0}
          bubbleId={`${message.id}-${index}`}
        />
      ))}
    </div>
  );
}

/**
 * Main chat interface component
 * Renders the message list with animations and auto-scroll
 */
type ChatInterfaceProps = {
  /**
   * standalone: includes background gradient and expects to fill parent height
   * embedded: only renders the scrollable message list (no background)
   */
  mode?: "standalone" | "embedded";
  /**
   * Optional content rendered after the message list (inside scroll container),
   * e.g. state-driven option buttons.
   */
  afterMessages?: ReactNode;
  /**
   * Extra dependency to trigger auto-scroll (e.g. currentState.step)
   */
  scrollKey?: unknown;
};

export function ChatInterface({
  mode = "standalone",
  afterMessages,
  scrollKey
}: ChatInterfaceProps) {
  // Story 2.6: Added streamingMessageId for typewriter tracking (AC: 8, 9)
  const { messages, isTyping, streamingMessageId } = useChatStore();
  const isHydrated = useChatStoreHydrated(); // Story 2.5: Hydration safety (AC: 8)
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Get the last message content to trigger scroll on typewriter updates
  // Story 2.6: Also track fullContent for streaming messages
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = lastMessage?.fullContent ?? lastMessage?.content ?? "";

  // Auto-scroll to bottom when messages change or content updates (typewriter effect)
  // Story 2.6: Also trigger on hydration finish to ensure initial scroll to bottom (AC: 12)
  useEffect(() => {
    if (isHydrated) {
      const scrollToBottom = () => {
        bottomAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      };

      // Initial scroll
      scrollToBottom();

      // Multiple attempts to handle dynamic layout/images
      const timers = [
        setTimeout(scrollToBottom, 50),
        setTimeout(scrollToBottom, 150),
        setTimeout(scrollToBottom, 300)
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [messages.length, lastMessageContent, isTyping, scrollKey, isHydrated]);

  const containerClassName =
    mode === "standalone"
      ? "flex flex-col h-full bg-gradient-to-br from-[#FFF5F7] to-[#FAF5FF]"
      : "flex flex-col flex-1";

  // Story 2.5: Render empty container until hydration completes to prevent
  // hydration mismatch between server (empty state) and client (restored state) (AC: 8)
  if (!isHydrated) {
    return (
      <div data-testid="chat-container" className={containerClassName}>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" />
      </div>
    );
  }

  return (
    <div
      data-testid="chat-container"
      className={containerClassName}
    >
      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              streamingMessageId={streamingMessageId}
            />
          ))}
          {isTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>
        {afterMessages}
        {/* Bottom anchor for scrolling */}
        <div ref={bottomAnchorRef} className="h-px w-full" />
      </div>
    </div>
  );
}

