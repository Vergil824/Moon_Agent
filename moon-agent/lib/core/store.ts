import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";
import {
  createN8nDualChannelJsonlParser,
  createN8nDualChannelSseParser
} from "@/lib/chat/n8nDualChannel";

// Navigation tab type - Story 1.4
export type NavTab = "home" | "discover" | "profile";

// Navigation State - Story 1.4
type NavigationState = {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab })
}));

// UI State
type UiState = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open })
}));

// Chat Message type
// Story 2.6: Added fullContent for streaming messages
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  fullContent?: string; // For streaming messages: the complete received content (AC: 9)
  timestamp: number;
};

// Parsed state from <STATE> tag
export type ChatStatePayload = Record<string, unknown>;

export type MeasurementData = {
  lowerBust: number;
  upperBust: number;
  bustDifference: number;
};

// Auxiliary body data (height, weight, waist) - Story 2.3
export type AuxiliaryData = {
  height: number;
  weight: number;
  waist: number;
};

// Chest type selection - Story 3.1
export type ChestType = "round" | "spindle" | "hemisphere";

// Pain point selection - Story 3.2
export type PainPointId = "wire_poking" | "cup_slipping" | "quad_boob" | "gaping_cup" | "strap_issues";

// Product recommendation - Story 4.2
// Story 4.6: Added sku_id and spu_id
export type Product = {
  sku_id?: number;
  spu_id?: number;
  product_name: string;
  price: number;
  matching: number;
  image_url: string;
  size: string;
  description?: string;
  style?: string;
  features?: string[];
};

