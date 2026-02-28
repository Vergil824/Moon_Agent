/**
 * Chat Protocol Type Test Specifications
 *
 * NOTE: Test framework is not configured for moon_agent_taro yet.
 * This file provides type-level validation until Epic 6 test setup.
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */

import {
  parseStateTaggedText,
  createStateStreamParser,
  ChatErrorCodes,
  DEFAULT_WS_CONFIG,
  type ChatRequest,
  type ChatRequestMetadata,
  type ChatEvent,
  type PartialEvent,
  type EndEvent,
  type ErrorEvent,
  type AuthAckEvent,
  type HeartbeatEvent,
  type ParsedStateTaggedText,
  type StateStreamParserEvent,
  type ChatErrorCode,
  type WsConfig,
} from '../protocol';

// ============================================================================
// Type-Level Validation
// ============================================================================

/**
 * Validate ChatRequest type structure
 */
const validateChatRequest = (): void => {
  // Full request with all fields
  const fullRequest: ChatRequest = {
    sessionId: 'session-123',
    messageId: 'msg-456',
    text: 'Hello, Moon!',
    metadata: {
      platform: 'h5',
      timestamp: Date.now(),
      customField: 'value',
    },
  };

  // Minimal request without metadata
  const minimalRequest: ChatRequest = {
    sessionId: 'session-123',
    messageId: 'msg-456',
    text: 'Hello',
  };

  // Validate metadata platform type constraint
  const metadataH5: ChatRequestMetadata = { platform: 'h5' };
  const metadataWeapp: ChatRequestMetadata = { platform: 'weapp' };
  const metadataRn: ChatRequestMetadata = { platform: 'rn' };

  void fullRequest;
  void minimalRequest;
  void metadataH5;
  void metadataWeapp;
  void metadataRn;
};

/**
 * Validate Chat Event types
 */
const validateChatEvents = (): void => {
  // AuthAckEvent
  const authAck: AuthAckEvent = {
    type: 'auth_ack',
    sessionId: 'session-123',
    connectionId: 'conn-789',
    timestamp: Date.now(),
  };

  // PartialEvent
  const partial: PartialEvent = {
    type: 'partial',
    messageId: 'msg-123',
    content: 'Hello',
    state: { step: 'greeting' },
  };

  // EndEvent
  const end: EndEvent = {
    type: 'end',
    messageId: 'msg-123',
    finalContent: 'Hello, how can I help you?',
    state: { step: 'complete' },
  };

  // ErrorEvent
  const error: ErrorEvent = {
    type: 'error',
    code: ChatErrorCodes.NETWORK_ERROR,
    message: 'Connection lost',
    recoverable: true,
  };

  // HeartbeatEvent
  const heartbeat: HeartbeatEvent = {
    type: 'heartbeat',
    serverTime: Date.now(),
  };

  // Union type validation
  const events: ChatEvent[] = [authAck, partial, end, error, heartbeat];

  void events;
};

/**
 * Validate parseStateTaggedText function
 */
const validateParseStateTaggedText = (): void => {
  // Test: no STATE tag
  const result1: ParsedStateTaggedText = parseStateTaggedText('Hello, world!');
  console.assert(result1.state === null);
  console.assert(result1.text === 'Hello, world!');

  // Test: valid STATE tag
  const result2 = parseStateTaggedText(
    'Hello <STATE>{"step":"greeting"}</STATE> world'
  );
  console.assert(result2.state !== null);
  console.assert((result2.state as { step: string }).step === 'greeting');
  console.assert(result2.text === 'Hello  world');

  // Test: invalid JSON in STATE tag
  const result3 = parseStateTaggedText('Hello <STATE>invalid</STATE> world');
  console.assert(result3.state === null);
  console.assert(result3.text === 'Hello  world');
};

/**
 * Validate createStateStreamParser function
 */
const validateCreateStateStreamParser = (): void => {
  const parser = createStateStreamParser();

  // Test: normal text without STATE
  const event1: StateStreamParserEvent = parser.push('Hello, ');
  console.assert(event1.textDelta === 'Hello, ');
  console.assert(event1.state === undefined);

  // Create new parser for complete STATE test
  const parser2 = createStateStreamParser();
  const event2 = parser2.push('<STATE>{"key":"value"}</STATE>after');
  console.assert(event2.state !== null);
  console.assert(event2.textDelta === 'after');
};

/**
 * Validate Error Codes
 */
const validateErrorCodes = (): void => {
  const codes: ChatErrorCode[] = [
    ChatErrorCodes.AUTH_REQUIRED,
    ChatErrorCodes.AUTH_FAILED,
    ChatErrorCodes.SESSION_EXPIRED,
    ChatErrorCodes.SESSION_INVALID,
    ChatErrorCodes.RATE_LIMITED,
    ChatErrorCodes.NETWORK_ERROR,
    ChatErrorCodes.CONNECTION_LOST,
    ChatErrorCodes.SERVER_ERROR,
    ChatErrorCodes.UPSTREAM_ERROR,
    ChatErrorCodes.TIMEOUT,
    ChatErrorCodes.UNKNOWN,
  ];

  void codes;
};

/**
 * Validate WS Config
 */
const validateWsConfig = (): void => {
  const config: WsConfig = DEFAULT_WS_CONFIG;

  console.assert(config.url === '/chat/ws');
  console.assert(config.heartbeatInterval === 25000);
  console.assert(config.maxReconnectAttempts === 3);
  console.assert(config.reconnectBaseDelay === 1000);

  // Custom config
  const customConfig: WsConfig = {
    url: '/custom/ws',
    heartbeatInterval: 30000,
    maxReconnectAttempts: 5,
    reconnectBaseDelay: 2000,
  };

  void customConfig;
};

/**
 * Run all type validations
 */
const typeCheck = (): void => {
  validateChatRequest();
  validateChatEvents();
  validateParseStateTaggedText();
  validateCreateStateStreamParser();
  validateErrorCodes();
  validateWsConfig();
};

export { typeCheck };
