import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: mockBack
  })
}));

// Mock useAuth hooks for SMS login
const mockSendSmsCode = vi.fn();
const mockSmsLogin = vi.fn();

vi.mock("@/lib/auth/useAuth", () => ({
  useSendSmsCode: () => ({
    mutate: mockSendSmsCode,
    isPending: false
  }),
  useSmsLogin: () => ({
    mutate: mockSmsLogin,
    isPending: false
  })
}));

// Wrapper component with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("LoginPage (SMS Login)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render card with correct styling", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    // Check for card with white/translucent background
    const card = document.querySelector(".bg-white\\/95.rounded-\\[14px\\]");
    expect(card).toBeInTheDocument();
  });

  it("should render card header with welcome text", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("欢迎回来")).toBeInTheDocument();
    expect(screen.getByText("使用手机号码验证码登录")).toBeInTheDocument();
  });

  it("should render phone number input", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute("type", "tel");
  });

  it("should render SMS code input", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const codeInput = screen.getByPlaceholderText("请输入验证码");
    expect(codeInput).toBeInTheDocument();
  });

  it("should render get SMS code button with purple border", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    expect(getSmsBtn).toBeInTheDocument();
    expect(getSmsBtn).toHaveClass("border-[#8b5cf6]");
    expect(getSmsBtn).toHaveClass("text-[#8b5cf6]");
  });

  it("should render login button with purple background", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const loginBtn = screen.getByRole("button", { name: /登录/i });
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn).toHaveClass("bg-[#8b5cf6]");
  });

  it("should render privacy policy in footer", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/登录即代表同意/)).toBeInTheDocument();
    expect(screen.getByText("用户协议")).toBeInTheDocument();
    expect(screen.getByText("隐私政策")).toBeInTheDocument();
  });

  it("should navigate to welcome page when close button is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const closeBtn = screen.getByRole("button", { name: /关闭/i });
    await user.click(closeBtn);
    
    expect(mockPush).toHaveBeenCalledWith("/welcome");
  });

  it("should disable get SMS code button initially", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    // Button should be disabled until valid phone is entered
    expect(getSmsBtn).toBeDisabled();
  });

  it("should enable get SMS code button when valid phone is entered", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    await user.type(phoneInput, "13800138000");
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    expect(getSmsBtn).not.toBeDisabled();
  });

  it("should call sendSmsCode when get code button is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    await user.type(phoneInput, "13800138000");
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    await user.click(getSmsBtn);
    
    // Should call sendSmsCode with correct params
    expect(mockSendSmsCode).toHaveBeenCalledWith(
      { mobile: "13800138000", scene: 1 },
      expect.any(Object)
    );
  });

  it("should validate phone number format (11 digits required)", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    
    // Type invalid phone number
    await user.type(phoneInput, "123");
    
    // Input should accept the value
    expect(phoneInput).toHaveValue("123");
    // MaxLength should restrict to 11 chars
    expect(phoneInput).toHaveAttribute("maxLength", "11");
  });
});

