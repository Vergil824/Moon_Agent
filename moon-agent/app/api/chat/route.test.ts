import { vi } from "vitest";

import { POST } from "./route";

describe("/api/chat route", () => {
  it("returns 400 when sessionId/chatInput missing", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: "", chatInput: "" })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("proxies streaming response from n8n", async () => {
    const oldFetch = globalThis.fetch;
    const oldEnv = process.env.N8N_WEBHOOK_URL;

    process.env.N8N_WEBHOOK_URL = "https://example.com/webhook";

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode('<STATE>{"step":"size_input"}</STATE>宝贝')
        );
        controller.close();
      }
    });

    const n8nResp = new Response(stream, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });

    globalThis.fetch = vi.fn().mockResolvedValue(n8nResp) as unknown as typeof fetch;

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: "s1", chatInput: "hi" })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");

    const text = await res.text();
    expect(text).toContain("<STATE>");
    expect(text).toContain("宝贝");

    globalThis.fetch = oldFetch;
    process.env.N8N_WEBHOOK_URL = oldEnv;
  });
});


