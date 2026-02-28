import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: vi.fn(),
  }),
}));

// Mock useLogout
const mockLogout = vi.fn();
vi.mock("@/lib/auth/useAuth", () => ({
  useLogout: () => ({
    mutate: mockLogout,
    isPending: false,
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings page with all menu items", () => {
    render(<SettingsPage />);

    expect(screen.getByText("设置")).toBeInTheDocument();
    expect(screen.getByText("修改个人信息")).toBeInTheDocument();
    expect(screen.getByText("修改密码")).toBeInTheDocument();
    expect(screen.getByText("退出登录")).toBeInTheDocument();
  });

  it("has correct link hrefs", () => {
    render(<SettingsPage />);

    expect(screen.getByText("修改个人信息").closest("a")).toHaveAttribute(
      "href",
      "/profile/settings/edit-profile"
    );
    expect(screen.getByText("修改密码").closest("a")).toHaveAttribute(
      "href",
      "/profile/settings/change-password"
    );
  });

  it("calls router.back when back button clicked", () => {
    render(<SettingsPage />);

    const backButton = screen.getByLabelText("返回");
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("calls logout mutation when logout button clicked", () => {
    render(<SettingsPage />);

    const logoutButton = screen.getByText("退出登录");
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});