// Chat State - Story 2.5: Added sessionId for persistence
// Story 2.6: Added streamingMessageId and streamAssistantReply for global streaming
type ChatState = {
  messages: Message[];
  isTyping: boolean;
  isStreaming: boolean;
  isTypewriterActive: boolean; // Story 2.6: Track if typewriter animation is running
  hasAutoOpenedCurrentState: boolean; // Story 2.6: Track if the current state component has already auto-opened
  streamingMessageId: string | null; // Story 2.6: ID of the message currently being streamed (AC: 4, 5)
  currentState: ChatStatePayload | null;
  measurementData: MeasurementData | null;
  auxiliaryData: AuxiliaryData | null;
  chestType: ChestType | null;
  painPoints: PainPointId[];
  recommendedProducts: Product[];
  sessionId: string | null; // Story 2.5: Session ID for persistence
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => string;
  updateMessageContent: (id: string, content: string) => void;
  appendToMessage: (id: string, chunk: string) => void;
  appendToFullContent: (id: string, chunk: string) => void; // Story 2.6: Append to fullContent only (AC: 4)
  syncContentToFull: (id: string) => void; // Story 2.6: Set content = fullContent (AC: 9)
  setIsTyping: (typing: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setIsTypewriterActive: (active: boolean) => void; // Story 2.6
  setHasAutoOpenedCurrentState: (opened: boolean) => void; // Story 2.6
  setStreamingMessageId: (id: string | null) => void; // Story 2.6 (AC: 5)
  setCurrentState: (state: ChatStatePayload | null) => void;
  setMeasurementData: (data: MeasurementData | null) => void;
  setAuxiliaryData: (data: AuxiliaryData | null) => void;
  setChestType: (type: ChestType | null) => void;
  setPainPoints: (points: PainPointId[]) => void;
  setRecommendedProducts: (products: Product[]) => void;
  setSessionId: (id: string | null) => void; // Story 2.5
  getOrCreateSessionId: () => string; // Story 2.5
  streamAssistantReply: (chatInput: string) => Promise<void>; // Story 2.6: Global streaming action (AC: 3, 4, 5)
  clearMessages: () => void;
};

// Generate unique ID for messages
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Generate unique session ID - Story 2.5
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Story 2.5: Persist middleware configuration
// Story 2.6: Added global streaming action for background updates
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      isStreaming: false,
      isTypewriterActive: false, // Story 2.6
      hasAutoOpenedCurrentState: false, // Story 2.6
      streamingMessageId: null, // Story 2.6
      currentState: null,
      measurementData: null,
      auxiliaryData: null,
      chestType: null,
      painPoints: [],
      recommendedProducts: [],
      sessionId: null, // Story 2.5

      addMessage: (msg) => {
        const id = generateId();
        const newMessage: Message = {
          id,
          role: msg.role,
          content: msg.content,
          timestamp: Date.now()
        };
        set((state) => ({
          messages: [...state.messages, newMessage]
        }));
        return id;
      },

      updateMessageContent: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          )
        }));
      },

      appendToMessage: (id, chunk) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content: msg.content + chunk } : msg
          )
        }));
      },

      // Story 2.6: Append to fullContent only (for background streaming) (AC: 4)
      appendToFullContent: (id, chunk) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id
              ? { ...msg, fullContent: (msg.fullContent ?? "") + chunk }
              : msg
          )
        }));
      },

      // Story 2.6: Sync content to fullContent (for catch-up completion) (AC: 9)
      syncContentToFull: (id) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id && msg.fullContent !== undefined
              ? { ...msg, content: msg.fullContent }
              : msg
          )
        }));
      },

      setIsTyping: (typing) => set({ isTyping: typing }),

      setIsStreaming: (isStreaming) => set({ isStreaming }),

      setIsTypewriterActive: (isTypewriterActive) => set({ isTypewriterActive }),

      setHasAutoOpenedCurrentState: (hasAutoOpenedCurrentState) => set({ hasAutoOpenedCurrentState }),

      // Story 2.6: Track streaming message ID (AC: 5)
      setStreamingMessageId: (streamingMessageId) => set({ streamingMessageId }),

      setCurrentState: (currentState) => {
        // Story 2.6: Reset auto-open flag when state changes
        const oldState = get().currentState;
        if (JSON.stringify(oldState) !== JSON.stringify(currentState)) {
          set({ hasAutoOpenedCurrentState: false });
        }
        
        set({ currentState });
        // If payload contains products, update recommendedProducts
        if (currentState?.products && Array.isArray(currentState.products)) {
          const normalizedProducts = (currentState.products as Array<Product & { size?: unknown }>).map(
            (product) => ({
              ...product,
              size: typeof product.size === "string" ? product.size : String(product.size ?? "")
            })
          );
          set({ recommendedProducts: normalizedProducts });
        }
      },

      setMeasurementData: (measurementData) => set({ measurementData }),

      setAuxiliaryData: (auxiliaryData) => set({ auxiliaryData }),

      setChestType: (chestType) => set({ chestType }),

      setPainPoints: (painPoints) => set({ painPoints }),

      setRecommendedProducts: (recommendedProducts) => set({ recommendedProducts }),

      // Story 2.5: Session ID management
      setSessionId: (sessionId) => set({ sessionId }),

      getOrCreateSessionId: () => {
        const current = get().sessionId;
        if (current) return current;
        const newId = generateSessionId();
        set({ sessionId: newId });
        return newId;
      },

      // Story 2.6: Global streaming action - runs in background even when page unmounts (AC: 3, 4, 5, 10)
      streamAssistantReply: async (chatInput: string) => {
        const sessionId = get().getOrCreateSessionId();

        // Show typing indicator while waiting for first token
        set({ isTyping: true, isStreaming: true });

        let assistantId: string | null = null;
        let anyText = false;
        let pendingState: ChatStatePayload | null = null;
        let deferredSummaryState: ChatStatePayload | null = null;

        const maybeApplyDeferredSummaryState = () => {
          if (!deferredSummaryState) return;
          get().setCurrentState(deferredSummaryState);
          deferredSummaryState = null;
        };

        const ensureAssistantMessage = () => {
          if (assistantId) return assistantId;
          const id = generateId();
          const newMessage: Message = {
            id,
            role: "assistant",
            content: "",
            fullContent: "", // Story 2.6: Initialize fullContent for streaming (AC: 4)
            timestamp: Date.now()
          };
          set((state) => ({
            messages: [...state.messages, newMessage],
            isTyping: false, // Hide typing indicator once message exists
            streamingMessageId: id // Track which message is streaming
          }));
          assistantId = id;
          return id;
        };

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, chatInput })
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            throw new Error(
              `Chat request failed: ${res.status} ${res.statusText} ${errText}`.trim()
            );
          }

          if (!res.body) {
            throw new Error("Chat response body is empty");
          }

          const contentType = res.headers.get("content-type") || "";
          const parser = contentType.includes("text/event-stream")
            ? createN8nDualChannelSseParser()
            : createN8nDualChannelJsonlParser();

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          // Story 2.6: Stream processing runs independently of component lifecycle (AC: 3)
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const events = parser.push(chunk);
            for (const e of events) {
              if (e.state !== undefined) {
                const step =
                  e.state && typeof (e.state as Record<string, unknown>).step === "string"
                    ? ((e.state as Record<string, unknown>).step as string)
                    : "";

                const nextState = e.state ?? null;
                pendingState = nextState;

                if (step === "summary") {
                  deferredSummaryState = pendingState;
                  maybeApplyDeferredSummaryState();
                } else if (step === "recommendation" || step === "recommendations") {
                  deferredSummaryState = null;
                  get().setCurrentState(pendingState);
                }
              }

              if (e.textDelta) {
                anyText = true;
                const id = ensureAssistantMessage();
                // Story 2.6: Append to fullContent for background streaming (AC: 4)
                get().appendToFullContent(id, e.textDelta);
              }
            }
          }

          // Stream ended successfully
          set({ isTyping: false });

          if (!anyText) {
            const id = ensureAssistantMessage();
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === id
                  ? { ...msg, content: "（没有收到可显示的回复内容）", fullContent: "（没有收到可显示的回复内容）" }
                  : msg
              )
            }));
          }

          // Apply final state
          maybeApplyDeferredSummaryState();
          if (pendingState) {
            get().setCurrentState(pendingState);
          }

          // Story 2.6: Mark streaming as complete (AC: 5)
          set({ isStreaming: false, streamingMessageId: null });

        } catch (err) {
          // Story 2.6: Robust error handling (AC: 10)
          set({ isTyping: false, isStreaming: false, streamingMessageId: null });
          const id = ensureAssistantMessage();
          const msg = err instanceof Error ? err.message : "Unknown chat error";
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === id
                ? { ...m, content: `（请求失败：${msg}）`, fullContent: `（请求失败：${msg}）` }
                : m
            )
          }));
        }
      },

      clearMessages: () => set({ messages: [] })
    }),
    {
      name: "moon-chat-storage", // Story 2.5: Storage key
      storage: createJSONStorage(() => sessionStorage),
      // Story 2.5: Partialize - exclude isTyping and isStreaming (AC: 6)
      // Story 2.6: Also exclude streamingMessageId (transient streaming state)
      partialize: (state) => ({
        messages: state.messages,
        currentState: state.currentState,
        measurementData: state.measurementData,
        auxiliaryData: state.auxiliaryData,
        chestType: state.chestType,
        painPoints: state.painPoints,
        recommendedProducts: state.recommendedProducts,
        sessionId: state.sessionId
        // isTyping, isStreaming, isTypewriterActive, hasAutoOpenedCurrentState, and streamingMessageId are intentionally excluded
      })
    }
  )
);

/**
 * Story 2.5: Hook to check if the chat store has finished hydrating from sessionStorage
 * Use this to prevent hydration mismatch errors in Next.js SSR (AC: 8)
 */
export function useChatStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if already hydrated (for hot module reloading)
    const unsubFinishHydration = useChatStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If hydration already finished before the effect ran
    if (useChatStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}
