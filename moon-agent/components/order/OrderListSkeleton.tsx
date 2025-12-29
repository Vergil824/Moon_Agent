"use client";

/**
 * OrderListSkeleton - Loading placeholder for order list
 * Story 5.5: Skeleton loading to avoid CLS
 */
export default function OrderListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>

          {/* Item skeleton */}
          <div className="flex gap-3">
            <div className="size-16 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-end">
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

