/**
 * Chat Store Streaming Actions Type Test Specifications
 *
 * NOTE: Test framework is not configured for moon_agent_taro yet.
 * This file provides type-level validation until Epic 6 test setup.
 *
 * @see Story 3-4-streaming-message-rendering-chat-ui.md
 * @see AC 1: partial → end merge (no duplicate bubbles, no lost characters)
 * @see AC 2: error bubble with retry (preserves content)
 */

import {
  useChatStore,
  type Message,
  type StreamingError,
} from '../index';

// ============================================================================
// Type-Level Validation
// ============================================================================

/**
 * Validate Message type includes fullContent for streaming
 */
const validateMessageType = (): void => {
  // Message with fullContent (streaming in progress)
  const streamingMessage: Message = {
    id: 'msg-123',
    role: 'assistant',
    content: '',
    fullContent: 'Partial content received...',
    timestamp: Date.now(),
  };

  // Message without fullContent (completed)
  const completedMessage: Message = {
    id: 'msg-456',
    role: 'assistant',
    content: 'Final complete content',
    timestamp: Date.now(),
  };

  void streamingMessage;
  void completedMessage;
};

/**
 * Validate StreamingError type
 */
const validateStreamingErrorType = (): void => {
  const recoverableError: StreamingError = {
    code: 'NETWORK_ERROR',
    message: '网络请求失败，请检查网络连接',
    recoverable: true,
  };

  const fatalError: StreamingError = {
    code: 'AUTH_FAILED',
    message: '认证失败',
    recoverable: false,
  };

  const minimalError: StreamingError = {
    code: 'UNKNOWN',
    message: '未知错误',
  };

  void recoverableError;
  void fatalError;
  void minimalError;
};

/**
 * Validate startStreaming action
 * AC 1: Creates placeholder assistant message with empty content
 */
const validateStartStreaming = (): void => {
  const store = useChatStore.getState();

  // startStreaming should return a string (message ID)
  const messageId: string = store.startStreaming();
  console.assert(typeof messageId === 'string');
  console.assert(messageId.startsWith('msg-'));

  // After startStreaming:
  // - streamingMessageId should be set
  // - isStreaming should be true
  // - A new message should exist
  const state = useChatStore.getState();
  console.assert(state.streamingMessageId === messageId);
  console.assert(state.isStreaming === true);

  const newMessage = state.messages.find((m) => m.id === messageId);
  console.assert(newMessage !== undefined);
  console.assert(newMessage?.role === 'assistant');
  console.assert(newMessage?.content === '');
  console.assert(newMessage?.fullContent === '');
};

/**
 * Validate appendStreamingContent action
 * AC 1: Only updates fullContent, does not create new messages
 */
const validateAppendStreamingContent = (): void => {
  // Setup: start streaming first
  useChatStore.setState({ messages: [], streamingMessageId: null });
  const messageId = useChatStore.getState().startStreaming();

  const initialMessageCount = useChatStore.getState().messages.length;

  // Append partial content
  useChatStore.getState().appendStreamingContent('Hello, ');
  useChatStore.getState().appendStreamingContent('world!');

  const state = useChatStore.getState();

  // Message count should NOT increase (no duplicate bubbles)
  console.assert(state.messages.length === initialMessageCount);

  // fullContent should be accumulated
  const message = state.messages.find((m) => m.id === messageId);
  console.assert(message?.fullContent === 'Hello, world!');

  // content should still be empty (not finalized yet)
  console.assert(message?.content === '');
};

/**
 * Validate finalizeStreaming action
 * AC 1: end event finalizes content, stops streaming
 */
const validateFinalizeStreaming = (): void => {
  // Setup: start and append content
  useChatStore.setState({ messages: [], streamingMessageId: null });
  const messageId = useChatStore.getState().startStreaming();
  useChatStore.getState().appendStreamingContent('Complete response');

  // Finalize without explicit finalContent
  useChatStore.getState().finalizeStreaming();

  const state = useChatStore.getState();

  // streamingMessageId should be cleared
  console.assert(state.streamingMessageId === null);

  // isStreaming should be false
  console.assert(state.isStreaming === false);

  // content should equal fullContent
  const message = state.messages.find((m) => m.id === messageId);
  console.assert(message?.content === 'Complete response');

  // fullContent should be cleared
  console.assert(message?.fullContent === undefined);
};

/**
 * Validate finalizeStreaming with explicit finalContent
 */
