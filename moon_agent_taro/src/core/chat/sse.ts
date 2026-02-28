/**
 * Server-Sent Events (SSE) Parser
 *
 * Minimal incremental SSE parser for parsing `text/event-stream` responses
 * read via fetch() streams on H5 platform.
 *
 * Ported from: moon-agent/lib/chat/sse.ts
 *
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 */

/**
 * Parsed SSE event structure
 */
export interface SseEvent {
  /** Event type (defaults to "message" if not specified) */
  event: string;
  /** Event data payload */
  data: string;
}

/**
 * Create an incremental SSE parser.
 *
 * Parser notes:
 * - Events are separated by a blank line
 * - `data:` can appear multiple times; all lines are joined with `\n`
 * - Unknown fields (id/retry) are ignored for simplicity
 *
 * @returns Parser instance with push method
 *
 * @example
 * ```ts
 * const parser = createSseParser();
 *
 * // Process chunks as they arrive from fetch stream
 * const events = parser.push('event: message\ndata: hello\n\n');
 * // events = [{ event: 'message', data: 'hello' }]
 * ```
 */
export function createSseParser() {
  let buffer = '';
  let currentEvent = 'message';
  let dataLines: string[] = [];

  function dispatch(events: SseEvent[]) {
    if (dataLines.length === 0) {
      currentEvent = 'message';
      return;
    }
    events.push({ event: currentEvent, data: dataLines.join('\n') });
    currentEvent = 'message';
    dataLines = [];
  }

  /**
   * Push a chunk of SSE data and get parsed events
   *
   * @param chunk - Raw SSE text chunk
   * @returns Array of parsed events (may be empty if event is incomplete)
   */
  function push(chunk: string): SseEvent[] {
    buffer += chunk;
    const events: SseEvent[] = [];

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (let rawLine of lines) {
      // Handle CRLF line endings
      if (rawLine.endsWith('\r')) rawLine = rawLine.slice(0, -1);

      // Blank line → end of event
      if (rawLine === '') {
        dispatch(events);
        continue;
      }

      // Comment line (starts with :)
      if (rawLine.startsWith(':')) continue;

      // Parse field:value
      const idx = rawLine.indexOf(':');
      const field = idx === -1 ? rawLine : rawLine.slice(0, idx);
      let value = idx === -1 ? '' : rawLine.slice(idx + 1);
      // Remove leading space after colon (per SSE spec)
      if (value.startsWith(' ')) value = value.slice(1);

      // Handle known fields
      if (field === 'event') currentEvent = value || 'message';
      if (field === 'data') dataLines.push(value);
      // Note: 'id' and 'retry' fields are intentionally ignored
    }

    return events;
  }

  return { push };
}

/**
 * Parse a complete SSE response string into events
 *
 * Convenience function for non-streaming use cases (e.g., testing)
 *
 * @param sseText - Complete SSE response text
 * @returns Array of all parsed events
 */
export function parseSseResponse(sseText: string): SseEvent[] {
  const parser = createSseParser();
  // Ensure trailing newlines for complete parsing
  return parser.push(sseText + '\n\n');
}
