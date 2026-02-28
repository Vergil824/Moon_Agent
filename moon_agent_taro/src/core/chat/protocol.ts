/**
 * Unified Chat Protocol for Taro Multi-Platform
 *
 * This protocol defines the message structures for client-server communication
 * across H5, WeChat Mini Program, and Taro RN platforms.
 *
 * Design principles:
 * - Client NEVER connects directly to n8n (must go through payment_interface)
 * - Consistent with moon-agent Next.js implementation (partial/end/error semantics)
 * - Support both SSE (H5) and WebSocket (weapp) channels
 *
 * @see docs/sprint-artifacts/taro-migration/stories/3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */

// ============================================================================
// Client → Server Request Types
// ============================================================================

/**
 * Chat request payload sent from client to payment_interface
 */
export interface ChatRequest {
  /** Unique session identifier for conversation continuity */
  sessionId: string;
  /** Unique message identifier for deduplication and tracking */
  messageId: string;
  /** User input text content */
  text: string;
  /** Optional metadata for context and analytics */
  metadata?: ChatRequestMetadata;
}

/**
 * Optional metadata attached to chat requests
 */
export interface ChatRequestMetadata {
  /** Platform identifier: h5 | weapp | rn */
  platform?: 'h5' | 'weapp' | 'rn';
  /** Client timestamp for latency tracking */
  timestamp?: number;
  /** Additional custom fields */
  [key: string]: unknown;
}

// ============================================================================
// Server → Client Event Types
// ============================================================================

/**
 * Event type enumeration for server-to-client messages
 *
 * Event flow: auth_ack (optional) → partial* → end | error
 */
export type ChatEventType =
  | 'auth_ack'
  | 'partial'
  | 'end'
  | 'error'
  | 'heartbeat';

/**
 * Base event structure for all server events
 */
export interface BaseChatEvent {
  type: ChatEventType;
  /** Message ID this event relates to */
  messageId?: string;
  /** Server timestamp */
  timestamp?: number;
}

/**
 * Authentication acknowledgment event (optional, for WS connections)
 */
export interface AuthAckEvent extends BaseChatEvent {
  type: 'auth_ack';
  /** Session ID confirmed by server */
  sessionId: string;
  /** Connection ID for reconnection */
  connectionId?: string;
}

/**
 * Partial/streaming text event - emitted multiple times during response
 */
export interface PartialEvent extends BaseChatEvent {
  type: 'partial';
  /** Incremental text content to append */
  content: string;
  /** Parsed state from <STATE> tag if present */
  state?: ParsedStatePayload | null;
}

/**
 * End event - marks completion of a message response
 */
export interface EndEvent extends BaseChatEvent {
  type: 'end';
  /** Final complete text (optional, for verification) */
  finalContent?: string;
  /** Final parsed state */
  state?: ParsedStatePayload | null;
}

/**
 * Error event - indicates an error occurred
 */
export interface ErrorEvent extends BaseChatEvent {
  type: 'error';
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Whether the error is recoverable (client can retry) */
  recoverable?: boolean;
}

/**
 * Heartbeat event - for connection keep-alive (WS only)
 */
export interface HeartbeatEvent extends BaseChatEvent {
  type: 'heartbeat';
  /** Server timestamp */
  serverTime: number;
}

/**
 * Union type for all chat events
 */
export type ChatEvent =
  | AuthAckEvent
  | PartialEvent
  | EndEvent
  | ErrorEvent
  | HeartbeatEvent;

// ============================================================================
// State Protocol (Ported from moon-agent/lib/chat/chatProtocol.ts)
// ============================================================================

/**
 * Parsed state payload from <STATE>...</STATE> tags
 */
export type ParsedStatePayload = Record<string, unknown>;

/**
 * Result of parsing a complete response with state tag
 */
export interface ParsedStateTaggedText {
  state: ParsedStatePayload | null;
  text: string;
}

/**
 * Parse a full response string that may contain one or more <STATE>...</STATE> JSON tags.
 * The <STATE> tag content must be hidden from the chat bubble; only `text` should be displayed.
 * If multiple <STATE> tags exist, the LAST valid one is used (e.g., recommendations overrides summary).
 *
 * @param input - Raw response string potentially containing <STATE> tag(s)
 * @returns Parsed state (last one if multiple) and visible text
 */
export function parseStateTaggedText(input: string): ParsedStateTaggedText {
  // Using [\s\S]*? instead of .*? with /s flag for ES5+ compatibility
  // Use global flag to find ALL matches
  const regex = /<STATE>([\s\S]*?)<\/STATE>/g;
  let match: RegExpExecArray | null;
  let lastState: ParsedStatePayload | null = null;
  let text = input;

  // Find all <STATE> tags and keep track of the last valid one
  while ((match = regex.exec(input)) !== null) {
    const rawJson = match[1] ?? '';
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        lastState = parsed as ParsedStatePayload;
      }
    } catch {
      // Invalid JSON - skip this tag but still remove it from text
    }
  }

  // Remove ALL <STATE>...</STATE> tags from the visible text
  text = input.replace(/<STATE>[\s\S]*?<\/STATE>/g, '');

  return { state: lastState, text };
}

