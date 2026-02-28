import { act } from "@testing-library/react";
import { useUiStore, useChatStore, useNavigationStore } from "./store";

// Use the global storage mocks from vitest.setup.ts
const { localStorageMock, sessionStorageMock } = globalThis as unknown as { 
  localStorageMock: Storage;
  sessionStorageMock: Storage;
};

describe("useNavigationStore", () => {
  beforeEach(() => {
    // Reset storage and navigation state before each test
    localStorageMock.clear();
    sessionStorageMock.clear();
    useNavigationStore.setState({ activeTab: "home" });
  });

  it("initializes with activeTab as 'home'", () => {
    const state = useNavigationStore.getState();
    expect(state.activeTab).toBe("home");
  });

  it("updates activeTab with setActiveTab", () => {
    act(() => {
      useNavigationStore.getState().setActiveTab("discover");
    });
    expect(useNavigationStore.getState().activeTab).toBe("discover");

    act(() => {
      useNavigationStore.getState().setActiveTab("profile");
    });
    expect(useNavigationStore.getState().activeTab).toBe("profile");

    act(() => {
      useNavigationStore.getState().setActiveTab("home");
    });
    expect(useNavigationStore.getState().activeTab).toBe("home");
  });
});

describe("useUiStore", () => {
  it("toggles modalOpen", () => {
    const initial = useUiStore.getState().modalOpen;
    expect(initial).toBe(false);

    act(() => useUiStore.getState().setModalOpen(true));
    expect(useUiStore.getState().modalOpen).toBe(true);

    act(() => useUiStore.getState().setModalOpen(false));
    expect(useUiStore.getState().modalOpen).toBe(false);
  });
});

