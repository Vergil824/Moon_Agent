export type ParsedStatePayload = Record<string, unknown>;

export type ParsedStateTaggedText = {
  state: ParsedStatePayload | null;
  text: string;
};

/**
 * Parse a full response string that may contain a single <STATE>...</STATE> JSON tag.
 * The <STATE> tag content must be hidden from the chat bubble; only `text` should be displayed.
 */
export function parseStateTaggedText(input: string): ParsedStateTaggedText {
  const match = /<STATE>(.*?)<\/STATE>/s.exec(input);
  if (!match) return { state: null, text: input };

  const rawJson = match[1] ?? "";
  let state: ParsedStatePayload | null = null;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      state = parsed as ParsedStatePayload;
    }
  } catch {
    state = null;
  }

  const text = input.replace(match[0], "");
  return { state, text };
}

export type StateStreamParserEvent = {
  /**
   * When present: parsed state object emitted at the moment </STATE> becomes available.
   */
  state?: ParsedStatePayload | null;
  /**
   * Visible text delta to append to the chat bubble (must never include <STATE> tag content).
   */
  textDelta: string;
};

/**
 * Incremental stream parser for the <STATE> protocol.
 * It is designed to:
 * - never leak <STATE> tag content into visible text
 * - emit `state` immediately once </STATE> is fully received
 */
export function createStateStreamParser() {
  let buffer = "";
  let stateEmitted = false;

  const startTag = "<STATE>";
  const endTag = "</STATE>";
  const keepTail = startTag.length - 1; // prevent leaking partial start tag

  function push(chunk: string): StateStreamParserEvent {
    buffer += chunk;

    // After state is emitted, everything is normal visible text.
    if (stateEmitted) {
      const textDelta = buffer;
      buffer = "";
      return { textDelta };
    }

    const startIdx = buffer.indexOf(startTag);

    // No start tag yet:
    // Emit everything that's safe, but keep a potential partial "<STATE>" prefix if it exists.
    if (startIdx === -1) {
      const lastLt = buffer.lastIndexOf("<");
      if (lastLt === -1) {
        const textDelta = buffer;
        buffer = "";
        return { textDelta };
      }

      const tail = buffer.slice(lastLt);
      // Keep only if tail might be the beginning of "<STATE>"
      if (startTag.startsWith(tail)) {
        const textDelta = buffer.slice(0, lastLt);
        buffer = tail;
        return { textDelta };
      }

      const textDelta = buffer;
      buffer = "";
      return { textDelta };
    }

    // Start tag found: emit anything before it (safe visible text), keep from "<STATE>" onwards in buffer
    const before = buffer.slice(0, startIdx);
    buffer = buffer.slice(startIdx);

    const endIdx = buffer.indexOf(endTag);
    if (endIdx === -1) {
      return { textDelta: before };
    }

    // We have a complete <STATE>...</STATE>
    const jsonStart = startTag.length;
    const rawJson = buffer.slice(jsonStart, endIdx);

    let state: ParsedStatePayload | null = null;
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        state = parsed as ParsedStatePayload;
      }
    } catch {
      state = null;
    }

    const after = buffer.slice(endIdx + endTag.length);
    stateEmitted = true;

    // We already return `after` as visible text delta, so do not keep it in buffer,
    // otherwise it would be emitted again on the next push().
    buffer = "";

    return { state, textDelta: before + after };
  }

  return { push };
}