/**
 * Event emitted by the state stream parser
 */
export interface StateStreamParserEvent {
  /** Parsed state object, emitted once when </STATE> is complete */
  state?: ParsedStatePayload | null;
  /** Visible text delta to append (never includes <STATE> content) */
  textDelta: string;
}

/**
 * Create an incremental stream parser for the <STATE> protocol.
 * Designed to:
 * - Never leak <STATE> tag content into visible text
 * - Emit `state` immediately once </STATE> is fully received
 * - Support MULTIPLE <STATE> tags in a single stream (e.g., summary then recommendations)
 *
 * @returns Parser instance with push method
 */
export function createStateStreamParser() {
  let buffer = '';

  const startTag = '<STATE>';
  const endTag = '</STATE>';

  function push(chunk: string): StateStreamParserEvent {
    buffer += chunk;

    // Accumulated results for this push
    let accumulatedText = '';
    let latestState: ParsedStatePayload | null | undefined;

    // Process buffer until no more complete <STATE>...</STATE> blocks
    while (true) {
      const startIdx = buffer.indexOf(startTag);

      // No start tag: check for potential partial tag at end
      if (startIdx === -1) {
        const lastLt = buffer.lastIndexOf('<');
        if (lastLt === -1) {
          // No '<' at all - emit entire buffer as text
          accumulatedText += buffer;
          buffer = '';
        } else {
          const tail = buffer.slice(lastLt);
          if (startTag.startsWith(tail)) {
            // Potential partial start tag - keep it in buffer
            accumulatedText += buffer.slice(0, lastLt);
            buffer = tail;
          } else {
            // Just a regular '<' - emit entire buffer
            accumulatedText += buffer;
            buffer = '';
          }
        }
        break; // No more <STATE> tags to process
      }

      // Start tag found: emit content before it
      const before = buffer.slice(0, startIdx);
      accumulatedText += before;
      buffer = buffer.slice(startIdx);

      // Look for end tag
      const endIdx = buffer.indexOf(endTag);
      if (endIdx === -1) {
        // End tag not yet received - keep buffering
        break;
      }

      // Complete <STATE>...</STATE> found - parse it
      const jsonStart = startTag.length;
      const rawJson = buffer.slice(jsonStart, endIdx);

      let state: ParsedStatePayload | null = null;
      try {
        const parsed = JSON.parse(rawJson);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          state = parsed as ParsedStatePayload;
        }
      } catch {
        state = null;
      }

      // Store the latest state (last one wins if multiple in same chunk)
      if (state !== null) {
        latestState = state;
      }

      // Remove the processed <STATE>...</STATE> block from buffer
      buffer = buffer.slice(endIdx + endTag.length);
      // Continue loop to process any additional <STATE> tags
    }

    // Return result
    if (latestState !== undefined) {
      return { state: latestState, textDelta: accumulatedText };
    }
    return { textDelta: accumulatedText };
  }

  return { push };
}

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standard error codes for chat errors
 */
export const ChatErrorCodes = {
  /** Authentication required or failed */
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_FAILED: 'AUTH_FAILED',
  /** Session expired or invalid */
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_INVALID: 'SESSION_INVALID',
  /** Rate limit exceeded */
  RATE_LIMITED: 'RATE_LIMITED',
  /** Network or connection error */
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_LOST: 'CONNECTION_LOST',
  /** Server-side error */
  SERVER_ERROR: 'SERVER_ERROR',
  /** Upstream (n8n) error */
  UPSTREAM_ERROR: 'UPSTREAM_ERROR',
  /** Request timeout */
  TIMEOUT: 'TIMEOUT',
  /** Unknown error */
  UNKNOWN: 'UNKNOWN',
} as const;

export type ChatErrorCode =
  (typeof ChatErrorCodes)[keyof typeof ChatErrorCodes];

// ============================================================================
// WebSocket Protocol (Phase 2 Preparation)
// ============================================================================

/**
 * WebSocket message types for weapp channel
 * (Phase 2 implementation - interface defined now for protocol alignment)
 */
export type WsMessageType =
  | 'auth' // Client sends auth token
  | 'auth_ack' // Server acknowledges auth
  | 'message' // Client sends chat message
  | 'partial' // Server sends partial response
  | 'end' // Server signals message end
  | 'error' // Server sends error
  | 'ping' // Client heartbeat
  | 'pong'; // Server heartbeat response

/**
 * WebSocket configuration for weapp
 */
export interface WsConfig {
  /** WebSocket endpoint URL */
  url: string;
  /** Heartbeat interval in milliseconds (recommended: 20000-30000) */
  heartbeatInterval: number;
  /** Reconnection attempts before fallback */
  maxReconnectAttempts: number;
  /** Reconnection delay with exponential backoff base (ms) */
  reconnectBaseDelay: number;
}

/**
 * Default WebSocket configuration
 */
export const DEFAULT_WS_CONFIG: WsConfig = {
  url: '/chat/ws',
  heartbeatInterval: 25000,
  maxReconnectAttempts: 3,
  reconnectBaseDelay: 1000,
};