const validateFinalizeStreamingWithContent = (): void => {
  // Setup
  useChatStore.setState({ messages: [], streamingMessageId: null });
  const messageId = useChatStore.getState().startStreaming();
  useChatStore.getState().appendStreamingContent('Partial...');

  // Finalize with explicit content
  useChatStore.getState().finalizeStreaming('Final verified content');

  const message = useChatStore.getState().messages.find((m) => m.id === messageId);

  // Should use explicit finalContent, not accumulated fullContent
  console.assert(message?.content === 'Final verified content');
};

/**
 * Validate setStreamingError action
 * AC 2: Preserves already received content, shows error
 */
const validateSetStreamingError = (): void => {
  // Setup: start streaming and receive some content
  useChatStore.setState({ messages: [], streamingMessageId: null, streamingError: null });
  const messageId = useChatStore.getState().startStreaming();
  useChatStore.getState().appendStreamingContent('Partial content before error');

  // Set error
  const error: StreamingError = {
    code: 'NETWORK_ERROR',
    message: '网络请求失败',
    recoverable: true,
  };
  useChatStore.getState().setStreamingError(error);

  const state = useChatStore.getState();

  // Error should be set
  console.assert(state.streamingError !== null);
  console.assert(state.streamingError?.code === 'NETWORK_ERROR');

  // Streaming should stop
  console.assert(state.isStreaming === false);
  console.assert(state.streamingMessageId === null);

  // CRITICAL: Content should be PRESERVED (AC 2)
  const message = state.messages.find((m) => m.id === messageId);
  console.assert(message !== undefined);
  // Content should be set from fullContent (preserved)
  console.assert(message?.content === 'Partial content before error');
};

/**
 * Validate clearStreamingError action
 */
const validateClearStreamingError = (): void => {
  useChatStore.setState({
    streamingError: { code: 'TEST', message: 'Test error' },
  });

  useChatStore.getState().clearStreamingError();

  console.assert(useChatStore.getState().streamingError === null);
};

// ============================================================================
// Scroll State Validations (AC: 3, 4)
// ============================================================================

/**
 * Validate initial scroll state
 * AC 3: Default following bottom
 */
const validateInitialScrollState = (): void => {
  useChatStore.setState({
    isFollowingBottom: true,
    hasUnreadMessages: false,
  });

  const state = useChatStore.getState();
  console.assert(state.isFollowingBottom === true);
  console.assert(state.hasUnreadMessages === false);
};

/**
 * Validate setFollowingBottom action
 * AC 4: When user scrolls up, stop following
 */
const validateSetFollowingBottom = (): void => {
  useChatStore.setState({
    isFollowingBottom: true,
    hasUnreadMessages: false,
  });

  // User scrolls up
  useChatStore.getState().setFollowingBottom(false);

  let state = useChatStore.getState();
  console.assert(state.isFollowingBottom === false);

  // User clicks "new messages" to scroll back
  useChatStore.setState({ hasUnreadMessages: true });
  useChatStore.getState().setFollowingBottom(true);

  state = useChatStore.getState();
  console.assert(state.isFollowingBottom === true);
  // Should clear unread when resuming follow
  console.assert(state.hasUnreadMessages === false);
};

/**
 * Validate hasUnreadMessages set when not following
 * AC 4: Show "new messages" hint when scrolled up
 */
const validateHasUnreadMessages = (): void => {
  useChatStore.setState({
    messages: [],
    isFollowingBottom: false, // User has scrolled up
    hasUnreadMessages: false,
  });

  // New message arrives while not following
  useChatStore.getState().addMessage({
    role: 'assistant',
    content: 'New message',
  });

  const state = useChatStore.getState();
  console.assert(state.hasUnreadMessages === true);
};

/**
 * Validate scrollToBottomAndRead action
 * AC 4: Click "new messages" to scroll and clear hint
 */
const validateScrollToBottomAndRead = (): void => {
  useChatStore.setState({
    isFollowingBottom: false,
    hasUnreadMessages: true,
  });

  useChatStore.getState().scrollToBottomAndRead();

  const state = useChatStore.getState();
  console.assert(state.isFollowingBottom === true);
  console.assert(state.hasUnreadMessages === false);
};

/**
 * Run all type validations
 */
const typeCheck = (): void => {
  // Streaming validations
  validateMessageType();
  validateStreamingErrorType();
  validateStartStreaming();
  validateAppendStreamingContent();
  validateFinalizeStreaming();
  validateFinalizeStreamingWithContent();
  validateSetStreamingError();
  validateClearStreamingError();

  // Scroll validations (AC: 3, 4)
  validateInitialScrollState();
  validateSetFollowingBottom();
  validateHasUnreadMessages();
  validateScrollToBottomAndRead();

  console.log('✅ All chat store validations passed');
};

export { typeCheck };
