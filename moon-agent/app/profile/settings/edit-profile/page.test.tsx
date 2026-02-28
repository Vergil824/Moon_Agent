import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditProfilePage from "./page";

// Mock next/navigation
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    refresh: vi.fn(),
  }),
}));

// Mock useUserInfo and useUpdateUserInfo
const mockUseUserInfo = vi.fn();
const mockUpdateMutate = vi.fn();
vi.mock("@/lib/profile/useUser", () => ({
  useUserInfo: () => mockUseUserInfo(),
  useUpdateUserInfo: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

describe("EditProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when user data is loading", () => {
    mockUseUserInfo.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<EditProfilePage />);

    expect(screen.getByText("修改资料")).toBeInTheDocument();
    // Loading spinner should be present
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays user data when loaded", () => {
    mockUseUserInfo.mockReturnValue({
      data: {
        id: 123,
        nickname: "测试用户",
        avatar: "",
        mobile: "13800138000",
      },
      isLoading: false,
    });

    render(<EditProfilePage />);

    const input = screen.getByPlaceholderText("请输入昵称");
    expect(input).toHaveValue("测试用户");
  });

  it("validates nickname is required", async () => {
    mockUseUserInfo.mockReturnValue({
      data: {
        id: 123,
        nickname: "",
        avatar: "",
        mobile: "13800138000",
      },
      isLoading: false,
    });

    render(<EditProfilePage />);

    const submitButton = screen.getByText("保存修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("昵称不能为空")).toBeInTheDocument();
    });

    expect(mockUpdateMutate).not.toHaveBeenCalled();
  });

  it("validates nickname max length", async () => {
    mockUseUserInfo.mockReturnValue({
      data: {
        id: 123,
        nickname: "a".repeat(21),
        avatar: "",
        mobile: "13800138000",
      },
      isLoading: false,
    });

    render(<EditProfilePage />);

    const submitButton = screen.getByText("保存修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("昵称不能超过20个字符")).toBeInTheDocument();
    });
  });

  it("calls update mutation with valid data", async () => {
    mockUseUserInfo.mockReturnValue({
      data: {
        id: 123,
        nickname: "测试用户",
        avatar: "",
        mobile: "13800138000",
      },
      isLoading: false,
    });

    render(<EditProfilePage />);

    const input = screen.getByPlaceholderText("请输入昵称");
    fireEvent.change(input, { target: { value: "新昵称" } });

    const submitButton = screen.getByText("保存修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        { nickname: "新昵称", avatar: undefined },
        expect.any(Object)
      );
    });
  });

  it("navigates back when back button clicked", () => {
    mockUseUserInfo.mockReturnValue({
      data: {
        id: 123,
        nickname: "测试用户",
        avatar: "",
        mobile: "13800138000",
      },
      isLoading: false,
    });

    render(<EditProfilePage />);

    const backButton = screen.getByLabelText("返回");
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("shows character count", () => {
    mockUseUserInfo.mockReturnValue({
      data: {
        id: 123,
        nickname: "测试用户",
        avatar: "",
        mobile: "13800138000",
      },
      isLoading: false,
    });

    render(<EditProfilePage />);

    expect(screen.getByText("4/20")).toBeInTheDocument();
  });
});

