import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

// next/font requires fonts to be initialized at module scope in Next.js runtime.
// In Vitest, we mock it to avoid invoking Next.js font loader internals.
vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "font-inter" })
}));

