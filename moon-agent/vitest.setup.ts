import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

// next/font requires fonts to be initialized at module scope in Next.js runtime.
// In Vitest, we mock it to avoid invoking Next.js font loader internals.
vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "font-inter" })
}));

// Mock next-auth/react for all tests
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: {
      user: { id: "1", mobile: "13800138000" },
      accessToken: "test-token"
    },
    status: "authenticated"
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock the auth module to avoid importing next-auth server code
vi.mock("@/lib/auth/auth", () => ({
  getAuth: vi.fn(() => Promise.resolve({
    user: { id: "1", mobile: "13800138000" },
    accessToken: "test-token"
  })),
  authOptions: {}
}));

// Story 2.5: Mock storage for persistence tests
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  writable: true
});

// Story 2.6: Mock scrollIntoView for JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Export for tests to access
(globalThis as unknown as { localStorageMock: typeof localStorageMock }).localStorageMock = localStorageMock;
(globalThis as unknown as { sessionStorageMock: typeof sessionStorageMock }).sessionStorageMock = sessionStorageMock;

