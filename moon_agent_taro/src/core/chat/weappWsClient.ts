/**
 * WeApp WebSocket Client for Chat (Phase 2 Placeholder)
 *
 * This file provides the interface and placeholder implementation for
 * WebSocket-based chat on WeChat Mini Program.
 *
 * Phase 1 Status:
 * - Interface and types defined
 * - Stub implementation that returns degraded mode
 * - Ready for Phase 2 full implementation
 *
 * Phase 2 Requirements:
 * - Use Taro.connectSocket for WeChat Mini Program
 * - Implement heartbeat (20-30s interval)
 * - Implement reconnection with exponential backoff
 * - Fallback to polling when WS unavailable
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 * @see docs/sprint-artifacts/taro-migration/README.md#WebSocket 统一协议（草案）
 */

import {
  type ChatRequest,
  type ChatEvent,
  type WsConfig,
  DEFAULT_WS_CONFIG,
  ChatErrorCodes,
} from './protocol';

// ============================================================================
// Types
// ============================================================================

/**
 * WebSocket connection state
 */
export type WsConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticating'
  | 'authenticated'
  | 'reconnecting'
  | 'degraded';

/**
 * WebSocket event handlers
 */
export interface WsEventHandlers {
  /** Called when connection state changes */
  onStateChange?: (
    state: WsConnectionState,
    prevState: WsConnectionState
  ) => void;
  /** Called when a chat event is received */
  onChatEvent?: (event: ChatEvent) => void;
  /** Called when reconnecting */
  onReconnecting?: (attempt: number, maxAttempts: number) => void;
  /** Called when degraded to polling */
  onDegraded?: (reason: string) => void;
}

/**
 * WebSocket client interface
 */
export interface WeappWsClient {
  /** Current connection state */
  state: WsConnectionState;
  /** Connect to WebSocket server */
  connect: () => Promise<boolean>;
  /** Disconnect from WebSocket server */
  disconnect: () => void;
  /** Send a chat message */
  sendMessage: (request: ChatRequest) => void;
  /** Check if WebSocket is supported on current platform */
  isSupported: () => boolean;
}

// ============================================================================
// Placeholder Implementation
// ============================================================================

/**
 * Create WeApp WebSocket client (Phase 2 Placeholder)
 *
 * Currently returns a stub that indicates degraded mode.
 * Full implementation will be added in Phase 2.
 *
 * @param config - WebSocket configuration
 * @param handlers - Event handlers
 * @returns WebSocket client instance
 */
export function createWeappWsClient(
  config: Partial<WsConfig> = {},
  handlers: WsEventHandlers = {}
): WeappWsClient {
  // Phase 2: Will use config for actual WS connection
  void config; // Suppress unused warning until Phase 2
  void DEFAULT_WS_CONFIG;
  let _state: WsConnectionState = 'disconnected';

  /**
   * Update state and notify handler
   */
  function setState(newState: WsConnectionState): void {
    const prevState = _state;
    _state = newState;
    handlers.onStateChange?.(newState, prevState);
  }

  /**
   * Check if WebSocket is supported
   * In Phase 1, always return false to trigger degraded mode
   */
  function isSupported(): boolean {
    // Phase 2 TODO: Check actual Taro.connectSocket availability
    // For now, return false to indicate WS is not ready
    return false;
  }

  /**
   * Connect to WebSocket server
   * Phase 1: Immediately degrade
   */
  async function connect(): Promise<boolean> {
    if (!isSupported()) {
      setState('degraded');
      handlers.onDegraded?.('WebSocket not available in Phase 1');
      return false;
    }

    // Phase 2 TODO: Implement actual connection logic
    // 1. Taro.connectSocket({ url: config.url })
    // 2. Handle onOpen, onMessage, onClose, onError
    // 3. Send auth message and wait for auth_ack
    // 4. Start heartbeat timer

    setState('degraded');
    return false;
  }

  /**
   * Disconnect from WebSocket server
   */
  function disconnect(): void {
    // Phase 2 TODO: Implement actual disconnection
    // 1. Clear heartbeat timer
    // 2. Close socket connection
    setState('disconnected');
  }

  /**
   * Send a chat message
   * Phase 1: Not supported
   */
  function sendMessage(request: ChatRequest): void {
    // Phase 2: Will use request to send via WebSocket
    void request;
    if (_state !== 'authenticated') {
      console.warn('[WeappWsClient] Cannot send message: not authenticated');
      handlers.onChatEvent?.({
        type: 'error',
        code: ChatErrorCodes.NETWORK_ERROR,
        message: 'WebSocket not connected',
        recoverable: true,
      });
      return;
    }

    // Phase 2 TODO: Send message via WebSocket
    // const payload = JSON.stringify({
    //   type: 'message',
    //   ...request,
    // });
    // Taro.sendSocketMessage({ data: payload });
  }

  return {
    get state() {
      return _state;
    },
    connect,
    disconnect,
    sendMessage,
    isSupported,
  };
}

// ============================================================================
// Polling Fallback (Phase 2 Placeholder)
// ============================================================================

/**
 * Polling client interface for fallback
 */
export interface PollingClient {
  /** Start polling */
  start: (sessionId: string) => void;
  /** Stop polling */
  stop: () => void;
  /** Send message (will be delivered on next poll) */
  sendMessage: (request: ChatRequest) => void;
}

/**
 * Create polling fallback client (Phase 2 Placeholder)
 *
 * @param endpoint - Polling endpoint
 * @param interval - Polling interval in ms
 * @returns Polling client instance
 */
export function createPollingClient(
  endpoint = '/chat/poll',
  interval = 3000
): PollingClient {
  // Phase 2: Will use endpoint and interval for polling
  void endpoint;
  void interval;
  // Phase 2 TODO: Implement polling logic
  // 1. Periodically call polling endpoint
  // 2. Handle responses and emit events
  // 3. Queue outgoing messages

  return {
    start: (sessionId: string) => {
      console.log('[PollingClient] Start polling for session:', sessionId);
      // Phase 2: Implement polling start
    },
    stop: () => {
      console.log('[PollingClient] Stop polling');
      // Phase 2: Implement polling stop
    },
    sendMessage: (request: ChatRequest) => {
      console.log('[PollingClient] Queue message:', request.messageId);
      // Phase 2: Queue message for next poll
    },
  };
}

// ============================================================================
// Platform Detection Utilities
// ============================================================================

/**
 * Detect if current environment supports SSE (H5)
 */
export function supportsSSE(): boolean {
  return typeof fetch !== 'undefined' && typeof ReadableStream !== 'undefined';
}

/**
 * Detect if current environment supports WebSocket (weapp)
 */
export function supportsWebSocket(): boolean {
  // Phase 2 TODO: Check Taro.connectSocket availability
  return false;
}

/**
 * Get recommended chat channel for current platform
 */
export function getRecommendedChannel(): 'sse' | 'ws' | 'polling' | 'none' {
  if (supportsSSE()) return 'sse';
  if (supportsWebSocket()) return 'ws';
  // Phase 2: Return 'polling' as last resort
  return 'none';
}
