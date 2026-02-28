"use client";

/**
 * ProfileSkeleton - Loading placeholder for profile page
 * Story 5.5: AC 1 - Skeleton loading to avoid CLS
 * Matches Figma design node 152:78
 */
export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Header Card Skeleton - Centered layout */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-6 py-8 flex flex-col items-center">
          {/* Avatar skeleton with gradient border effect */}
          <div className="size-24 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-pink-200 p-[3px] mb-4">
            <div className="w-full h-full rounded-full bg-gray-100" />
          </div>
          {/* Nickname skeleton - centered */}
          <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
          {/* ID skeleton - centered */}
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Primary Menu Group Skeleton */}
      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={`primary-${i}`}>
              <div className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="size-5 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
                <div className="size-5 bg-gray-200 rounded" />
              </div>
              {i < 3 && <div className="h-px bg-gray-100 mx-4" />}
            </div>
          ))}
        </div>

        {/* Secondary Menu Group Skeleton */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {[1, 2].map((i) => (
            <div key={`secondary-${i}`}>
              <div className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="size-5 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
                <div className="size-5 bg-gray-200 rounded" />
              </div>
              {i < 2 && <div className="h-px bg-gray-100 mx-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

