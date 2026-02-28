import { createSseParser } from "./sse";

describe("sse", () => {
  it("parses events and joins multiline data", () => {
    const p = createSseParser();

    const chunk =
      "event: start\n" +
      'data: {"message":"Starting"}\n' +
      "\n" +
      "event: progress\n" +
      "data: line1\n" +
      "data: line2\n" +
      "\n";

    const events = p.push(chunk);
    expect(events).toEqual([
      { event: "start", data: '{"message":"Starting"}' },
      { event: "progress", data: "line1\nline2" }
    ]);
  });

  it("handles chunk boundaries", () => {
    const p = createSseParser();

    const e1 = p.push("event: message\n" + "data: hel");
    expect(e1).toEqual([]);

    const e2 = p.push("lo\n\n");
    expect(e2).toEqual([{ event: "message", data: "hello" }]);
  });
});


