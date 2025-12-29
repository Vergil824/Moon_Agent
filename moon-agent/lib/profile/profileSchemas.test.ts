import { describe, it, expect } from "vitest";
import { profileSchema, passwordSchema } from "./profileSchemas";

describe("profileSchema", () => {
  it("validates valid nickname", () => {
    const result = profileSchema.safeParse({ nickname: "测试用户" });
    expect(result.success).toBe(true);
  });

  it("rejects empty nickname", () => {
    const result = profileSchema.safeParse({ nickname: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("昵称不能为空");
    }
  });

  it("rejects nickname exceeding 20 characters", () => {
    const result = profileSchema.safeParse({ nickname: "a".repeat(21) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("昵称不能超过20个字符");
    }
  });

  it("accepts optional avatar", () => {
    const result = profileSchema.safeParse({
      nickname: "测试",
      avatar: "https://example.com/avatar.jpg",
    });
    expect(result.success).toBe(true);
  });
});

describe("passwordSchema", () => {
  it("validates valid password change", () => {
    const result = passwordSchema.safeParse({
      oldPassword: "oldpass123",
      newPassword: "newpass456",
      confirmPassword: "newpass456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects old password less than 6 characters", () => {
    const result = passwordSchema.safeParse({
      oldPassword: "12345",
      newPassword: "newpass456",
      confirmPassword: "newpass456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("密码至少需要6位");
    }
  });

  it("rejects new password less than 6 characters", () => {
    const result = passwordSchema.safeParse({
      oldPassword: "oldpass123",
      newPassword: "12345",
      confirmPassword: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("新密码至少需要6位");
    }
  });

  it("rejects mismatched confirm password", () => {
    const result = passwordSchema.safeParse({
      oldPassword: "oldpass123",
      newPassword: "newpass456",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (issue) => issue.path[0] === "confirmPassword"
      );
      expect(confirmError?.message).toBe("两次输入的密码不一致");
    }
  });

  it("rejects new password same as old password", () => {
    const result = passwordSchema.safeParse({
      oldPassword: "samepassword",
      newPassword: "samepassword",
      confirmPassword: "samepassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const newPwdError = result.error.issues.find(
        (issue) => issue.path[0] === "newPassword"
      );
      expect(newPwdError?.message).toBe("新密码不能与旧密码相同");
    }
  });
});

