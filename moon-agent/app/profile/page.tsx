"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ProfileHeader, ProfileMenu, ProfileSkeleton } from "@/components/profile";
import { useUserInfo } from "@/lib/profile/useUser";

/**
 * Profile Page - Personal center with user info and navigation menu
 * Story 5.5: AC 1 - Personal center homepage
 * Matches Figma design node 152:78
 *
 * Features:
 * - Display user avatar, nickname and ID
 * - Menu navigation to orders, settings, addresses, etc.
 * - Skeleton loading state to avoid CLS
 * - Redirect to login if not authenticated
 * - Gradient background from pink to purple
 * - Version number at bottom
 */
export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const { data: user, isLoading, error } = useUserInfo();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/welcome");
    }
  }, [status, router]);

  // Show skeleton while loading session or user data
  if (status === "loading" || isLoading) {
    return (
      <div
        data-testid="profile-page"
        className="flex flex-col flex-1 min-h-screen pb-20"
        style={{
          background: "linear-gradient(180deg, rgb(255, 245, 247) 0%, rgb(250, 245, 255) 100%)",
        }}
      >
        <ProfileSkeleton />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        data-testid="profile-page"
        className="flex flex-col flex-1 min-h-screen items-center justify-center px-4 pb-20"
        style={{
          background: "linear-gradient(180deg, rgb(255, 245, 247) 0%, rgb(250, 245, 255) 100%)",
        }}
      >
        <div className="text-center">
          <p className="text-gray-500 mb-4">加载失败，请稍后重试</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed] transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state (will redirect)
  if (status === "unauthenticated" || !user) {
    return null;
  }

  return (
    <div
      data-testid="profile-page"
      className="flex flex-col flex-1 min-h-screen pb-20"
      style={{
        background: "linear-gradient(180deg, rgb(255, 245, 247) 0%, rgb(250, 245, 255) 100%)",
      }}
    >
      <ProfileHeader user={user} />
      <ProfileMenu />
      
      {/* Version number at bottom */}
      <div className="flex-1 flex items-end justify-center pb-8">
        <p className="text-sm text-gray-400">撐撐姐 v1.0.0</p>
      </div>
    </div>
  );
}
