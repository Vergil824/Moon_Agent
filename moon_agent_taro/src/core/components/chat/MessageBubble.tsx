import { View } from '@tarojs/components';
import { useEffect, useRef, useState } from 'react';
import { BotAvatar } from './BotAvatar';
import { MarkdownText } from './MarkdownText';
import { hasVisibleContent, filterVisibleSegments } from './contentUtils';
import { useChatStore } from '../../stores';
import type { Message } from './types';

// Story 2.6: Typewriter timing constants (aligned with moon-agent)
const NORMAL_DELAY_MS = 60; // Normal pace tick 40–80ms
const CATCHUP_DELAY_MS = 20; // Faster tick during catch-up
const PUNCTUATION_PAUSE_MS = 120; // Short pause at punctuation
const NORMAL_STEP = 2; // 1–2 chars per tick for normal streaming
const MIN_CATCHUP_STEP = 6; // Prevents micro-steps during catch-up
const MAX_CATCHUP_STEP = 80; // Bound single jump to avoid instant flush
const CATCHUP_THRESHOLD = 350; // Switch back to normal when lag <= ~200–400
const SENTENCE_BOUNDARY = /[。！？!?；;，,、\n]/;

/**
 * Story 2.6: Typewriter hook for streaming messages (aligned with moon-agent)
 * Handles catch-up animation when returning to chat page during streaming
 *
 * IMPORTANT: This hook distinguishes between:
 * 1. New messages (created in this session) - always use typewriter effect
 * 2. Restored messages (from persistence) - skip to end immediately
 *
 * The key insight is that when a component mounts for a restored message,
 * the fullContent is already populated and streaming is done. But for new
 * messages, fullContent starts empty and grows during streaming.
 *
 * Task 3: Now returns { displayedContent, isActive } to support send gating
 *
 * @param fullContent - The complete content received from streaming
 * @param isCurrentlyStreaming - Whether this specific message is still being streamed
 * @returns Object with displayedContent and isActive flag
 */
