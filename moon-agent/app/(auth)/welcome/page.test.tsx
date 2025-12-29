import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WelcomePage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn()
  })
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} data-testid="background-image" />
  )
}));

describe("WelcomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render background image", () => {
    render(<WelcomePage />);
    
    const bgImage = screen.getByTestId("background-image");
    expect(bgImage).toBeInTheDocument();
    expect(bgImage).toHaveAttribute(
      "src",
      expect.stringContaining("Screenshot")
    );
  });

  it("should render WeChat login button with correct styling", () => {
    render(<WelcomePage />);
    
    const wechatBtn = screen.getByRole("button", { name: /微信一键登录/i });
    expect(wechatBtn).toBeInTheDocument();
    expect(wechatBtn).toHaveClass("bg-[#07c160]");
  });

  it("should render phone login button with correct styling", () => {
    render(<WelcomePage />);
    
    const phoneBtn = screen.getByRole("button", { name: /手机号码登录/i });
    expect(phoneBtn).toBeInTheDocument();
    expect(phoneBtn).toHaveClass("bg-white/10");
    expect(phoneBtn).toHaveClass("border-white/30");
  });

  it("should render privacy policy text with links", () => {
    render(<WelcomePage />);
    
    expect(screen.getByText(/登录即代表同意/i)).toBeInTheDocument();
    
    const userAgreementLink = screen.getByText("用户协议");
    expect(userAgreementLink).toBeInTheDocument();
    expect(userAgreementLink).toHaveClass("underline");
    
    const privacyPolicyLink = screen.getByText("隐私政策");
    expect(privacyPolicyLink).toBeInTheDocument();
    expect(privacyPolicyLink).toHaveClass("underline");
  });

  it("should navigate to login page when phone login button is clicked", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);
    
    const phoneBtn = screen.getByRole("button", { name: /手机号码登录/i });
    await user.click(phoneBtn);
    
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should not navigate when WeChat button is clicked (placeholder)", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);
    
    const wechatBtn = screen.getByRole("button", { name: /微信一键登录/i });
    await user.click(wechatBtn);
    
    // WeChat login is not implemented, should not navigate
    expect(mockPush).not.toHaveBeenCalled();
  });
});

