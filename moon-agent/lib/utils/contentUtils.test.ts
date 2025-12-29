import { describe, it, expect } from "vitest";
import { hasVisibleContent, filterVisibleSegments } from "@/lib/utils/contentUtils";

describe("hasVisibleContent", () => {
  it("returns false for empty string", () => {
    expect(hasVisibleContent("")).toBe(false);
  });

  it("returns false for whitespace-only content", () => {
    expect(hasVisibleContent("   ")).toBe(false);
    expect(hasVisibleContent("\n\n")).toBe(false);
    expect(hasVisibleContent("\t\n  ")).toBe(false);
  });

  it("returns false for markdown horizontal rule (---)", () => {
    expect(hasVisibleContent("---")).toBe(false);
    expect(hasVisibleContent("---\n")).toBe(false);
    expect(hasVisibleContent("  ---  ")).toBe(false);
  });

  it("returns false for markdown horizontal rule (***)", () => {
    expect(hasVisibleContent("***")).toBe(false);
    expect(hasVisibleContent("****")).toBe(false);
  });

  it("returns false for markdown horizontal rule (___)", () => {
    expect(hasVisibleContent("___")).toBe(false);
    expect(hasVisibleContent("____")).toBe(false);
  });

  it("returns true for normal text", () => {
    expect(hasVisibleContent("Hello")).toBe(true);
    expect(hasVisibleContent("都会到处乱跑")).toBe(true);
  });

  it("returns true for text with markdown formatting", () => {
    expect(hasVisibleContent("**bold**")).toBe(true);
    expect(hasVisibleContent("*italic*")).toBe(true);
    expect(hasVisibleContent("# Heading")).toBe(true);
  });

  it("returns true for text with horizontal rule mixed in", () => {
    expect(hasVisibleContent("Hello\n---\nWorld")).toBe(true);
    expect(hasVisibleContent("---\n接着测算你的身")).toBe(true);
  });

  it("returns false for undefined/null", () => {
    expect(hasVisibleContent(undefined as unknown as string)).toBe(false);
    expect(hasVisibleContent(null as unknown as string)).toBe(false);
  });
});

describe("filterVisibleSegments", () => {
  it("filters out empty segments", () => {
    const segments = ["Hello", "", "World"];
    expect(filterVisibleSegments(segments)).toEqual(["Hello", "World"]);
  });

  it("filters out horizontal rules", () => {
    const segments = ["Hello", "---", "World"];
    expect(filterVisibleSegments(segments)).toEqual(["Hello", "World"]);
  });

  it("filters out whitespace-only segments", () => {
    const segments = ["Hello", "   ", "\n", "World"];
    expect(filterVisibleSegments(segments)).toEqual(["Hello", "World"]);
  });

  it("keeps segments with text + hr mixed", () => {
    const segments = ["Hello", "---\nMore text"];
    expect(filterVisibleSegments(segments)).toEqual(["Hello", "---\nMore text"]);
  });

  it("returns empty array when all segments are invisible", () => {
    const segments = ["---", "   ", "***"];
    expect(filterVisibleSegments(segments)).toEqual([]);
  });
});

