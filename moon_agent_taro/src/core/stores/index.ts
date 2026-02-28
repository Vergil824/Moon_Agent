/**
 * @core/stores - Zustand store definitions
 *
 * This module contains cross-platform state management stores.
 * Uses Zustand for consistent state management across all platforms.
 */

import { create } from 'zustand';
import type {
  MeasurementData,
  AuxiliaryData,
  ChestType,
  PainPointId,
  Product,
} from '../schemas';

// Navigation tab type
export type NavTab = 'chat' | 'cart' | 'profile';

// Navigation State
type NavigationState = {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// UI State
type UiState = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

// Chat message type
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fullContent?: string;
  timestamp: number;
};

// Chat state payload
export type ChatStatePayload = Record<string, unknown>;

// Streaming error type
export type StreamingError = {
  code: string;
  message: string;
  recoverable?: boolean;
};

// Chat State
type ChatState = {
  messages: Message[];
  isTyping: boolean;
  isStreaming: boolean;
  currentState: ChatStatePayload | null;
  measurementData: MeasurementData | null;
  auxiliaryData: AuxiliaryData | null;
  chestType: ChestType | null;
  painPoints: PainPointId[];
  recommendedProducts: Product[];
  sessionId: string | null;
  /** ID of the message currently being streamed (for typewriter effect) */
  streamingMessageId: string | null;
  /** Error that occurred during streaming (content preserved) */
  streamingError: StreamingError | null;

  // Scroll State (AC: 3, 4, 5)
  /** Whether to auto-scroll to bottom when new messages arrive */
  isFollowingBottom: boolean;
  /** Whether there are unread messages (user scrolled up) */
  hasUnreadMessages: boolean;

  // Story 3.5: Auto-open state for recommendation panel
  /** Whether auto-open has already been triggered for the current state */
  hasAutoOpenedCurrentState: boolean;

  // Task 1: Typewriter active signal for send gating
  /** Whether typewriter animation is currently running (for send gating) */
  isTypewriterActive: boolean;

  // Task 21: Pinned recommendation state for persistent display
  /** Whether recommendations should be shown persistently (even after currentState changes) */
  isPinnedRecommendation: boolean;

  // Actions
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessageContent: (id: string, content: string) => void;
  setIsTyping: (typing: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setCurrentState: (state: ChatStatePayload | null) => void;
  setMeasurementData: (data: MeasurementData | null) => void;
  setAuxiliaryData: (data: AuxiliaryData | null) => void;
  setChestType: (type: ChestType | null) => void;
  setPainPoints: (points: PainPointId[]) => void;
  setRecommendedProducts: (products: Product[]) => void;
  setSessionId: (id: string | null) => void;
  clearMessages: () => void;

  // Streaming Actions (AC: 1, 2)
  /**
   * Start streaming: create a placeholder assistant message
   * Returns the message ID for tracking
   * @returns The ID of the created streaming message
   */
  startStreaming: () => string;
  /**
   * Append partial content to the streaming message's fullContent
   * Only updates fullContent, does not create new message (AC: 1)
   * @param delta - The incremental text to append
   */
  appendStreamingContent: (delta: string) => void;
  /**
   * Finalize streaming: set content to finalContent (or fullContent), clear streaming state
   * @param finalContent - Optional final content to use instead of fullContent
   */
  finalizeStreaming: (finalContent?: string) => void;
  /**
   * Set streaming error: preserves already received content, shows error UI (AC: 2)
   * @param error - The error that occurred
   */
  setStreamingError: (error: StreamingError) => void;
  /**
   * Clear streaming error (for retry)
   */
  clearStreamingError: () => void;

  // Scroll Actions (AC: 3, 4)
  /**
   * Set whether to follow bottom (AC: 3, 4)
   * When user scrolls up, set to false; when clicking "new messages", set to true
   */
  setFollowingBottom: (following: boolean) => void;
  /**
   * Set hasUnreadMessages flag (AC: 4)
   * Set to true when new messages arrive while not following bottom
   */
  setHasUnreadMessages: (hasUnread: boolean) => void;
  /**
   * Scroll to bottom and mark messages as read (AC: 4)
   * Called when user clicks "new messages" hint
   */
  scrollToBottomAndRead: () => void;

  // Story 3.5: Auto-open actions
  /**
   * Set hasAutoOpenedCurrentState flag
   * Used by ProductRecommendation to track auto-open
   */
  setHasAutoOpenedCurrentState: (opened: boolean) => void;

  // Task 1: Typewriter active setter
  /**
   * Set isTypewriterActive flag
   * Called by MessageBubble when typewriter animation starts/ends
   * Used by ChatPage to gate send functionality
   */
  setIsTypewriterActive: (active: boolean) => void;

  // Task 21: Pinned recommendation actions
  /**
   * Set isPinnedRecommendation flag
   * Called when recommendations appear, ensures they stay visible
   */
  setIsPinnedRecommendation: (pinned: boolean) => void;
  /**
   * Clear pinned recommendation (user explicitly closes or takes action)
   */
  clearPinnedRecommendation: () => void;
};

// Generate unique ID for messages
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  isStreaming: false,
  currentState: null,
  measurementData: null,
  auxiliaryData: null,
  chestType: null,
  painPoints: [],
  recommendedProducts: [],
  sessionId: null,
  streamingMessageId: null,
  streamingError: null,
  // Scroll state (AC: 3, 4)
  isFollowingBottom: true,
  hasUnreadMessages: false,
  // Story 3.5: Auto-open state
  hasAutoOpenedCurrentState: false,
  // Task 1: Typewriter active state
  isTypewriterActive: false,
  // Task 21: Pinned recommendation state
  isPinnedRecommendation: false,

  addMessage: (msg) => {
    const id = generateId();
    const newMessage: Message = {
      id,
      role: msg.role,
      content: msg.content,
      timestamp: Date.now(),
    };
    const { isFollowingBottom } = get();
    set((state) => ({
      messages: [...state.messages, newMessage],
      // If not following bottom and this is an assistant message, mark as unread (AC: 4)
      hasUnreadMessages:
        !isFollowingBottom && msg.role === 'assistant'
          ? true
          : state.hasUnreadMessages,
    }));
    return id;
  },

  updateMessageContent: (id, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    }));
  },

  setIsTyping: (isTyping) => set({ isTyping }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setCurrentState: (currentState) => {
    // Task 21: Check if this state contains recommendations
    const step =
      currentState && typeof currentState.step === 'string'
        ? currentState.step
        : '';
    const isRecommendation =
      step === 'recommendation' ||
      step === 'recommendations' ||
      step === 'ProductRecommendation';

    set({
      currentState,
      // Reset auto-open flag when state changes (Story 3.5)
      hasAutoOpenedCurrentState: false,
      // Task 21: Pin recommendation when it appears (stays visible even if currentState clears)
      isPinnedRecommendation: isRecommendation ? true : get().isPinnedRecommendation,
    });
  },
  setMeasurementData: (measurementData) => set({ measurementData }),
  setAuxiliaryData: (auxiliaryData) => set({ auxiliaryData }),
  setChestType: (chestType) => set({ chestType }),
  setPainPoints: (painPoints) => set({ painPoints }),
  setRecommendedProducts: (recommendedProducts) => set({ recommendedProducts }),
  setSessionId: (sessionId) => set({ sessionId }),
  clearMessages: () =>
    set({
      messages: [],
      streamingMessageId: null,
      streamingError: null,
      // Task 2: Also clear typewriter state when clearing messages
      isTypewriterActive: false,
    }),

  // Streaming Actions Implementation
  startStreaming: () => {
    const id = generateId();
    const newMessage: Message = {
      id,
      role: 'assistant',
      content: '', // Empty content initially
      fullContent: '', // Initialize fullContent for streaming
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
      streamingMessageId: id,
      // Keep isTyping=true until first partial arrives (AC: 3 typing/streaming strategy)
      // isStreaming stays false until first partial
      isStreaming: false,
      isTyping: true,
      streamingError: null,
    }));
    return id;
  },

  appendStreamingContent: (delta) => {
    const {
      streamingMessageId,
      messages,
      isFollowingBottom,
      hasUnreadMessages,
    } = get();
    if (!streamingMessageId) return;

    set({
      messages: messages.map((msg) =>
        msg.id === streamingMessageId
          ? { ...msg, fullContent: (msg.fullContent || '') + delta }
          : msg
      ),
      // First partial received: switch from typing to streaming (AC: 3)
      isTyping: false,
      isStreaming: true,
      // If not following bottom, mark as having unread (AC: 4)
      hasUnreadMessages: !isFollowingBottom ? true : hasUnreadMessages,
    });
  },

  finalizeStreaming: (finalContent) => {
    const { streamingMessageId, messages } = get();
    if (!streamingMessageId) return;

    set({
      messages: messages.map((msg) =>
        msg.id === streamingMessageId
          ? {
              ...msg,
              // Use finalContent if provided, otherwise use accumulated fullContent
              content: finalContent ?? msg.fullContent ?? msg.content,
              // IMPORTANT: Do NOT clear fullContent here!
              // TypewriterBubble needs fullContent to continue the typewriter animation
              // after streaming ends. The animation runs independently of streaming state.
              // Clearing fullContent would cause MessageBubble to fall back to direct
              // rendering, losing the typewriter effect.
            }
          : msg
      ),
      streamingMessageId: null,
      isStreaming: false,
      // Task 7: Also clear isTyping to handle Stop before first delta
      // This ensures user can re-send immediately after Stop (AC: 7)
      isTyping: false,
    });
  },

  setStreamingError: (error) => {
    const { streamingMessageId, messages } = get();
    // Preserve already received content - do NOT clear fullContent
    // Just stop streaming and set error state
    // Task 6: Also clear isTyping to ensure typing indicator hides on error
    set({
      streamingError: error,
      isStreaming: false,
      isTyping: false, // Task 6: Clear typing state on error
      // Keep streamingMessageId so UI can still show partial content with error
      // Finalize the partial content to content field so it's preserved
      messages: streamingMessageId
        ? messages.map((msg) =>
            msg.id === streamingMessageId
              ? {
                  ...msg,
                  // Preserve partial content: set content to fullContent if available
                  content: msg.fullContent || msg.content,
                }
              : msg
          )
        : messages,
      streamingMessageId: null,
    });
  },

  clearStreamingError: () => {
    set({ streamingError: null });
  },

  // Scroll Actions (AC: 3, 4)
  setFollowingBottom: (following) => {
    set({ isFollowingBottom: following });
    // If resuming follow, clear unread flag
    if (following) {
      set({ hasUnreadMessages: false });
    }
  },

  setHasUnreadMessages: (hasUnread) => {
    set({ hasUnreadMessages: hasUnread });
  },

  scrollToBottomAndRead: () => {
    set({
      isFollowingBottom: true,
      hasUnreadMessages: false,
    });
    // Note: Actual scrolling is handled by the UI component
    // This action just updates the state
  },

  // Story 3.5: Auto-open action
  setHasAutoOpenedCurrentState: (opened) => {
    set({ hasAutoOpenedCurrentState: opened });
  },

  // Task 1: Typewriter active setter
  setIsTypewriterActive: (active) => {
    set({ isTypewriterActive: active });
  },

  // Task 21: Pinned recommendation actions
  setIsPinnedRecommendation: (pinned) => {
    set({ isPinnedRecommendation: pinned });
  },
  clearPinnedRecommendation: () => {
    set({ isPinnedRecommendation: false });
  },
}));
