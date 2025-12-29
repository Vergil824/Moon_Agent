import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChangePasswordPage from "./page";

// Mock next/navigation
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    refresh: vi.fn(),
  }),
}));

// Mock useUpdatePassword
const mockUpdatePasswordMutate = vi.fn();
vi.mock("@/lib/profile/useUser", () => ({
  useUpdatePassword: () => ({
    mutate: mockUpdatePasswordMutate,
    isPending: false,
  }),
}));

describe("ChangePasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders change password form", () => {
    render(<ChangePasswordPage />);

    expect(screen.getByText("修改密码")).toBeInTheDocument();
    expect(screen.getByText("当前密码")).toBeInTheDocument();
    expect(screen.getByText("新密码")).toBeInTheDocument();
    expect(screen.getByText("确认新密码")).toBeInTheDocument();
    expect(screen.getByText("确认修改")).toBeInTheDocument();
  });

  it("validates old password minimum length", async () => {
    render(<ChangePasswordPage />);

    const oldPasswordInput = screen.getByPlaceholderText("请输入当前密码");
    const newPasswordInput = screen.getByPlaceholderText("请输入新密码（至少6位）");
    const confirmPasswordInput = screen.getByPlaceholderText("请再次输入新密码");

    fireEvent.change(oldPasswordInput, { target: { value: "12345" } });
    fireEvent.change(newPasswordInput, { target: { value: "123456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "123456" } });

    const submitButton = screen.getByText("确认修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("密码至少需要6位")).toBeInTheDocument();
    });

    expect(mockUpdatePasswordMutate).not.toHaveBeenCalled();
  });

  it("validates new password minimum length", async () => {
    render(<ChangePasswordPage />);

    const oldPasswordInput = screen.getByPlaceholderText("请输入当前密码");
    const newPasswordInput = screen.getByPlaceholderText("请输入新密码（至少6位）");
    const confirmPasswordInput = screen.getByPlaceholderText("请再次输入新密码");

    fireEvent.change(oldPasswordInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "12345" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "12345" } });

    const submitButton = screen.getByText("确认修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("新密码至少需要6位")).toBeInTheDocument();
    });
  });

  it("validates passwords must match", async () => {
    render(<ChangePasswordPage />);

    const oldPasswordInput = screen.getByPlaceholderText("请输入当前密码");
    const newPasswordInput = screen.getByPlaceholderText("请输入新密码（至少6位）");
    const confirmPasswordInput = screen.getByPlaceholderText("请再次输入新密码");

    fireEvent.change(oldPasswordInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "654321" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "999999" } });

    const submitButton = screen.getByText("确认修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("两次输入的密码不一致")).toBeInTheDocument();
    });
  });

  it("validates new password must be different from old", async () => {
    render(<ChangePasswordPage />);

    const oldPasswordInput = screen.getByPlaceholderText("请输入当前密码");
    const newPasswordInput = screen.getByPlaceholderText("请输入新密码（至少6位）");
    const confirmPasswordInput = screen.getByPlaceholderText("请再次输入新密码");

    fireEvent.change(oldPasswordInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "123456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "123456" } });

    const submitButton = screen.getByText("确认修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("新密码不能与旧密码相同")).toBeInTheDocument();
    });
  });

  it("calls update mutation with valid data", async () => {
    render(<ChangePasswordPage />);

    const oldPasswordInput = screen.getByPlaceholderText("请输入当前密码");
    const newPasswordInput = screen.getByPlaceholderText("请输入新密码（至少6位）");
    const confirmPasswordInput = screen.getByPlaceholderText("请再次输入新密码");

    fireEvent.change(oldPasswordInput, { target: { value: "oldpass123" } });
    fireEvent.change(newPasswordInput, { target: { value: "newpass456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newpass456" } });

    const submitButton = screen.getByText("确认修改");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdatePasswordMutate).toHaveBeenCalledWith(
        { oldPassword: "oldpass123", newPassword: "newpass456" },
        expect.any(Object)
      );
    });
  });

  it("toggles password visibility", () => {
    render(<ChangePasswordPage />);

    const oldPasswordInput = screen.getByPlaceholderText("请输入当前密码");
    expect(oldPasswordInput).toHaveAttribute("type", "password");

    // Find all buttons without explicit role (includes toggle buttons)
    const allButtons = screen.getAllByRole("button");
    // Filter to get toggle buttons (those that are not the back button or submit)
    const toggleButtons = allButtons.filter(
      (btn) => !btn.hasAttribute("aria-label") && btn.getAttribute("type") !== "submit"
    );
    // Click the first toggle button (for old password)
    fireEvent.click(toggleButtons[0]);

    expect(oldPasswordInput).toHaveAttribute("type", "text");
  });

  it("navigates back when back button clicked", () => {
    render(<ChangePasswordPage />);

    const backButton = screen.getByLabelText("返回");
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });
});

