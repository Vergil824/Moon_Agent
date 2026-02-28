import { useState, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import type { BaseEventOrig } from '@tarojs/components';
import type { ScrollViewProps } from '@tarojs/components/types/ScrollView';
import {
  MessageBubble,
  TypingIndicator,
  ChatInput,
  ErrorState,
  DegradedHint,
  StreamingIndicator,
  NewMessageHint,
  getStateComponent,
  ProductRecommendation,
} from '../../core/components/chat';
import { useChatStore } from '../../core/stores';
import { BottomNav } from '../../core/components/layout';
import {
  createH5StreamClient,
  createWeappChunkedClient,
  type StreamConnection,
  type StreamError,
  type WeappStreamConnection,
  type WeappStreamError,
} from '../../core/chat';

// Scroll detection constants (AC: 4)
const SCROLL_BOTTOM_THRESHOLD = 100; // pixels from bottom to consider "at bottom"

/**
 * Chat page - AI chat feature
 * Migrated to use useChatStore for global state management (AC: 6, 7)
 *
 * Features:
 * - Message list with auto-scroll (AC: 3)
 * - Scroll pause and "new messages" hint (AC: 4)
 * - Typing/streaming indicators (AC: 3)
 * - State panel for step-driven components
 * - Input area with send functionality
 * - Tab switching preserves state (AC: 6)
 * - Return to page catches up (AC: 7)
 *
 * Tab Switching Behavior (Task 20):
 * WeChat Mini Program tabBar pages are CACHED (not unmounted) when switching tabs.
 * This means:
 * - streamConnectionRef persists across tab switches
 * - Store state (messages, streaming flags) is global and persists
 * - useEffect cleanup ONLY runs when page is truly destroyed (rare, e.g., memory pressure)
 * - useDidShow is called when returning, triggering scroll catch-up
 * - Streaming continues in background during tab switches
 */
export default function Chat() {
  // All chat state from global store (AC: 6, 7)
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isTypewriterActive = useChatStore((s) => s.isTypewriterActive);
  const streamingError = useChatStore((s) => s.streamingError);
  const currentState = useChatStore((s) => s.currentState);
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const isFollowingBottom = useChatStore((s) => s.isFollowingBottom);
  const hasUnreadMessages = useChatStore((s) => s.hasUnreadMessages);
  // Task 21: Pinned recommendation state
  const isPinnedRecommendation = useChatStore((s) => s.isPinnedRecommendation);
  const recommendedProducts = useChatStore((s) => s.recommendedProducts);

  // Task 1: Unified send gating - blocks send during typing, streaming, AND typewriter animation
  // This ensures only one "in-flight" message at a time (including typewriter phase)
  const isReplying = isTyping || isStreaming || isTypewriterActive;

  // Store actions
  const addMessage = useChatStore((s) => s.addMessage);
  const setCurrentState = useChatStore((s) => s.setCurrentState);
  const setStreamingError = useChatStore((s) => s.setStreamingError);
  const clearStreamingError = useChatStore((s) => s.clearStreamingError);
  const setFollowingBottom = useChatStore((s) => s.setFollowingBottom);
  const setHasUnreadMessages = useChatStore((s) => s.setHasUnreadMessages);
  const scrollToBottomAndRead = useChatStore((s) => s.scrollToBottomAndRead);
  const startStreaming = useChatStore((s) => s.startStreaming);
  const appendStreamingContent = useChatStore((s) => s.appendStreamingContent);
  const finalizeStreaming = useChatStore((s) => s.finalizeStreaming);
  const setIsTypewriterActive = useChatStore((s) => s.setIsTypewriterActive);
  const sessionId = useChatStore((s) => s.sessionId);
  const setSessionId = useChatStore((s) => s.setSessionId);

  // Local UI state (not persisted across tab switches)
  const [isDegraded, setIsDegraded] = useState(false);
  const [scrollIntoView, setScrollIntoView] = useState('');
  // Use scrollTop for manual scroll to bottom (more reliable than scrollIntoView)
  const [scrollTop, setScrollTop] = useState(0);

  // Scroll timing refs for multi-attempt scroll (aligned with moon-agent)
  const scrollTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Ref for scroll container height (for calculating distance from bottom)
  const scrollHeightRef = useRef(0);
  const clientHeightRef = useRef(0);
  // Track if initial load done and if auto-greeting has been sent
  const initialLoadDoneRef = useRef(false);
  const autoGreetingSentRef = useRef(false);

  // Stream client and connection refs (platform-specific)
  const h5StreamClientRef = useRef(createH5StreamClient());
  const weappStreamClientRef = useRef(createWeappChunkedClient());
  const streamConnectionRef = useRef<
    StreamConnection | WeappStreamConnection | null
  >(null);

  /**
   * Initialize chat - if no messages, auto-send greeting to backend
   */
  useLoad(() => {
    console.log('Chat page loaded.');
    initialLoadDoneRef.current = true;
  });

  /**
   * Handle page show (return from other tabs) - AC: 7, Task 20
   * Resume scroll following and catch up display
   *
   * Task 20: When returning from tab switch during streaming/typewriter:
   * - Stream connection continues in background (page is cached, not unmounted)
   * - Store state (messages, fullContent) has been updated during absence
   * - This hook ensures UI catches up by scrolling to latest content
   */
  useDidShow(() => {
    Taro.hideTabBar({ animation: false });
    if (initialLoadDoneRef.current) {
      console.log(
        'Chat page shown (returned from tab switch)',
        'isStreaming:', isStreaming,
        'isTypewriterActive:', isTypewriterActive
      );
      // When returning, scroll to see latest content
      // Task 20: Especially important when returning during streaming/typewriter
      if (isFollowingBottom) {
        scrollToBottom();
      }
    }
  });

  /**
   * Multi-attempt scroll to bottom (aligned with moon-agent)
   * Helps handle dynamic layout, image loading, etc.
   * Only scrolls if isFollowingBottom is true (AC: 3, 4)
   */
  const scrollToBottom = useCallback(() => {
    // Only scroll if following bottom (AC: 4)
    if (!isFollowingBottom) return;

    // Clear existing timers
    scrollTimersRef.current.forEach(clearTimeout);
    scrollTimersRef.current = [];

    const doScroll = () => {
      // Must clear first, then set to trigger scroll
      // Otherwise same value won't trigger new scroll in WeChat
      setScrollIntoView('');
      // Use setTimeout to ensure clear happens before set
      setTimeout(() => {
        setScrollIntoView('bottom-anchor');
      }, 10);
    };

    // Initial scroll
    doScroll();

    // Multiple attempts: 50ms, 150ms, 300ms (with extra buffer for the clear/set cycle)
    const delays = [100, 200, 400];
    delays.forEach((delay) => {
      const timer = setTimeout(doScroll, delay);
      scrollTimersRef.current.push(timer);
    });
  }, [isFollowingBottom]);

  /**
   * Generate or get session ID
   */
  const getOrCreateSessionId = useCallback(() => {
    if (sessionId) return sessionId;
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setSessionId(newSessionId);
    return newSessionId;
  }, [sessionId, setSessionId]);

  /**
   * Handle scroll event to detect user scrolling away from bottom (AC: 4)
   */
  const handleScroll = useCallback(
    (e: BaseEventOrig<ScrollViewProps.onScrollDetail>) => {
      const { scrollTop, scrollHeight } = e.detail;
      // Store scrollHeight for calculations
      scrollHeightRef.current = scrollHeight;

      // Calculate distance from bottom
      // Note: In Taro, we need to estimate clientHeight or use a fixed value
      // For now, use the last known height from the container
      const distanceFromBottom =
        scrollHeight - scrollTop - clientHeightRef.current;

      if (distanceFromBottom > SCROLL_BOTTOM_THRESHOLD) {
        // User has scrolled up - stop following bottom
        if (isFollowingBottom) {
          setFollowingBottom(false);
        }
      } else {
        // User is at bottom - resume following
        if (!isFollowingBottom) {
          setFollowingBottom(true);
        }
      }
    },
    [isFollowingBottom, setFollowingBottom]
  );

  /**
   * Handle click on "New Messages" hint (AC: 4)
   * Uses scrollTop instead of scrollIntoView for more reliable scroll-to-bottom behavior
   */
  const handleNewMessageClick = useCallback(() => {
    scrollToBottomAndRead();
    // Clear scrollIntoView to avoid conflicts with scrollTop
    setScrollIntoView('');

    // Trigger actual scroll using scrollTop
    // Set to a very large value to ensure we scroll to the absolute bottom
    // The ScrollView will clamp this to its maximum scrollable height
    scrollTimersRef.current.forEach(clearTimeout);
    scrollTimersRef.current = [];

    const doScrollToBottom = () => {
      // Use scrollHeightRef which is updated on every scroll event
      // Add extra buffer to ensure we reach the bottom
      const targetScrollTop =
        scrollHeightRef.current > 0 ? scrollHeightRef.current + 10000 : 999999;
      setScrollTop(targetScrollTop);
    };

    doScrollToBottom();
    // Multiple attempts for reliable scroll
    const delays = [50, 150, 300];
    delays.forEach((delay) => {
      const timer = setTimeout(doScrollToBottom, delay);
      scrollTimersRef.current.push(timer);
    });
  }, [scrollToBottomAndRead]);

  /**
   * Send message via streaming API
   * Used by both handleStateSelect and handleSend
   * Supports both H5 (SSE) and WeApp (chunked) platforms
   */
  const sendMessageToApi = useCallback(
    (content: string) => {
      // Clear any existing error
      clearStreamingError();
      // Clear current state
      setCurrentState(null);

      // Check platform and get appropriate client
      const env = Taro.getEnv();
      const isH5 = env === Taro.ENV_TYPE.WEB;
      const isWeapp = env === Taro.ENV_TYPE.WEAPP;

      // Validate platform support
      if (!isH5 && !isWeapp) {
        setIsDegraded(true);
        setStreamingError({
          code: 'PLATFORM_NOT_SUPPORTED',
          message: '当前平台暂不支持流式聊天',
          recoverable: false,
        });
        return;
      }

      // Check streaming support based on platform
      if (isH5 && !h5StreamClientRef.current.isStreamingSupported()) {
        setStreamingError({
          code: 'STREAMING_NOT_SUPPORTED',
          message: '当前浏览器不支持流式聊天',
          recoverable: false,
        });
        return;
      }

      if (isWeapp && !weappStreamClientRef.current.isStreamingSupported()) {
        setStreamingError({
          code: 'STREAMING_NOT_SUPPORTED',
          message: '当前微信版本不支持流式聊天',
          recoverable: false,
        });
        return;
      }

      // Add user message
      addMessage({
        role: 'user',
        content,
      });

      // Start streaming - creates placeholder assistant message
      startStreaming();

      // Get or create session ID
      const currentSessionId = getOrCreateSessionId();

      // Generate message ID
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // Build request
      const request = {
        sessionId: currentSessionId,
        messageId,
        text: content,
        metadata: {
          platform: isH5 ? ('h5' as const) : ('weapp' as const),
          timestamp: Date.now(),
        },
      };

      // Common event handlers
      const handlers = {
        onPartial: (delta: string, state?: Record<string, unknown> | null) => {
          // Append streaming content
          if (delta) {
            appendStreamingContent(delta);
          }
          // Update state if received
          if (state) {
            setCurrentState(state);
          }
        },
        onEnd: () => {
          // Finalize streaming
          finalizeStreaming();
          streamConnectionRef.current = null;
        },
        onError: (error: StreamError | WeappStreamError) => {
          // Set error state
          setStreamingError({
            code: error.code,
            message: error.message,
            recoverable: error.recoverable,
          });
          streamConnectionRef.current = null;
        },
      };

      // Send streaming request using appropriate client
      let connection: StreamConnection | WeappStreamConnection;
      if (isH5) {
        connection = h5StreamClientRef.current.sendMessage(request, handlers);
      } else {
        connection = weappStreamClientRef.current.sendMessage(
          request,
          handlers
        );
      }

      // Save connection for potential abort
      streamConnectionRef.current = connection;
    },
    [
      addMessage,
      appendStreamingContent,
      clearStreamingError,
      finalizeStreaming,
      getOrCreateSessionId,
      setCurrentState,
      setStreamingError,
      startStreaming,
    ]
  );

  /**
   * Handle state panel selection
   */
  const handleStateSelect = useCallback(
    (value: string) => {
      sendMessageToApi(value);
    },
    [sendMessageToApi]
  );

  /**
   * Handle retry after error - resend the last user message
   */
  const handleRetry = useCallback(() => {
    // Find the last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMessage) {
      sendMessageToApi(lastUserMessage.content);
    } else {
      clearStreamingError();
    }
  }, [messages, sendMessageToApi, clearStreamingError]);

  /**
   * Handle sending a new message from input
   */
  const handleSend = useCallback(
    (content: string) => {
      sendMessageToApi(content);
    },
    [sendMessageToApi]
  );

  /**
   * Handle stop button - abort current streaming (AC: 7)
   * Clears ALL gating states to allow immediate re-send
   */
  const handleStop = useCallback(() => {
    // Abort the stream connection
    if (streamConnectionRef.current) {
      streamConnectionRef.current.abort();
      streamConnectionRef.current = null;
    }

    // Finalize any partial content that was received
    finalizeStreaming();

    // Task 2: Clear typewriter active state for immediate re-send (AC: 7)
    // This ensures user can send new message right after Stop
    setIsTypewriterActive(false);
  }, [finalizeStreaming, setIsTypewriterActive]);

  /**
   * Auto-send greeting when first entering chat (no history)
   * This triggers the backend to send a welcome message
   */
  useEffect(() => {
    // Only trigger once on initial load
    if (!initialLoadDoneRef.current || autoGreetingSentRef.current) {
      return;
    }

    // If no messages exist, auto-send "你好" to trigger backend greeting
    if (messages.length === 0 && !isTyping && !isStreaming) {
      autoGreetingSentRef.current = true;
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        sendMessageToApi('你好');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isTyping, isStreaming, sendMessageToApi]);

  // Task 4: Get last message content for scroll trigger (aligned with moon-agent)
  // This ensures scroll is triggered when streaming content grows
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent =
    lastMessage?.fullContent ?? lastMessage?.content ?? '';

  /**
   * Auto-scroll to bottom when messages change or content grows (AC: 3, 4)
   * Task 4: Now depends on lastMessageContent to scroll during streaming/typewriter
   * Only scrolls if following bottom (AC: 4)
   */
  useEffect(() => {
    if (isFollowingBottom) {
      scrollToBottom();
    } else if (messages.length > 0) {
      // New message or content growth while not following - show hint (AC: 4)
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'assistant') {
        setHasUnreadMessages(true);
      }
    }
  }, [
    messages.length,
    lastMessageContent, // Task 4: Key dependency for streaming content scroll
    isTyping,
    currentState,
    isFollowingBottom,
    messages,
    scrollToBottom,
    setHasUnreadMessages,
  ]);

  // Cleanup on unmount
  // Task 20: In WeChat Mini Program, tabBar pages are CACHED and this cleanup
  // ONLY runs when the page is truly destroyed (rare, e.g., memory pressure).
  // Normal tab switches do NOT trigger this cleanup, so streaming continues.
  useEffect(() => {
    return () => {
      console.log('Chat page unmounting (rare in tabBar context)');
      scrollTimersRef.current.forEach(clearTimeout);
      // Abort any active stream - only happens on true unmount
      if (streamConnectionRef.current) {
        streamConnectionRef.current.abort();
        streamConnectionRef.current = null;
      }
    };
  }, []);

  // Get state component to render
  const StateComponent = getStateComponent(currentState);

  return (
    <View className='flex flex-col h-screen bg-linear-to-b from-moon-page-from to-moon-page-to'>
      {/* Degraded mode hint */}
      {isDegraded && <DegradedHint />}

      {/* Streaming indicator */}
      {isStreaming && <StreamingIndicator />}

      {/* Message list */}
      <ScrollView
        className='flex-1 overflow-y-auto pb-[200px]'
        scrollY
        scrollIntoView={scrollIntoView}
        scrollTop={scrollTop}
        scrollWithAnimation
        enhanced
        showScrollbar={false}
        onScroll={handleScroll}
      >
        <View className='px-4 py-4 flex flex-col gap-4'>
          {/* Messages */}
          {messages.map((message) => (
            <View key={message.id} id={`msg-${message.id}`}>
              <MessageBubble
                message={message}
                streamingMessageId={streamingMessageId}
              />
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View id='typing-indicator'>
              <TypingIndicator />
            </View>
          )}

          {/* Error state */}
          {streamingError && (
            <View id='error-state'>
              <ErrorState
                message={streamingError.message}
                onRetry={handleRetry}
              />
            </View>
          )}

          {/* State panel (afterMessages) */}
          {/* 
            Show state component based on current step:
            - summary: LoadingAnalysis should show immediately (even during streaming)
            - recommendation/recommendations: ProductRecommendation should show immediately
            - Other interactive steps: Show only when not typing and not streaming
          */}
          {StateComponent &&
            !isTyping &&
            (() => {
              const step = (currentState as Record<string, unknown> | null)
                ?.step;
              // These steps should show immediately (even during streaming)
              const showDuringStreaming =
                step === 'summary' ||
                step === 'recommendation' ||
                step === 'recommendations' ||
                // Defensive alias: some backends may emit component-like step names
                step === 'ProductRecommendation';
              // For other steps, wait until streaming is done
              if (!showDuringStreaming && isStreaming) return false;
              return true;
            })() && (
              <View id='state-panel' className='mt-2'>
                <StateComponent
                  onSelect={handleStateSelect}
                  payload={currentState || undefined}
                />
              </View>
            )}

          {/* Task 21: Pinned ProductRecommendation - persists even when currentState clears */}
          {/* Only show when:
              1. isPinnedRecommendation is true
              2. recommendedProducts has data
              3. StateComponent is NOT already showing ProductRecommendation (avoid duplication)
          */}
          {isPinnedRecommendation &&
            recommendedProducts.length > 0 &&
            !isTyping &&
            (() => {
              const step = (currentState as Record<string, unknown> | null)
                ?.step;
              // Don't duplicate if StateComponent is already showing recommendation
              const isAlreadyShowingRecommendation =
                step === 'recommendation' ||
                step === 'recommendations' ||
                step === 'ProductRecommendation';
              return !isAlreadyShowingRecommendation;
            })() && (
              <View id='pinned-recommendation' className='mt-2'>
                <ProductRecommendation
                  onSelect={handleStateSelect}
                  payload={{ step: 'recommendation', products: recommendedProducts }}
                />
              </View>
            )}

          {/* Bottom anchor for scrolling */}
          <View className='h-[2px] w-full' id='bottom-anchor' />
        </View>
      </ScrollView>

      {/* New message hint (AC: 4) */}
      <NewMessageHint
        visible={hasUnreadMessages && !isFollowingBottom}
        onClick={handleNewMessageClick}
      />

      {/* Input area */}
      {/* Task 1: Use unified isReplying for send gating (includes typewriter phase) */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isReplying={isReplying}
        disabled={isReplying}
      />

      {/* Custom bottom navigation */}
      <BottomNav activeTab='chat' />
    </View>
  );
}
