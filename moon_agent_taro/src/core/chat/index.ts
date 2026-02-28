/**
 * Chat Module - Unified Chat Protocol for Taro Multi-Platform
 *
 * This module provides:
 * - Protocol types for client-server communication
 * - SSE parser for H5 streaming
 * - Dual-channel parsers for n8n responses (SSE + JSONL)
 * - State protocol parser for <STATE> tags
 *
 * Client NEVER connects directly to n8n - must go through payment_interface.
 *
 * @see docs/sprint-artifacts/taro-migration/stories/3-1-chat-channel-adaptation-streaming-ws-fallback.md
 *
 * @example
 * ```ts
 * import {
 *   type ChatRequest,
 *   type ChatEvent,
 *   createDualChannelSseParser,
 *   ChatErrorCodes,
 * } from '@core/chat';
 *
 * // Create request
 * const request: ChatRequest = {
 *   sessionId: 'session-123',
 *   messageId: 'msg-456',
 *   text: 'Hello, Moon!',
 * };
 *
 * // Parse streaming response
 * const parser = createDualChannelSseParser();
 * const events = parser.push(chunk);
 * ```
 */

// Protocol types and utilities
export {
  // Request types
  type ChatRequest,
  type ChatRequestMetadata,
  // Event types
  type ChatEventType,
  type BaseChatEvent,
  type AuthAckEvent,
  type PartialEvent,
  type EndEvent,
  type ErrorEvent,
  type HeartbeatEvent,
  type ChatEvent,
  // State protocol
  type ParsedStatePayload,
  type ParsedStateTaggedText,
  type StateStreamParserEvent,
  parseStateTaggedText,
  createStateStreamParser,
  // Error codes
  ChatErrorCodes,
  type ChatErrorCode,
  // WebSocket config (Phase 2)
  type WsMessageType,
  type WsConfig,
  DEFAULT_WS_CONFIG,
} from './protocol';

// SSE parser
export { type SseEvent, createSseParser, parseSseResponse } from './sse';

// Dual-channel parsers
export {
  type DualChannelEvent,
  createDualChannelSseParser,
  createDualChannelJsonlParser,
  createDualChannelParser,
} from './dualChannel';

// H5 Stream Client
export {
  createH5StreamClient,
  h5StreamClient,
  type StreamEventHandlers,
  type StreamError,
  type H5StreamClientConfig,
  type StreamConnection,
} from './h5StreamClient';

// WeApp Chunked Stream Client
export {
  createWeappChunkedClient,
  weappChunkedClient,
  type WeappStreamEventHandlers,
  type WeappStreamError,
  type WeappChunkedClientConfig,
  type WeappStreamConnection,
} from './weappChunkedClient';

// React Hook
export {
  useChat,
  type ChatMessage,
  type UseChatOptions,
  type UseChatReturn,
} from './useChat';

// WeApp WebSocket Client (Phase 2 Placeholder)
export {
  createWeappWsClient,
  createPollingClient,
  supportsSSE,
  supportsWebSocket,
  getRecommendedChannel,
  type WsConnectionState,
  type WsEventHandlers,
  type WeappWsClient,
  type PollingClient,
} from './weappWsClient';