describe("useChatStore", () => {
  beforeEach(() => {
    // Reset store state before each test (including Story 2.5 sessionId)
    localStorageMock.clear();
    sessionStorageMock.clear();
    useChatStore.setState({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      measurementData: null,
      auxiliaryData: null,
      chestType: null,
      painPoints: [],
      recommendedProducts: [],
      sessionId: null
    });
  });

  it("initializes with empty messages and isTyping false", () => {
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isTyping).toBe(false);
    expect(state.isStreaming).toBe(false);
    expect(state.currentState).toBeNull();
  });

  it("adds a message with addMessage", () => {
    act(() => {
      useChatStore.getState().addMessage({
        role: "assistant",
        content: "来啦宝宝！"
      });
    });

    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("assistant");
    expect(messages[0].content).toBe("来啦宝宝！");
    expect(messages[0].id).toBeDefined();
    expect(messages[0].timestamp).toBeDefined();
  });

  it("adds user message with correct role", () => {
    act(() => {
      useChatStore.getState().addMessage({
        role: "user",
        content: "准备好了"
      });
    });

    const messages = useChatStore.getState().messages;
    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toBe("准备好了");
  });

  it("updates message content with updateMessageContent", () => {
    act(() => {
      useChatStore.getState().addMessage({
        role: "assistant",
        content: "初始内容"
      });
    });

    const messageId = useChatStore.getState().messages[0].id;

    act(() => {
      useChatStore.getState().updateMessageContent(messageId, "更新后的内容");
    });

    expect(useChatStore.getState().messages[0].content).toBe("更新后的内容");
  });

  it("appends content to message with appendToMessage", () => {
    act(() => {
      useChatStore.getState().addMessage({
        role: "assistant",
        content: "来啦"
      });
    });

    const messageId = useChatStore.getState().messages[0].id;

    act(() => {
      useChatStore.getState().appendToMessage(messageId, "宝宝！");
    });

    expect(useChatStore.getState().messages[0].content).toBe("来啦宝宝！");
  });

  it("sets typing state with setIsTyping", () => {
    expect(useChatStore.getState().isTyping).toBe(false);

    act(() => {
      useChatStore.getState().setIsTyping(true);
    });
    expect(useChatStore.getState().isTyping).toBe(true);

    act(() => {
      useChatStore.getState().setIsTyping(false);
    });
    expect(useChatStore.getState().isTyping).toBe(false);
  });

  it("sets streaming state with setIsStreaming", () => {
    expect(useChatStore.getState().isStreaming).toBe(false);

    act(() => {
      useChatStore.getState().setIsStreaming(true);
    });
    expect(useChatStore.getState().isStreaming).toBe(true);

    act(() => {
      useChatStore.getState().setIsStreaming(false);
    });
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it("sets current state with setCurrentState", () => {
    expect(useChatStore.getState().currentState).toBeNull();

    act(() => {
      useChatStore.getState().setCurrentState({ step: "welcome" });
    });
    expect(useChatStore.getState().currentState).toEqual({ step: "welcome" });

    act(() => {
      useChatStore.getState().setCurrentState({ step: "measure" });
    });
    expect(useChatStore.getState().currentState).toEqual({ step: "measure" });
  });

  it("stores recommended products with size when state payload includes products", () => {
    const payload = {
      step: "recommendations",
      products: [
        {
          product_name: "连翘杯",
          price: 35,
          matching: 5,
          image_url: "https://example.com/img.png",
          description: "圆盘型底盘大，宽底围分散重量，全包围防止外扩",
          style: "欧美",
          features: ["宽底围设计", "全包围侧翼"],
          size: "75C"
        }
      ]
    };

    act(() => {
      useChatStore.getState().setCurrentState(payload);
    });

    expect(useChatStore.getState().recommendedProducts).toEqual([
      {
        product_name: "连翘杯",
        price: 35,
        matching: 5,
        image_url: "https://example.com/img.png",
        description: "圆盘型底盘大，宽底围分散重量，全包围防止外扩",
        style: "欧美",
        features: ["宽底围设计", "全包围侧翼"],
        size: "75C"
      }
    ]);
  });

  it("sets recommended products directly with setRecommendedProducts", () => {
    expect(useChatStore.getState().recommendedProducts).toEqual([]);

    act(() => {
      useChatStore.getState().setRecommendedProducts([
        {
          product_name: "软钢圈舒适内衣",
          price: 239,
          matching: 4,
          image_url: "https://example.com/softwire.png",
          description: "软钢圈消除硬物压迫，底围弹性更好贴合",
          features: ["软性记忆钢圈"],
          size: "75C"
        }
      ]);
    });

    expect(useChatStore.getState().recommendedProducts).toEqual([
      {
        product_name: "软钢圈舒适内衣",
        price: 239,
        matching: 4,
        image_url: "https://example.com/softwire.png",
        description: "软钢圈消除硬物压迫，底围弹性更好贴合",
        features: ["软性记忆钢圈"],
        size: "75C"
      }
    ]);
  });

  it("clears all messages with clearMessages", () => {
    act(() => {
      useChatStore.getState().addMessage({ role: "assistant", content: "消息1" });
      useChatStore.getState().addMessage({ role: "user", content: "消息2" });
    });

    expect(useChatStore.getState().messages).toHaveLength(2);

    act(() => {
      useChatStore.getState().clearMessages();
    });

    expect(useChatStore.getState().messages).toEqual([]);
  });

  it("maintains message order when adding multiple messages", () => {
    act(() => {
      useChatStore.getState().addMessage({ role: "assistant", content: "第一条" });
      useChatStore.getState().addMessage({ role: "user", content: "第二条" });
      useChatStore.getState().addMessage({ role: "assistant", content: "第三条" });
    });

    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(3);
    expect(messages[0].content).toBe("第一条");
    expect(messages[1].content).toBe("第二条");
    expect(messages[2].content).toBe("第三条");
  });

  it("stores measurement data with setMeasurementData", () => {
    expect(useChatStore.getState().measurementData).toBeNull();

    act(() => {
      useChatStore.getState().setMeasurementData({
        lowerBust: 75,
        upperBust: 90,
        bustDifference: 15
      });
    });

    expect(useChatStore.getState().measurementData).toEqual({
      lowerBust: 75,
      upperBust: 90,
      bustDifference: 15
    });

    act(() => {
      useChatStore.getState().setMeasurementData(null);
    });

    expect(useChatStore.getState().measurementData).toBeNull();
  });

  it("stores auxiliary data with setAuxiliaryData", () => {
    expect(useChatStore.getState().auxiliaryData).toBeNull();

    act(() => {
      useChatStore.getState().setAuxiliaryData({
        height: 165,
        weight: 55,
        waist: 68
      });
    });

    expect(useChatStore.getState().auxiliaryData).toEqual({
      height: 165,
      weight: 55,
      waist: 68
    });

    act(() => {
      useChatStore.getState().setAuxiliaryData(null);
    });

    expect(useChatStore.getState().auxiliaryData).toBeNull();
  });

  it("stores chest type with setChestType", () => {
    expect(useChatStore.getState().chestType).toBeNull();

    act(() => {
      useChatStore.getState().setChestType("round");
    });

    expect(useChatStore.getState().chestType).toBe("round");

    act(() => {
      useChatStore.getState().setChestType("spindle");
    });

    expect(useChatStore.getState().chestType).toBe("spindle");

    act(() => {
      useChatStore.getState().setChestType("hemisphere");
    });

    expect(useChatStore.getState().chestType).toBe("hemisphere");

    act(() => {
      useChatStore.getState().setChestType(null);
    });

    expect(useChatStore.getState().chestType).toBeNull();
  });

  it("stores pain points with setPainPoints", () => {
    expect(useChatStore.getState().painPoints).toEqual([]);

    act(() => {
      useChatStore.getState().setPainPoints(["wire_poking", "cup_slipping"]);
    });

    expect(useChatStore.getState().painPoints).toEqual(["wire_poking", "cup_slipping"]);

    act(() => {
      useChatStore.getState().setPainPoints(["gaping_cup"]);
    });

    expect(useChatStore.getState().painPoints).toEqual(["gaping_cup"]);

    act(() => {
      useChatStore.getState().setPainPoints([]);
    });

    expect(useChatStore.getState().painPoints).toEqual([]);
  });

  // Story 2.5: sessionId field tests
  it("initializes with sessionId as null", () => {
    const state = useChatStore.getState();
    expect(state.sessionId).toBeNull();
  });

  it("stores sessionId with setSessionId", () => {
    act(() => {
      useChatStore.getState().setSessionId("test-session-123");
    });

    expect(useChatStore.getState().sessionId).toBe("test-session-123");

    act(() => {
      useChatStore.getState().setSessionId(null);
    });

    expect(useChatStore.getState().sessionId).toBeNull();
  });

  it("generates and stores sessionId with getOrCreateSessionId", () => {
    // Initially null
    expect(useChatStore.getState().sessionId).toBeNull();

    // Get or create should generate a new session ID
    const sessionId = useChatStore.getState().getOrCreateSessionId();
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThan(0);

    // Subsequent call should return the same session ID
    const sessionId2 = useChatStore.getState().getOrCreateSessionId();
    expect(sessionId2).toBe(sessionId);
  });
});

describe("useChatStore Persistence (Story 2.5)", () => {
  beforeEach(async () => {
    // Clear storage first
    localStorageMock.clear();
    sessionStorageMock.clear();

    // Reset store state
    useChatStore.setState({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      measurementData: null,
      auxiliaryData: null,
      chestType: null,
      painPoints: [],
      recommendedProducts: [],
      sessionId: null
    });

    // Clear any pending persist operations
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  it("persists messages, currentState, measurementData, auxiliaryData, chestType, painPoints, sessionId to localStorage", async () => {
    // Set up state
    act(() => {
      useChatStore.getState().addMessage({ role: "assistant", content: "Hello" });
      useChatStore.getState().setCurrentState({ step: "welcome" });
      useChatStore.getState().setMeasurementData({ lowerBust: 75, upperBust: 90, bustDifference: 15 });
      useChatStore.getState().setAuxiliaryData({ height: 165, weight: 55, waist: 68 });
      useChatStore.getState().setChestType("round");
      useChatStore.getState().setPainPoints(["wire_poking"]);
      useChatStore.getState().setSessionId("session-abc");
    });

    // Wait for persist middleware to write
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check localStorage was updated
    const stored = localStorageMock.getItem("moon-chat-storage");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.messages).toHaveLength(1);
    expect(parsed.state.currentState).toEqual({ step: "welcome" });
    expect(parsed.state.measurementData).toEqual({ lowerBust: 75, upperBust: 90, bustDifference: 15 });
    expect(parsed.state.auxiliaryData).toEqual({ height: 165, weight: 55, waist: 68 });
    expect(parsed.state.chestType).toBe("round");
    expect(parsed.state.painPoints).toEqual(["wire_poking"]);
    expect(parsed.state.sessionId).toBe("session-abc");
  });

  it("does NOT persist isTyping and isStreaming (UI temporary states)", async () => {
    // Set up state including UI temporary states
    act(() => {
      useChatStore.getState().addMessage({ role: "assistant", content: "Test" });
      useChatStore.getState().setIsTyping(true);
      useChatStore.getState().setIsStreaming(true);
    });

    // Wait for persist middleware to write
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check localStorage
    const stored = localStorageMock.getItem("moon-chat-storage");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    // isTyping and isStreaming should NOT be in persisted state
    expect(parsed.state.isTyping).toBeUndefined();
    expect(parsed.state.isStreaming).toBeUndefined();
  });

  it("restores persisted state after rehydration", async () => {
    // Pre-populate localStorage with persisted state
    const persistedState = {
      state: {
        messages: [{ id: "msg-1", role: "assistant", content: "Persisted message", timestamp: 1234567890 }],
        currentState: { step: "size_input" },
        measurementData: { lowerBust: 80, upperBust: 95, bustDifference: 15 },
        auxiliaryData: { height: 170, weight: 60, waist: 70 },
        chestType: "spindle",
        painPoints: ["cup_slipping", "gaping_cup"],
        recommendedProducts: [],
        sessionId: "persisted-session"
      },
      version: 0
    };
    localStorageMock.setItem("moon-chat-storage", JSON.stringify(persistedState));

    // Trigger rehydration by calling persist.rehydrate()
    await useChatStore.persist.rehydrate();

    // Verify state was restored
    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].content).toBe("Persisted message");
    expect(state.currentState).toEqual({ step: "size_input" });
    expect(state.measurementData).toEqual({ lowerBust: 80, upperBust: 95, bustDifference: 15 });
    expect(state.auxiliaryData).toEqual({ height: 170, weight: 60, waist: 70 });
    expect(state.chestType).toBe("spindle");
    expect(state.painPoints).toEqual(["cup_slipping", "gaping_cup"]);
    expect(state.sessionId).toBe("persisted-session");

    // UI states should be reset to initial values, not persisted
    expect(state.isTyping).toBe(false);
    expect(state.isStreaming).toBe(false);
  });

  it("uses storage key 'moon-chat-storage'", async () => {
    act(() => {
      useChatStore.getState().addMessage({ role: "user", content: "test" });
    });

    // Wait for persist middleware to write
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(localStorageMock.getItem("moon-chat-storage")).not.toBeNull();
    expect(localStorageMock.getItem("chat-storage")).toBeNull();
    expect(localStorageMock.getItem("moon-agent-chat")).toBeNull();
  });

  it("provides useChatStoreHydrated hook that returns true after hydration", async () => {
    // The store should already be hydrated in the test environment
    // since the module is loaded at the start
    const { useChatStoreHydrated } = await import("./store");
    
    // Verify the hook exists and is a function
    expect(typeof useChatStoreHydrated).toBe("function");
    
    // Verify persist.hasHydrated returns true (already hydrated)
    expect(useChatStore.persist.hasHydrated()).toBe(true);
  });
});

