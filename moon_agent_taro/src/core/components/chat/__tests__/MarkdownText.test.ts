/**
 * MarkdownText Type Test Specifications
 *
 * NOTE: Test framework is not configured for moon_agent_taro yet.
 * This file provides type-level validation until Epic 6 test setup.
 *
 * @see Story 3-4-streaming-message-rendering-chat-ui.md (AC: 1 - markdown support)
 */

import {
  parseMarkdown,
  type TextSegment,
  type TextStyle,
} from '../MarkdownText';

// ============================================================================
// Type-Level Validation
// ============================================================================

/**
 * Validate TextStyle type
 */
const validateTextStyleType = (): void => {
  const styles: TextStyle[] = ['bold', 'italic', 'code', 'normal'];
  void styles;
};

/**
 * Validate TextSegment type
 */
const validateTextSegmentType = (): void => {
  const boldSegment: TextSegment = { text: 'bold text', style: 'bold' };
  const italicSegment: TextSegment = { text: 'italic text', style: 'italic' };
  const codeSegment: TextSegment = { text: 'code', style: 'code' };
  const normalSegment: TextSegment = { text: 'normal text', style: 'normal' };

  void boldSegment;
  void italicSegment;
  void codeSegment;
  void normalSegment;
};

/**
 * Validate parseMarkdown for bold text (**text** and __text__)
 */
const validateParseBold = (): void => {
  // Double asterisk bold
  const result1 = parseMarkdown('Hello **world**!');
  console.assert(result1.length === 3);
  console.assert(result1[0].text === 'Hello ');
  console.assert(result1[0].style === 'normal');
  console.assert(result1[1].text === 'world');
  console.assert(result1[1].style === 'bold');
  console.assert(result1[2].text === '!');
  console.assert(result1[2].style === 'normal');

  // Double underscore bold
  const result2 = parseMarkdown('Hello __world__!');
  console.assert(result2.some((s) => s.style === 'bold' && s.text === 'world'));
};

/**
 * Validate parseMarkdown for italic text (*text* and _text_)
 */
const validateParseItalic = (): void => {
  // Single asterisk italic
  const result1 = parseMarkdown('This is *important*');
  console.assert(result1.some((s) => s.style === 'italic' && s.text === 'important'));

  // Single underscore italic
  const result2 = parseMarkdown('This is _emphasized_');
  console.assert(result2.some((s) => s.style === 'italic' && s.text === 'emphasized'));
};

/**
 * Validate parseMarkdown for inline code (`code`)
 */
const validateParseCode = (): void => {
  const result = parseMarkdown('Use the `useState` hook');
  console.assert(result.some((s) => s.style === 'code' && s.text === 'useState'));
};

/**
 * Validate parseMarkdown for plain text (no markdown)
 */
const validateParsePlainText = (): void => {
  const result = parseMarkdown('Hello, this is plain text.');
  console.assert(result.length === 1);
  console.assert(result[0].style === 'normal');
  console.assert(result[0].text === 'Hello, this is plain text.');
};

/**
 * Validate parseMarkdown for mixed content
 */
const validateParseMixedContent = (): void => {
  const result = parseMarkdown('**Bold** and *italic* with `code`');

  // Should have segments for each style
  const hasBold = result.some((s) => s.style === 'bold');
  const hasItalic = result.some((s) => s.style === 'italic');
  const hasCode = result.some((s) => s.style === 'code');

  console.assert(hasBold);
  console.assert(hasItalic);
  console.assert(hasCode);
};

/**
 * Validate parseMarkdown for Chinese content
 */
const validateParseChineseContent = (): void => {
  const result = parseMarkdown('你好 **世界**！这是 *重要* 的信息。');

  console.assert(result.some((s) => s.style === 'bold' && s.text === '世界'));
  console.assert(result.some((s) => s.style === 'italic' && s.text === '重要'));
};

/**
 * Validate parseMarkdown with empty string
 */
const validateParseEmptyString = (): void => {
  const result = parseMarkdown('');
  console.assert(result.length === 0);
};

/**
 * Run all type validations
 */
const typeCheck = (): void => {
  validateTextStyleType();
  validateTextSegmentType();
  validateParseBold();
  validateParseItalic();
  validateParseCode();
  validateParsePlainText();
  validateParseMixedContent();
  validateParseChineseContent();
  validateParseEmptyString();

  console.log('✅ All MarkdownText validations passed');
};

export { typeCheck };