function useTypewriter(
  fullContent: string,
  isCurrentlyStreaming: boolean
): { displayedContent: string; isActive: boolean } {
  // Track whether the typewriter has started working (has content to display)
  // This distinguishes between:
  // - New messages where fullContent grows from '' → should always typewrite
  // - Restored messages where fullContent is already populated → should skip
  const hasStartedRef = useRef(false);
  const initialFullContentLengthRef = useRef(fullContent.length);

  // Initialize displayedLength based on streaming state and initial content
  // If component mounts with non-empty fullContent and NOT streaming,
  // it's a restored message - start at full length
  const [displayedLength, setDisplayedLength] = useState(() => {
    // If streaming right now, always start from 0
    if (isCurrentlyStreaming) return 0;
    // If fullContent is empty, start from 0 (waiting for content)
    if (fullContent.length === 0) return 0;
    // If mounting with non-empty content and not streaming, it's a restored message
    // Skip to end immediately
    return fullContent.length;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullContentRef = useRef(fullContent);

  // Update ref on each render to avoid stale closure
  fullContentRef.current = fullContent;

  // Track when typewriter starts working
  useEffect(() => {
    // If content grew from initial state, mark as started
    if (fullContent.length > initialFullContentLengthRef.current) {
      hasStartedRef.current = true;
    }
    // Also mark as started if we have content and are streaming
    if (isCurrentlyStreaming && fullContent.length > 0) {
      hasStartedRef.current = true;
    }
  }, [fullContent.length, isCurrentlyStreaming]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Typewriter effect with catch-up logic
  useEffect(() => {
    // If displayed length is already at full content, nothing to do
    if (displayedLength >= fullContent.length) {
      return;
    }

    // Skip-to-end logic: Only skip if ALL conditions are met:
    // 1. Not currently streaming
    // 2. Haven't started typing yet (displayedLength === 0)
    // 3. Typewriter hasn't been triggered (hasStartedRef.current === false)
    // This ensures that fast-arriving data still gets typewriter effect
    if (
      !isCurrentlyStreaming &&
      displayedLength === 0 &&
      !hasStartedRef.current
    ) {
      setDisplayedLength(fullContent.length);
      return;
    }

    // Mark as started since we're about to start the typewriter
    hasStartedRef.current = true;

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const lag = fullContentRef.current.length - displayedLength;
    const isCatchUp = lag > CATCHUP_THRESHOLD;

    const scheduleNext = () => {
      const content = fullContentRef.current;
      const remaining = content.length - displayedLength;

      // Normal streaming: small steps, keep rhythm and punctuation pauses
      if (!isCatchUp) {
        const step = Math.min(NORMAL_STEP, remaining);
        const nextLength = displayedLength + step;
        const nextChar = content.charAt(nextLength - 1);
        const pause =
          nextChar && SENTENCE_BOUNDARY.test(nextChar)
            ? PUNCTUATION_PAUSE_MS
            : 0;

        timerRef.current = setTimeout(() => {
          setDisplayedLength(nextLength);
        }, NORMAL_DELAY_MS + pause);
        return;
      }

      // Catch-up mode: bounded jumps with sentence/segment awareness
      const window = content.slice(
        displayedLength,
        displayedLength + MAX_CATCHUP_STEP
      );
      const boundaryIndex = window.search(SENTENCE_BOUNDARY);
      const boundaryStep =
        boundaryIndex >= 0 ? boundaryIndex + 1 : window.length;
      const step = Math.min(
        remaining,
        Math.max(MIN_CATCHUP_STEP, boundaryStep)
      );
      const nextLength = displayedLength + step;

      timerRef.current = setTimeout(() => {
        setDisplayedLength(nextLength);
      }, CATCHUP_DELAY_MS);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [displayedLength, fullContent.length, isCurrentlyStreaming]);

  // Task 3: Calculate if typewriter is actively animating
  // Active means: has content, hasn't finished displaying, and has started
  const isActive =
    hasStartedRef.current &&
    fullContent.length > 0 &&
    displayedLength < fullContent.length;

  return {
    displayedContent: fullContent.slice(0, displayedLength),
    isActive,
  };
}

/**
 * Single bubble component - renders one bubble with optional avatar
 * Aligned with moon-agent/components/chat/ChatInterface.tsx SingleBubble
 *
 * Uses MarkdownText for markdown rendering (AC: 1 - supports markdown format)
 */
interface SingleBubbleProps {
  content: string;
  isUser: boolean;
  showAvatar: boolean;
}

function SingleBubble({ content, isUser, showAvatar }: SingleBubbleProps) {
  return (
    <View
      className={`flex items-start gap-2 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Bot avatar - only for assistant messages, first bubble only */}
      {!isUser && showAvatar && <BotAvatar />}
      {/* Spacer to align subsequent bubbles without avatar */}
      {!isUser && !showAvatar && <View className='shrink-0 w-8 h-8' />}

      {/* Message bubble with markdown support */}
      <View
        className={`max-w-[80%] px-4 py-3 shadow-md leading-relaxed ${
          isUser
            ? 'bg-violet-500 text-white rounded-tl-3xl rounded-tr-[6px] rounded-br-3xl rounded-bl-3xl'
            : 'bg-white text-gray-800 rounded-tl-[6px] rounded-tr-3xl rounded-br-3xl rounded-bl-3xl'
        }`}
      >
        <MarkdownText content={content} isUser={isUser} />
      </View>
    </View>
  );
}

/**
 * Message bubble component with role-specific styling
 * For assistant messages, splits content by \n\n into multiple bubbles
 * Only the first bubble shows the avatar
 */
interface MessageBubbleProps {
  message: Message;
  /** ID of currently streaming message (for typewriter effect) */
  streamingMessageId?: string | null;
}

/**
 * Story 2.6: Typewriter bubble wrapper for streaming assistant messages
 * Displays content with typewriter animation that catches up when page is revisited
 *
 * Task 3: Now updates store's isTypewriterActive for send gating
 */
function TypewriterBubble({
  message,
  isCurrentlyStreaming,
}: {
  message: Message;
  isCurrentlyStreaming: boolean;
}) {
  // Task 3: Get store setter for typewriter active state
  const setIsTypewriterActive = useChatStore((s) => s.setIsTypewriterActive);

  // If message has fullContent, use typewriter effect; otherwise use content directly
  const fullContent = message.fullContent ?? message.content;
  const { displayedContent, isActive } = useTypewriter(
    fullContent,
    isCurrentlyStreaming
  );

  // Task 3: Update store when typewriter active state changes
  // Only affects send gating for messages that were actively streamed (not restored)
  useEffect(() => {
    // Only set active if this message was being streamed (not restored from persistence)
    // The isActive flag from useTypewriter already handles the restored message case
    setIsTypewriterActive(isActive);

    // Cleanup: when this component unmounts, clear the active state
    return () => {
      setIsTypewriterActive(false);
    };
  }, [isActive, setIsTypewriterActive]);

  // For assistant messages, split by \n\n and filter to visible content only
  const rawSegments = displayedContent.split(/\n\n+/).filter((s) => s.trim());
  const segments = filterVisibleSegments(rawSegments);

  // If no visible segments, don't render anything
  if (segments.length === 0) {
    return null;
  }

  // If only one segment, render single bubble
  if (segments.length === 1) {
    return <SingleBubble content={segments[0]} isUser={false} showAvatar />;
  }

  // Render multiple bubbles for split content
  return (
    <View className='flex flex-col gap-2'>
      {segments.map((segment, index) => (
        <SingleBubble
          key={`${message.id}-${index}`}
          content={segment}
          isUser={false}
          showAvatar={index === 0}
        />
      ))}
    </View>
  );
}

export function MessageBubble({
  message,
  streamingMessageId,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isCurrentlyStreaming = message.id === streamingMessageId;

  // For user messages, render single bubble (skip if no visible content)
  if (isUser) {
    if (!hasVisibleContent(message.content)) {
      return null;
    }
    return <SingleBubble content={message.content} isUser showAvatar={false} />;
  }

  // Story 2.6: Use TypewriterBubble for assistant messages with fullContent
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
    return <SingleBubble content={segments[0]} isUser={false} showAvatar />;
  }

  // Render multiple bubbles for split content
  return (
    <View className='flex flex-col gap-2'>
      {segments.map((segment, index) => (
        <SingleBubble
          key={`${message.id}-${index}`}
          content={segment}
          isUser={false}
          showAvatar={index === 0}
        />
      ))}
    </View>
  );
}
