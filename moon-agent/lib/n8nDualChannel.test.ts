import { createN8nDualChannelJsonlParser, createN8nDualChannelSseParser } from "./n8nDualChannel";

describe("n8nDualChannel", () => {
  it("extracts <STATE> payload from SSE data and hides it from visible text", () => {
    const p = createN8nDualChannelSseParser();

    const sse =
      "event: message\n" +
      'data: <STATE>{"step":"size_input"}</STATE>宝贝\n' +
      "\n";

    const out = p.push(sse);
    expect(out.length).toBe(1);
    expect(out[0].state).toEqual({ step: "size_input" });
    expect(out[0].textDelta).toBe("宝贝");
  });

  it("ignores JSON-only meta events but still parses text events", () => {
    const p = createN8nDualChannelSseParser();

    const sse =
      "event: progress\n" +
      'data: {"step":1}\n' +
      "\n" +
      "event: message\n" +
      "data: hello\n" +
      "\n";

    const out = p.push(sse);
    expect(out).toEqual([{ textDelta: "hello" }]);
  });

  it("extracts <STATE> payload from JSONL item events and hides it from visible text", () => {
    const p = createN8nDualChannelJsonlParser();
    const chunk =
      JSON.stringify({ type: "begin" }) +
      "\n" +
      JSON.stringify({
        type: "item",
        content: '<STATE>{"step":"welcome"}</STATE>来啦宝宝'
      }) +
      "\n" +
      JSON.stringify({ type: "end" }) +
      "\n";

    const out = p.push(chunk);
    expect(out.length).toBe(1);
    expect(out[0].state).toEqual({ step: "welcome" });
    expect(out[0].textDelta).toBe("来啦宝宝");
  });

  it("handles JSONL chunks split across boundaries", () => {
    const p = createN8nDualChannelJsonlParser();

    const line =
      JSON.stringify({
        type: "item",
        content: '<STATE>{"step":"welcome"}</STATE>hi'
      }) + "\n";

    const splitAt = 10;
    const part1 = line.slice(0, splitAt);
    const part2 = line.slice(splitAt);

    expect(p.push(part1)).toEqual([]); // no newline yet
    const out = p.push(part2);
    expect(out.length).toBe(1);
    expect(out[0].state).toEqual({ step: "welcome" });
    expect(out[0].textDelta).toBe("hi");
  });

  it("supports multiple begin/item/end segments in a single JSONL stream (resets <STATE> parser per segment)", () => {
    const p = createN8nDualChannelJsonlParser();

    const chunk =
      JSON.stringify({ type: "begin" }) +
      "\n" +
      JSON.stringify({
        type: "item",
        content: '<STATE>{"step":"welcome"}</STATE>hi'
      }) +
      "\n" +
      JSON.stringify({ type: "end" }) +
      "\n" +
      JSON.stringify({ type: "begin" }) +
      "\n" +
      JSON.stringify({
        type: "item",
        content: '<STATE>{"step":"summary"}</STATE>ok'
      }) +
      "\n" +
      JSON.stringify({ type: "end" }) +
      "\n";

    const out = p.push(chunk);
    expect(out).toEqual([
      { state: { step: "welcome" }, textDelta: "hi" },
      { state: { step: "summary" }, textDelta: "ok" }
    ]);
  });
});


