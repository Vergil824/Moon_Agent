import { render, waitFor } from "@testing-library/react";
import HomeRedirect from "./page";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace
  })
}));

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession()
}));

describe("Home", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUseSession.mockClear();
  });

  it("redirects to welcome when not authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated"
    });

    render(<HomeRedirect />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/welcome");
    });
  });

  it("redirects to chat when authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", mobile: "13800138000" },
        accessToken: "test-token"
      },
      status: "authenticated"
    });

    render(<HomeRedirect />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/chat");
    });
  });

  it("shows loading state while session is loading", async () => {
    mockUseSession.mockReturnValue({
      data: undefined,
      status: "loading"
    });

    const { container } = render(<HomeRedirect />);
    expect(container.textContent).toContain("跳转中...");
    // Should not redirect while loading
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
