"use client";

/**
 * ChatHeader - Top header bar with brand title
 * Story 1.4: AC 2 - Top title bar (ChatHeader)
 *
 * Requirements:
 * - Fixed at top (sticky or absolute)
 * - Background: pure white with bottom border #e5e7eb
 * - Title "满月 Moon" in #8b5cf6, 18px, bold
 * - Shadow: 0px 1px 3px 0px rgba(0,0,0,0.1)
 */
export default function ChatHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full bg-white border-b border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
    >
      <div className="flex h-14 items-center justify-center px-4">
        <h1 className="text-lg font-bold text-moon-purple">满月 Moon</h1>
      </div>
    </header>
  );
}

