import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfilePage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock useUserInfo hook
const mockUseUserInfo = vi.fn();
vi.mock("@/lib/profile/useUser", () => ({
  useUserInfo: () => mockUseUserInfo(),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton while loading session", () => {
    mockUseSession.mockReturnValue({ status: "loading", data: null });
    mockUseUserInfo.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<ProfilePage />);

    // Check for skeleton loading state (animate-pulse class)
    const page = screen.getByTestId("profile-page");
    expect(page).toBeInTheDocument();
    expect(page.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders skeleton while loading user data", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseUserInfo.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<ProfilePage />);

    const page = screen.getByTestId("profile-page");
    expect(page.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("redirects to welcome page when unauthenticated", () => {
    mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
    mockUseUserInfo.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);

    expect(mockPush).toHaveBeenCalledWith("/welcome");
  });

  it("renders user info when authenticated and data loaded", () => {
    const mockUser = {
      id: 123,
      nickname: "测试用户",
      avatar: "https://example.com/avatar.jpg",
      mobile: "13800138000",
      sex: 1,
      birthday: null,
      areaId: null,
      areaName: null,
      mark: null,
      point: 100,
      experience: 50,
      levelId: 1,
      levelName: "VIP1",
      groupId: null,
      groupName: null,
    };

    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseUserInfo.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);

    // Check for user nickname
    expect(screen.getByText("测试用户")).toBeInTheDocument();
    // Check for user ID
    expect(screen.getByText("ID: 123")).toBeInTheDocument();
  });

  it("renders menu items when authenticated", () => {
    const mockUser = {
      id: 123,
      nickname: "测试用户",
      avatar: "",
      mobile: "13800138000",
      sex: 0,
      birthday: null,
      areaId: null,
      areaName: null,
      mark: null,
      point: 0,
      experience: 0,
      levelId: null,
      levelName: null,
      groupId: null,
      groupName: null,
    };

    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseUserInfo.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);

    // Check for menu items
    expect(screen.getByText("我的订单")).toBeInTheDocument();
    expect(screen.getByText("我的售后")).toBeInTheDocument();
    expect(screen.getByText("收货地址")).toBeInTheDocument();
    expect(screen.getByText("关于我们")).toBeInTheDocument();
    expect(screen.getByText("设置")).toBeInTheDocument();
  });

  it("renders error state with reload button", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseUserInfo.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<ProfilePage />);

    expect(screen.getByText("加载失败，请稍后重试")).toBeInTheDocument();
    expect(screen.getByText("重新加载")).toBeInTheDocument();
  });

  it("renders default avatar when user has no avatar", () => {
    const mockUser = {
      id: 456,
      nickname: "无头像用户",
      avatar: "",
      mobile: "13900139000",
      sex: 0,
      birthday: null,
      areaId: null,
      areaName: null,
      mark: null,
      point: 0,
      experience: 0,
      levelId: null,
      levelName: null,
      groupId: null,
      groupName: null,
    };

    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseUserInfo.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);

    // User icon should be rendered for default avatar
    expect(screen.getByText("无头像用户")).toBeInTheDocument();
  });

  it("has correct link hrefs for menu items", () => {
    const mockUser = {
      id: 123,
      nickname: "测试用户",
      avatar: "",
      mobile: "13800138000",
      sex: 0,
      birthday: null,
      areaId: null,
      areaName: null,
      mark: null,
      point: 0,
      experience: 0,
      levelId: null,
      levelName: null,
      groupId: null,
      groupName: null,
    };

    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockUseUserInfo.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);

    // Check link hrefs
    expect(screen.getByText("我的订单").closest("a")).toHaveAttribute(
      "href",
      "/profile/orders"
    );
    expect(screen.getByText("收货地址").closest("a")).toHaveAttribute(
      "href",
      "/profile/addresses"
    );
    expect(screen.getByText("设置").closest("a")).toHaveAttribute(
      "href",
      "/profile/settings"
    );
  });
});

