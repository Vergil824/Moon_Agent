"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, UserCircle, LogOut } from "lucide-react";
import { useLogout } from "@/lib/auth/useAuth";

/**
 * Settings Page - Main settings menu
 * Story 5.5: AC 2 - Settings and profile modification
 * Matches Figma design node 166:361
 *
 * Features:
 * - Navigation to change password (first)
 * - Navigation to edit profile (second)
 * - Logout functionality (centered button)
 */
export default function SettingsPage() {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-transparent">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="size-10 flex items-center justify-center -ml-2 hover:bg-gray-100/50 rounded-lg transition-colors"
            aria-label="返回"
          >
            <ChevronLeft className="size-6 text-gray-800" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 -ml-10">
            设置
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Account Section - Order: Password first, Profile second */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <Link
            href="/profile/settings/change-password"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="size-5 text-[#8b5cf6]" />
              <span className="text-base text-gray-800">修改密码</span>
            </div>
            <ChevronRight className="size-5 text-gray-300" />
          </Link>

          <div className="h-px bg-gray-100 mx-4" />

          <Link
            href="/profile/settings/edit-profile"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserCircle className="size-5 text-[#8b5cf6]" />
              <span className="text-base text-gray-800">修改个人信息</span>
            </div>
            <ChevronRight className="size-5 text-gray-300" />
          </Link>
        </div>

        {/* Logout Button - Centered with red styling */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full bg-white rounded-2xl px-4 py-4 hover:bg-red-50/50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <div className="flex items-center justify-center gap-2">
            <LogOut className="size-5 text-[#ef4444]" />
            <span className="text-base text-[#ef4444]">
              {logoutMutation.isPending ? "退出中..." : "退出登录"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

