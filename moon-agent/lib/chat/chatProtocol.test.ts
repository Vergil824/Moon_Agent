import { createStateStreamParser, parseStateTaggedText } from "./chatProtocol";

describe("chatProtocol", () => {
  it("parseStateTaggedText extracts state and hides <STATE> tag from text", () => {
    const input =
      '<STATE>{"step":"size_input"}</STATE>宝贝，撑撑姐教你先测量...';
    const result = parseStateTaggedText(input);

    expect(result.state).toEqual({ step: "size_input" });
    expect(result.text).toBe("宝贝，撑撑姐教你先测量...");
    expect(result.text).not.toContain("<STATE>");
  });

  it("createStateStreamParser emits state as soon as </STATE> is received, never leaking tag content", () => {
    const parser = createStateStreamParser();

    const e1 = parser.push("<STA");
    expect(e1.textDelta).toBe("");

    const e2 = parser.push('TE>{"step":"size_input"}');
    expect(e2.textDelta).toBe("");

    const e3 = parser.push("</STATE>宝贝");
    expect(e3.state).toEqual({ step: "size_input" });
    expect(e3.textDelta).toBe("宝贝");
    expect(e3.textDelta).not.toContain("<STATE>");
    expect(e3.textDelta).not.toContain("step");

    const e4 = parser.push("，撑撑姐教你");
    expect(e4.state).toBeUndefined();
    expect(e4.textDelta).toBe("，撑撑姐教你");
  });
});


