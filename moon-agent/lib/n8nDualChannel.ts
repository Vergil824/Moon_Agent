import { createStateStreamParser, type StateStreamParserEvent } from "./chatProtocol";
import { createSseParser } from "./sse";

export type DualChannelEvent = StateStreamParserEvent;

function looksLikeJsonPayload(data: string) {
  const t = data.trim();
  return (t.startsWith("{") || t.startsWith("[")) && !t.includes("<STATE>");
}

/**
 * Dual-channel stream parser for n8n `text/event-stream`:
 * - Outer framing: SSE (`event:` / `data:`)
 * - Inner protocol: optional `<STATE>...</STATE>` embedded in streamed text
 *
 * Strategy:
 * - Parse SSE frames into {event, data}
 * - Ignore "meta-ish" JSON-only data payloads (heuristic) unless they contain `<STATE>`
 * - Feed text `data` into the `<STATE>` streaming parser
 */
export function createN8nDualChannelSseParser() {
  const sse = createSseParser();
  const state = createStateStreamParser();

  function push(sseChunk: string): DualChannelEvent[] {
    const out: DualChannelEvent[] = [];
    const events = sse.push(sseChunk);

    for (const e of events) {
      if (!e.data) continue;
      if (e.data === "[DONE]") continue;
      if (looksLikeJsonPayload(e.data)) continue;

      const parsed = state.push(e.data);
      // Only emit when there's something to apply
      if (parsed.state !== undefined || parsed.textDelta) out.push(parsed);
    }

    return out;
  }

  return { push };
}

type N8nJsonlEvent = {
  type?: unknown;
  content?: unknown;
  // Alternative text fields that may carry streamed text
  data?: unknown;
  text?: unknown;
};

/**
 * Dual-channel stream parser for n8n JSONL-like chunked responses:
 * - Each line is a JSON object
 * - We support type: "begin" | "item" | "end"
 * - A single HTTP response may contain multiple begin/item/end segments
 * - To avoid losing state when multiple segments exist, we reset the `<STATE>` parser on "begin" (and also on "end")
 * - Text can be carried in `content` (preferred), and optionally `data`/`text`
 */
export function createN8nDualChannelJsonlParser() {
  let state = createStateStreamParser();
  let buffer = "";

  function extractTextPayload(e: N8nJsonlEvent): string | null {
    if (typeof e.content === "string") return e.content;
    if (typeof e.data === "string") return e.data;
    if (typeof e.text === "string") return e.text;
    return null;
  }

  function push(chunk: string): DualChannelEvent[] {
    buffer += chunk;
    const out: DualChannelEvent[] = [];

    while (true) {
      const idx = buffer.indexOf("\n");
      if (idx === -1) break;

      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;

      let parsed: N8nJsonlEvent | null = null;
      try {
        parsed = JSON.parse(line) as N8nJsonlEvent;
      } catch {
        // If this isn't valid JSON, ignore it (or consider future logging).
        continue;
      }

      const t = typeof parsed?.type === "string" ? parsed.type : "";
      if (t !== "begin" && t !== "item" && t !== "end") continue;

      // Segment boundary: reset the <STATE> parser so multiple segments can each carry their own <STATE>.
      if (t === "begin") {
        state = createStateStreamParser();
      }

      const textPayload = parsed ? extractTextPayload(parsed) : null;
      if (typeof textPayload === "string") {
        const ev = state.push(textPayload);
        if (ev.state !== undefined || ev.textDelta) out.push(ev);
      }

      // Also reset on "end" in case the next segment starts without an explicit "begin".
      if (t === "end") {
        state = createStateStreamParser();
      }
    }

    return out;
  }

  return { push };
}


