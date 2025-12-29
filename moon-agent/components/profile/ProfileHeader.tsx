"use client";

import Image from "next/image";
import { User } from "lucide-react";
import type { AppMemberUserInfoRespVO } from "@/lib/profile/userApi";

/**
 * ProfileHeader - Displays user avatar, nickname and ID
 * Story 5.5: AC 1 - Personal center header section
 * Matches Figma design node 152:78
 */
interface ProfileHeaderProps {
  user: AppMemberUserInfoRespVO;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="px-4 pt-6 pb-4">
      {/* White card with centered content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-6 py-8 flex flex-col items-center">
        {/* Avatar with gradient border */}
        <div className="relative mb-4">
          {/* Gradient border ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c084fc] via-[#e879f9] to-[#f472b6] p-[3px]">
            <div className="w-full h-full rounded-full bg-white" />
          </div>
          {/* Avatar content */}
          {user.avatar ? (
            <div className="relative size-24 rounded-full overflow-hidden border-[3px] border-transparent bg-gradient-to-br from-[#c084fc] via-[#e879f9] to-[#f472b6] p-[3px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src={user.avatar}
                  alt={user.nickname || "用户头像"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
          ) : (
            <div className="relative size-24 rounded-full bg-gradient-to-br from-[#c084fc] via-[#e879f9] to-[#f472b6] p-[3px]">
              <div className="w-full h-full rounded-full bg-[#fdf4ff] flex items-center justify-center">
                <User className="size-10 text-[#c084fc]" />
              </div>
            </div>
          )}
        </div>

        {/* User Info - centered */}
        <h2 className="text-lg font-semibold text-gray-900 text-center">
          {user.nickname || "用户"}
        </h2>
        <p className="text-sm text-gray-400 mt-1 text-center">
          ID: {user.id}
        </p>
      </div>
    </div>
  );
}

