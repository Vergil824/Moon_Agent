import { act } from "@testing-library/react";
import { useUiStore, useChatStore } from "./store";

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
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      isTyping: false,
      isStreaming: false,
      currentState: null,
      measurementData: null,
      auxiliaryData: null,
      chestType: null,
      painPoints: [],
      recommendedProducts: []
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
});

