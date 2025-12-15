/**
 * Content utility functions for message processing
 */

/**
 * Check if content has meaningful visible text after rendering
 * 
 * This handles:
 * - Whitespace-only content
 * - Markdown horizontal rules (---, ***, ___)
 * - Empty markdown elements
 * 
 * @param content - The raw content string
 * @returns true if content will render visible text
 */
export function hasVisibleContent(content: string): boolean {
  if (!content) return false;

  // Remove markdown horizontal rules (3+ of -, *, or _)
  // These render as <hr> with no visible text
  // Handles optional leading/trailing whitespace on the line
  const withoutHr = content.replace(/^\s*[-*_]{3,}\s*$/gm, "");

  // Remove remaining whitespace and check if anything is left
  const trimmed = withoutHr.trim();

  return trimmed.length > 0;
}

/**
 * Filter segments to only include those with visible content
 * 
 * @param segments - Array of content segments
 * @returns Filtered array with only meaningful segments
 */
export function filterVisibleSegments(segments: string[]): string[] {
  return segments.filter(hasVisibleContent);
}

