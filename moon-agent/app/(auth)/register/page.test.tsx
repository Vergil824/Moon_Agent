import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterPage from "./page";

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

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} data-testid="background-image" />
  )
}));

// Mock useAuth hooks
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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render card with pink theme", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    // Check for pink themed title
    const title = screen.getByText("创建新账号");
    expect(title).toHaveClass("text-[#ec4899]");
  });

  it("should render card description", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("填写以下信息完成注册")).toBeInTheDocument();
  });

  it("should render phone number input", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute("type", "tel");
  });

  it("should render SMS code input", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const codeInput = screen.getByPlaceholderText("4位验证码");
    expect(codeInput).toBeInTheDocument();
  });

  it("should render get SMS code button with pink border", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    expect(getSmsBtn).toBeInTheDocument();
    expect(getSmsBtn).toHaveClass("border-[#ec4899]");
    expect(getSmsBtn).toHaveClass("text-[#ec4899]");
  });

  it("should render register button with pink background", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const registerBtn = screen.getByRole("button", { name: /注册并登录/i });
    expect(registerBtn).toBeInTheDocument();
    expect(registerBtn).toHaveClass("bg-[#ec4899]");
  });

  it("should render login link in footer", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("已有账号?")).toBeInTheDocument();
    expect(screen.getByText("去登录")).toBeInTheDocument();
  });

  it("should navigate to login page when login link is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const loginLink = screen.getByText("去登录");
    await user.click(loginLink);
    
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should navigate to welcome page when close button is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const closeBtn = screen.getByRole("button", { name: /关闭/i });
    await user.click(closeBtn);
    
    expect(mockPush).toHaveBeenCalledWith("/welcome");
  });

  it("should disable get SMS code button initially", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    // Button should be disabled until valid phone is entered
    expect(getSmsBtn).toBeDisabled();
  });

  it("should enable get SMS code button when valid phone is entered", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    await user.type(phoneInput, "13800138000");
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    expect(getSmsBtn).not.toBeDisabled();
  });

  it("should call sendSmsCode when get code button is clicked", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    await user.type(phoneInput, "13800138000");
    
    const getSmsBtn = screen.getByRole("button", { name: /获取验证码/i });
    await user.click(getSmsBtn);
    
    // Should call sendSmsCode with correct params
    expect(mockSendSmsCode).toHaveBeenCalledWith(
      { mobile: "13800138000", scene: 2 },
      expect.any(Object)
    );
  });
});

