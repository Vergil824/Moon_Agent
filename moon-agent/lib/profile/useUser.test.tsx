import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useUserInfo, USER_INFO_QUERY_KEY } from "./useUser";

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock api module for ApiError
vi.mock('@/lib/core/api', () => ({
  ApiError: class ApiError extends Error {
    code: number;
    constructor(code: number, message: string) {
      super(message);
      this.code = code;
      this.name = "ApiError";
    }
  },
}));

// Mock userApi
const mockGetUserInfo = vi.fn();
vi.mock('@/lib/profile/userApi', () => ({
  getUserInfo: (token: string) => mockGetUserInfo(token),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useUserInfo", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("should not fetch when session is loading", () => {
    mockUseSession.mockReturnValue({ status: "loading", data: null });

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockGetUserInfo).not.toHaveBeenCalled();
  });

  it("should not fetch when unauthenticated", () => {
    mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockGetUserInfo).not.toHaveBeenCalled();
  });

  it("should fetch user info when authenticated", async () => {
    const mockUser = {
      id: 123,
      nickname: "Test User",
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
    mockGetUserInfo.mockResolvedValue({ code: 0, msg: "success", data: mockUser });

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(mockGetUserInfo).toHaveBeenCalledWith("test-token");
  });

  it("should handle API error", async () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { accessToken: "test-token" },
    });
    mockGetUserInfo.mockResolvedValue({ code: 401, msg: "Unauthorized", data: null });

    const { result } = renderHook(() => useUserInfo(), { wrapper });

    // Wait for the query to complete (error state may take a moment)
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.error?.message).toBe("Unauthorized");
  });

  it("exports correct query key", () => {
    expect(USER_INFO_QUERY_KEY).toEqual(["user-info"]);
  });
});

