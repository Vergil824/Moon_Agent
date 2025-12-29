"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useUpdatePassword } from "@/lib/profile/useUser";
import { passwordSchema, type PasswordFormData } from "@/lib/profile/profileSchemas";

type FormErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

/**
 * Change Password Page - Update user password
 * Story 5.5: AC 2 - Password modification
 *
 * Features:
 * - Old password verification
 * - New password with confirmation
 * - Form validation (min 6 chars, must match)
 * - Toast feedback on success/error
 * - Back navigation
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const updatePasswordMutation = useUpdatePassword();

  const [formData, setFormData] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = passwordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    updatePasswordMutation.mutate(
      {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="size-10 flex items-center justify-center -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="返回"
          >
            <ChevronLeft className="size-6 text-gray-600" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 -ml-10">
            修改密码
          </h1>
        </div>
      </header>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4">
        {/* Old Password */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <label className="text-sm text-gray-500">当前密码</label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              value={formData.oldPassword}
              onChange={(e) => handleInputChange("oldPassword", e.target.value)}
              placeholder="请输入当前密码"
              className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showOldPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="text-xs text-red-500">{errors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <label className="text-sm text-gray-500">新密码</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              placeholder="请输入新密码（至少6位）"
              className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <label className="text-sm text-gray-500">确认新密码</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              placeholder="请再次输入新密码"
              className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={updatePasswordMutation.isPending}
            className="w-full h-11 bg-[#8b5cf6] text-white text-base font-medium rounded-full transition-colors hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatePasswordMutation.isPending ? "修改中..." : "确认修改"}
          </button>
        </div>
      </form>
    </div>
  );
}

