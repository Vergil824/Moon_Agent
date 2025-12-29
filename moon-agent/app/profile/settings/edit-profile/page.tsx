"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User } from "lucide-react";
import Image from "next/image";
import { useUserInfo, useUpdateUserInfo } from "@/lib/profile/useUser";
import { profileSchema, type ProfileFormData } from "@/lib/profile/profileSchemas";

type FormErrors = {
  nickname?: string;
  avatar?: string;
};

/**
 * Edit Profile Page - Update nickname and avatar
 * Story 5.5: AC 2 - Profile modification
 *
 * Features:
 * - Display current profile info
 * - Update nickname with validation
 * - Toast feedback on success/error
 * - Back navigation
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useUserInfo();
  const updateMutation = useUpdateUserInfo();

  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: "",
    avatar: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
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

    updateMutation.mutate(
      {
        nickname: formData.nickname,
        avatar: formData.avatar || undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
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
              修改资料
            </h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-[#8b5cf6]" />
        </div>
      </div>
    );
  }

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
            修改资料
          </h1>
        </div>
      </header>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4">
        {/* Avatar Section */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">头像</div>
            <div className="flex-1 flex justify-end">
              {formData.avatar ? (
                <div className="relative size-16 rounded-full overflow-hidden">
                  <Image
                    src={formData.avatar}
                    alt="头像"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="size-16 rounded-full bg-[#faf5ff] flex items-center justify-center">
                  <User className="size-8 text-[#8b5cf6]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nickname Section */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <label className="text-sm text-gray-500">昵称</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange("nickname", e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all"
          />
          {errors.nickname && (
            <p className="text-xs text-red-500">{errors.nickname}</p>
          )}
          <p className="text-xs text-gray-400 text-right">
            {formData.nickname.length}/20
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full h-11 bg-[#8b5cf6] text-white text-base font-medium rounded-full transition-colors hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </div>
  );
}

