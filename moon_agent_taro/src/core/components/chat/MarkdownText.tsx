import { Text, View } from '@tarojs/components';
import { useMemo, type ReactNode } from 'react';

/**
 * MarkdownText - Simple markdown renderer for Taro/mini-program
 *
 * Supports:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - `inline code`
 * - Line breaks (\n within a single segment)
 *
 * This is a lightweight alternative to ReactMarkdown for Taro environment
 * where native HTML elements aren't available.
 *
 * @see Story 3-4-streaming-message-rendering-chat-ui.md (AC: 1 - markdown support)
 */

type TextStyle = 'bold' | 'italic' | 'code' | 'normal';

interface TextSegment {
  text: string;
  style: TextStyle;
}

/**
 * Parse markdown text into styled segments
 *
 * Pattern matching order matters:
 * 1. **bold** or __bold__ (double markers)
 * 2. *italic* or _italic_ (single markers, but not within words)
 * 3. `code` (backticks)
 */
function parseMarkdown(content: string): TextSegment[] {
  // Combined pattern to match markdown syntax in order
  // Group 1: Bold (**text** or __text__)
  // Group 2: Code (`text`)
  // Group 3: Italic (*text* or _text_, not within words)
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__)|(`[^`]+`)|(\*[^*]+\*|_[^_]+_)/g;

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    // Add any text before this match as normal text
    if (match.index > lastIndex) {
      segments.push({
        text: content.slice(lastIndex, match.index),
        style: 'normal',
      });
    }

    const [fullMatch] = match;
    if (match[1]) {
      // Bold: remove ** or __ markers
      segments.push({
        text: fullMatch.slice(2, -2),
        style: 'bold',
      });
    } else if (match[2]) {
      // Code: remove ` markers
      segments.push({
        text: fullMatch.slice(1, -1),
        style: 'code',
      });
    } else if (match[3]) {
      // Italic: remove * or _ markers
      segments.push({
        text: fullMatch.slice(1, -1),
        style: 'italic',
      });
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text after last match
  if (lastIndex < content.length) {
    segments.push({
      text: content.slice(lastIndex),
      style: 'normal',
    });
  }

  return segments;
}

/**
 * Render a single text segment with appropriate styling
 */
function renderSegment(
  segment: TextSegment,
  index: number,
  isUser: boolean
): ReactNode {
  const { text, style } = segment;
  const key = `seg-${index}`;

  // Handle line breaks within text
  const lines = text.split('\n');
  const hasLineBreaks = lines.length > 1;

  const renderText = (content: string, lineKey?: string) => {
    const baseClass = isUser ? 'text-white' : 'text-gray-800';

    switch (style) {
      case 'bold':
        return (
          <Text key={lineKey || key} className={`font-bold ${baseClass}`}>
            {content}
          </Text>
        );
      case 'italic':
        return (
          <Text key={lineKey || key} className={`italic ${baseClass}`}>
            {content}
          </Text>
        );
      case 'code':
        return (
          <Text
            key={lineKey || key}
            className={`font-mono text-sm px-1 rounded ${
              isUser
                ? 'bg-violet-400 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {content}
          </Text>
        );
      default:
        return content;
    }
  };

  if (hasLineBreaks) {
    return (
      <Text key={key}>
        {lines.map((line, lineIdx) => (
          <Text key={`${key}-line-${lineIdx}`}>
            {renderText(line, `${key}-line-${lineIdx}`)}
            {lineIdx < lines.length - 1 && '\n'}
          </Text>
        ))}
      </Text>
    );
  }

  return renderText(text);
}

/**
 * MarkdownText component props
 */
interface MarkdownTextProps {
  /** The markdown content to render */
  content: string;
  /** Whether this is a user message (affects styling) */
  isUser?: boolean;
  /** Additional class names for the container */
  className?: string;
}

/**
 * MarkdownText component
 *
 * Renders markdown-formatted text using native Taro components.
 * Suitable for chat bubbles where rich formatting is needed.
 *
 * @example
 * ```tsx
 * <MarkdownText
 *   content="Hello **world**! This is *important*."
 *   isUser={false}
 * />
 * ```
 */
export function MarkdownText({
  content,
  isUser = false,
  className = '',
}: MarkdownTextProps) {
  const segments = useMemo(() => parseMarkdown(content), [content]);

  if (segments.length === 0) {
    return null;
  }

  // If all segments are normal text with no styling, render simply
  if (segments.every((s) => s.style === 'normal')) {
    return (
      <Text
        className={`text-base leading-relaxed wrap-break-word ${
          isUser ? 'text-white' : 'text-gray-800'
        } ${className}`}
      >
        {content}
      </Text>
    );
  }

  return (
    <View className={`leading-relaxed wrap-break-word ${className}`}>
      <Text
        className={`text-base ${isUser ? 'text-white' : 'text-gray-800'}`}
      >
        {segments.map((segment, index) =>
          renderSegment(segment, index, isUser)
        )}
      </Text>
    </View>
  );
}

export { parseMarkdown };
export type { TextSegment, TextStyle };
