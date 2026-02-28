/**
 * useChat Hook
 *
 * React hook for chat functionality with streaming support.
 * Automatically selects the appropriate client based on platform.
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import {
  createH5StreamClient,
  type StreamEventHandlers,
  type StreamError,
  type H5StreamClientConfig,
} from './h5StreamClient';
import { type ChatRequest, ChatErrorCodes } from './protocol';

// ============================================================================
// Types
// ============================================================================

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  state?: Record<string, unknown> | null;
  status: 'pending' | 'streaming' | 'complete' | 'error';
  error?: StreamError;
  timestamp: number;
}

/**
 * useChat hook options
 */
export interface UseChatOptions {
  /** Initial messages */
  initialMessages?: ChatMessage[];
  /** Session ID (required) */
  sessionId: string;
  /** Client configuration */
  clientConfig?: H5StreamClientConfig;
  /** Callback when message starts streaming */
  onStreamStart?: (messageId: string) => void;
  /** Callback when partial content is received */
  onPartial?: (messageId: string, content: string, state?: Record<string, unknown> | null) => void;
  /** Callback when message completes */
  onComplete?: (messageId: string) => void;
  /** Callback when error occurs */
  onError?: (messageId: string, error: StreamError) => void;
}

/**
 * useChat hook return type
 */
export interface UseChatReturn {
  /** All messages in the conversation */
  messages: ChatMessage[];
  /** Whether a message is currently being streamed */
  isStreaming: boolean;
  /** Current error if any */
  error: StreamError | null;
  /** Send a new message */
  sendMessage: (text: string) => void;
  /** Abort current streaming */
  abort: () => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Whether streaming is supported on current platform */
  isStreamingSupported: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Generate unique message ID
 */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * useChat hook for chat functionality
 *
 * @param options - Hook options
 * @returns Chat state and actions
 *
 * @example
 * ```tsx
 * const { messages, isStreaming, sendMessage, abort } = useChat({
 *   sessionId: 'user-session-123',
 *   onComplete: (id) => console.log('Message complete:', id),
 * });
 *
 * // Send a message
 * sendMessage('你好，我想咨询内衣尺码');
 *
 * // Abort streaming
 * abort();
 * ```
 */
export function useChat(options: UseChatOptions): UseChatReturn {
  const { sessionId, clientConfig, initialMessages = [], onStreamStart, onPartial, onComplete, onError } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<StreamError | null>(null);

  // Refs
  const abortRef = useRef<(() => void) | null>(null);
  const clientRef = useRef<ReturnType<typeof createH5StreamClient> | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = createH5StreamClient(clientConfig);
  }, [clientConfig]);

  /**
   * Check if streaming is supported
   */
  const isStreamingSupported = useCallback(() => {
    const env = Taro.getEnv();
    // H5 supports streaming via fetch
    if (env === Taro.ENV_TYPE.WEB) {
      return clientRef.current?.isStreamingSupported() ?? false;
    }
    // Weapp will use WS in Phase 2
    return false;
  }, []);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (!clientRef.current) return;

      // Check platform support
      const env = Taro.getEnv();
      if (env !== Taro.ENV_TYPE.WEB) {
        // Weapp/RN - show degraded hint
        setError({
          code: ChatErrorCodes.NETWORK_ERROR,
          message: '当前平台暂不支持流式聊天，请使用 H5 版本',
          recoverable: false,
        });
        return;
      }

      // Generate message IDs
      const userMessageId = generateMessageId();
      const assistantMessageId = generateMessageId();
      currentMessageIdRef.current = assistantMessageId;

      // Add user message
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: text,
        status: 'complete',
        timestamp: Date.now(),
      };

      // Add placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        status: 'pending',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      // Build request
      const request: ChatRequest = {
        sessionId,
        messageId: assistantMessageId,
        text,
        metadata: {
          platform: 'h5',
          timestamp: Date.now(),
        },
      };

      // Event handlers
      const handlers: StreamEventHandlers = {
        onPartial: (content, state) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: msg.content + content,
                    state,
                    status: 'streaming' as const,
                  }
                : msg
            )
          );
          onPartial?.(assistantMessageId, content, state);
        },
        onEnd: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, status: 'complete' as const } : msg
            )
          );
          setIsStreaming(false);
          currentMessageIdRef.current = null;
          abortRef.current = null;
          onComplete?.(assistantMessageId);
        },
        onError: (streamError) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, status: 'error' as const, error: streamError }
                : msg
            )
          );
          setIsStreaming(false);
          setError(streamError);
          currentMessageIdRef.current = null;
          abortRef.current = null;
          onError?.(assistantMessageId, streamError);
        },
      };

      // Start streaming
      onStreamStart?.(assistantMessageId);
      const connection = clientRef.current.sendMessage(request, handlers);
      abortRef.current = connection.abort;
    },
    [sessionId, onStreamStart, onPartial, onComplete, onError]
  );

  /**
   * Abort current streaming
   */
  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;

      // Mark current message as error
      if (currentMessageIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentMessageIdRef.current
              ? {
                  ...msg,
                  status: 'error' as const,
                  error: {
                    code: ChatErrorCodes.UNKNOWN,
                    message: '用户取消',
                    recoverable: true,
                  },
                }
              : msg
          )
        );
        currentMessageIdRef.current = null;
      }

      setIsStreaming(false);
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    abort();
    setMessages([]);
    setError(null);
  }, [abort]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current();
      }
    };
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    abort,
    clearMessages,
    isStreamingSupported: isStreamingSupported(),
  };
}

export default useChat;
