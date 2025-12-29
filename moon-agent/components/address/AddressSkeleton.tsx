"use client";

/**
 * AddressSkeleton - Skeleton loading state for address list
 * Story 5.9: AC 1 - Skeleton loading state
 */

export function AddressSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          data-testid={`address-skeleton-${i}`}
          className="p-4 bg-white rounded-xl border border-gray-100 animate-pulse"
        >
          {/* Name & Phone Row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
            <div className="ml-auto h-5 w-12 bg-gray-200 rounded" />
          </div>
          {/* Address Row */}
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default AddressSkeleton;

