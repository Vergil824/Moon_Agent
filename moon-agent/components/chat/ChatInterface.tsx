"use client";

import type { ReactNode } from "react";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useChatStore, Message } from "@/lib/store";
import { hasVisibleContent, filterVisibleSegments } from "@/lib/contentUtils";

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
 * Message bubble component with role-specific styling
 * For assistant messages, splits content by \n\n into multiple bubbles
 * Only the first bubble shows the avatar
 */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

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

  // For assistant messages, split by \n\n and filter to visible content only
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
  const { messages, isTyping } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get the last message content to trigger scroll on typewriter updates
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = lastMessage?.content ?? "";

  // Auto-scroll to bottom when messages change or content updates (typewriter effect)
  useEffect(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages.length, lastMessageContent, isTyping, scrollKey]);

  const containerClassName =
    mode === "standalone"
      ? "flex flex-col h-full bg-gradient-to-br from-[#FFF5F7] to-[#FAF5FF]"
      : "flex flex-col flex-1";

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
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>
        {afterMessages}
      </div>
    </div>
  );
}

