/**
 * Dual-Channel Stream Parsers for n8n Responses
 *
 * Provides parsers for both SSE and JSONL response formats from n8n,
 * while extracting the <STATE> protocol from the text content.
 *
 * Ported from: moon-agent/lib/chat/n8nDualChannel.ts
 *
 * @see docs/sprint-artifacts/taro-migration/stories/3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */

import { createSseParser } from './sse';
import { createStateStreamParser, type StateStreamParserEvent } from './protocol';

/**
 * Event emitted by dual-channel parsers
 */
export type DualChannelEvent = StateStreamParserEvent;

/**
 * Heuristic to detect JSON-only meta payloads that should be ignored
 * Note: We no longer skip JSON payloads - they may contain content in the "content" field
 */
function looksLikeJsonPayload(_data: string): boolean {
  // Previously this would skip JSON payloads without <STATE>
  // But now payment_interface wraps JSONL as SSE, so JSON data contains actual content
  // We handle JSON extraction in the SSE parser instead
  return false;
}

/**
 * Try to extract text content from a JSON payload (e.g., n8n JSONL wrapped as SSE)
 * Returns null if:
 * - Not a valid JSON
 * - type is "begin" or "end" (metadata events, no content)
 * - No content field
 */
function extractContentFromJson(data: string): string | null {
  const t = data.trim();
  if (!t.startsWith('{')) return null;
  
  try {
    const parsed = JSON.parse(t);
    
    // Skip "begin" and "end" events - they don't contain actual content
    if (parsed?.type === 'begin' || parsed?.type === 'end') {
      return null;
    }
    
    // Handle n8n JSONL format: { type: "item", content: "..." }
    if (typeof parsed?.content === 'string') {
      return parsed.content;
    }
    // Handle alternative field names
    if (typeof parsed?.data === 'string') {
      return parsed.data;
    }
    if (typeof parsed?.text === 'string') {
      return parsed.text;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a dual-channel SSE parser for n8n `text/event-stream` responses.
 *
 * Strategy:
 * - Parse SSE frames into {event, data}
 * - Ignore "meta-ish" JSON-only data payloads (heuristic) unless they contain `<STATE>`
 * - Feed text `data` into the `<STATE>` streaming parser
 *
 * @returns Parser instance with push method
 *
 * @example
 * ```ts
 * const parser = createDualChannelSseParser();
 *
 * // Process SSE chunks
 * const events = parser.push('data: Hello\n\n');
 * // events = [{ textDelta: 'Hello' }]
 * ```
 */
export function createDualChannelSseParser() {
  const sse = createSseParser();
  const state = createStateStreamParser();

  /**
   * Push a chunk of SSE data and get parsed events
   *
   * @param sseChunk - Raw SSE text chunk
   * @returns Array of dual-channel events
   */
  function push(sseChunk: string): DualChannelEvent[] {
    const out: DualChannelEvent[] = [];
    const events = sse.push(sseChunk);

    for (const e of events) {
      if (!e.data) continue;
      // Skip [DONE] marker
      if (e.data === '[DONE]') continue;
      // Skip JSON metadata payloads (legacy check, currently disabled)
      if (looksLikeJsonPayload(e.data)) continue;

      // Try to extract content from JSON payload (n8n JSONL wrapped as SSE)
      // e.g., payment_interface returns: data: {"type":"item","content":"Hello"}\n\n
      // Returns null for "begin"/"end" events or if no content field
      const jsonContent = extractContentFromJson(e.data);
      
      // If it's a JSON payload but extraction returned null (begin/end/no content),
      // skip this event entirely
      if (e.data.trim().startsWith('{') && jsonContent === null) {
        continue;
      }
      
      // Use extracted content if available, otherwise use raw data (for non-JSON)
      const textToParse = jsonContent !== null ? jsonContent : e.data;

      // Skip empty content
      if (!textToParse) continue;

      const parsed = state.push(textToParse);
      // Only emit when there's something to apply
      if (parsed.state !== undefined || parsed.textDelta) {
        out.push(parsed);
      }
    }

    return out;
  }

  return { push };
}

/**
 * JSONL event structure from n8n
 */
interface N8nJsonlEvent {
  type?: unknown;
  content?: unknown;
  // Alternative text fields that may carry streamed text
  data?: unknown;
  text?: unknown;
}

/**
 * Create a dual-channel JSONL parser for n8n chunked responses.
 *
 * Strategy:
 * - Each line is a JSON object
 * - Support type: "begin" | "item" | "end"
 * - Reset the `<STATE>` parser on "begin" and "end" for multiple segments
 * - Text can be carried in `content` (preferred), `data`, or `text`
 *
 * @returns Parser instance with push method
 *
 * @example
 * ```ts
 * const parser = createDualChannelJsonlParser();
 *
 * // Process JSONL chunks
 * const events = parser.push('{"type":"item","content":"Hello"}\n');
 * // events = [{ textDelta: 'Hello' }]
 * ```
 */
export function createDualChannelJsonlParser() {
  let state = createStateStreamParser();
  let buffer = '';

  /**
   * Extract text payload from various possible fields
   */
  function extractTextPayload(e: N8nJsonlEvent): string | null {
    if (typeof e.content === 'string') return e.content;
    if (typeof e.data === 'string') return e.data;
    if (typeof e.text === 'string') return e.text;
    return null;
  }

  /**
   * Push a chunk of JSONL data and get parsed events
   *
   * @param chunk - Raw JSONL text chunk
   * @returns Array of dual-channel events
   */
  function push(chunk: string): DualChannelEvent[] {
    buffer += chunk;
    const out: DualChannelEvent[] = [];

    while (true) {
      const idx = buffer.indexOf('\n');
      if (idx === -1) break;

      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;

      let parsed: N8nJsonlEvent | null = null;
      try {
        parsed = JSON.parse(line) as N8nJsonlEvent;
      } catch {
        // If this isn't valid JSON, ignore it
        continue;
      }

      const t = typeof parsed?.type === 'string' ? parsed.type : '';
      if (t !== 'begin' && t !== 'item' && t !== 'end') continue;

      // Segment boundary: reset the <STATE> parser
      if (t === 'begin') {
        state = createStateStreamParser();
      }

      const textPayload = parsed ? extractTextPayload(parsed) : null;
      if (typeof textPayload === 'string') {
        const ev = state.push(textPayload);
        if (ev.state !== undefined || ev.textDelta) {
          out.push(ev);
        }
      }

      // Also reset on "end" for next segment
      if (t === 'end') {
        state = createStateStreamParser();
      }
    }

    return out;
  }

  return { push };
}

/**
 * Detect response content type and create appropriate parser
 *
 * @param contentType - Content-Type header value
 * @returns Appropriate dual-channel parser
 */
export function createDualChannelParser(contentType: string | null) {
  // Default to SSE parser if content type indicates event-stream
  if (contentType?.includes('text/event-stream')) {
    return createDualChannelSseParser();
  }
  // Use JSONL parser for JSON-based responses
  if (contentType?.includes('application/json') || contentType?.includes('application/x-ndjson')) {
    return createDualChannelJsonlParser();
  }
  // Default to SSE parser (most common case)
  return createDualChannelSseParser();
}
