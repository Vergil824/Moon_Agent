import { describe, it, expect, vi, beforeEach } from "vitest";
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

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} data-testid="background-image" />
  )
}));

// Mock useAuth hooks
vi.mock("@/lib/auth/useAuth", () => ({
  usePasswordLogin: () => ({
    mutate: vi.fn(),
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

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render background with blur overlay", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    // Check for backdrop blur overlay
    const overlay = document.querySelector(".backdrop-blur-\\[5px\\]");
    expect(overlay).toBeInTheDocument();
  });

  it("should render white card with correct styling", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const card = document.querySelector(".bg-white.rounded-\\[14px\\]");
    expect(card).toBeInTheDocument();
  });

  it("should render card header with welcome text", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("欢迎回来")).toBeInTheDocument();
    expect(screen.getByText("使用手机号码登录您的账户")).toBeInTheDocument();
  });

  it("should render phone number input", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const phoneInput = screen.getByPlaceholderText("请输入11位手机号");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute("type", "tel");
  });

  it("should render password input", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const passwordInput = screen.getByPlaceholderText("请输入密码");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should render login button with purple color", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const loginBtn = screen.getByRole("button", { name: /登录/i });
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn).toHaveClass("bg-[#8b5cf6]");
  });

  it("should render register link in footer", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("还没有账号?")).toBeInTheDocument();
    expect(screen.getByText("立即注册")).toBeInTheDocument();
  });

  it("should navigate to register page when register link is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const registerLink = screen.getByText("立即注册");
    await user.click(registerLink);
    
    expect(mockPush).toHaveBeenCalledWith("/register");
  });

  it("should navigate to welcome page when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const closeBtn = screen.getByRole("button", { name: /关闭/i });
    await user.click(closeBtn);
    
    expect(mockPush).toHaveBeenCalledWith("/welcome");
  });

  it("should validate phone number format (11 digits required)", async () => {
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

  it("should have password input with hidden type", async () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const passwordInput = screen.getByPlaceholderText("请输入密码");
    
    // Password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

