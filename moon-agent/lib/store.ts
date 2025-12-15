import { create } from "zustand";

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
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
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
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => string;
  updateMessageContent: (id: string, content: string) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setIsTyping: (typing: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setCurrentState: (state: ChatStatePayload | null) => void;
  setMeasurementData: (data: MeasurementData | null) => void;
  setAuxiliaryData: (data: AuxiliaryData | null) => void;
  setChestType: (type: ChestType | null) => void;
  setPainPoints: (points: PainPointId[]) => void;
  clearMessages: () => void;
};

// Generate unique ID for messages
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  isStreaming: false,
  currentState: null,
  measurementData: null,
  auxiliaryData: null,
  chestType: null,
  painPoints: [],

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

  setIsTyping: (typing) => set({ isTyping: typing }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setCurrentState: (currentState) => set({ currentState }),

  setMeasurementData: (measurementData) => set({ measurementData }),

  setAuxiliaryData: (auxiliaryData) => set({ auxiliaryData }),

  setChestType: (chestType) => set({ chestType }),

  setPainPoints: (painPoints) => set({ painPoints }),

  clearMessages: () => set({ messages: [] })
}));
