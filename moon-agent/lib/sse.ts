export type SseEvent = {
  event: string;
  data: string;
};

/**
 * Minimal incremental Server-Sent Events (SSE) parser.
 * Designed for parsing `text/event-stream` responses read via `fetch()` streams.
 *
 * Notes:
 * - Events are separated by a blank line.
 * - `data:` can appear multiple times; all lines are joined with `\n`.
 * - Unknown fields (id/retry) are ignored.
 */
export function createSseParser() {
  let buffer = "";
  let currentEvent = "message";
  let dataLines: string[] = [];

  function dispatch(events: SseEvent[]) {
    if (dataLines.length === 0) {
      currentEvent = "message";
      return;
    }
    events.push({ event: currentEvent, data: dataLines.join("\n") });
    currentEvent = "message";
    dataLines = [];
  }

  function push(chunk: string): SseEvent[] {
    buffer += chunk;
    const events: SseEvent[] = [];

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (let rawLine of lines) {
      if (rawLine.endsWith("\r")) rawLine = rawLine.slice(0, -1);

      // blank line → end of event
      if (rawLine === "") {
        dispatch(events);
        continue;
      }

      // comment line
      if (rawLine.startsWith(":")) continue;

      const idx = rawLine.indexOf(":");
      const field = idx === -1 ? rawLine : rawLine.slice(0, idx);
      let value = idx === -1 ? "" : rawLine.slice(idx + 1);
      if (value.startsWith(" ")) value = value.slice(1);

      if (field === "event") currentEvent = value || "message";
      if (field === "data") dataLines.push(value);
    }

    return events;
  }

  return { push };
}


