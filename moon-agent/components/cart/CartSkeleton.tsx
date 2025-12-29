"use client";

/**
 * CartSkeleton - Skeleton loading state for cart page
 * Story 4.3: Enhanced loading state
 */

export function CartSkeleton() {
  return (
    <div className="space-y-3">
      {/* Address Bar Skeleton */}
      <div className="p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-[14px] animate-pulse">
        <div className="flex items-center gap-2">
          <div className="size-4 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="ml-auto size-4 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Store Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        {/* Store Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <div className="size-5 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>

        {/* Cart Items */}
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 p-4 border-b border-gray-50 last:border-b-0">
            {/* Checkbox placeholder */}
            <div className="size-5 bg-gray-200 rounded mt-1" />
            {/* Product image placeholder */}
            <div className="size-20 bg-gray-200 rounded-lg shrink-0" />
            {/* Product info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="flex items-center justify-between mt-3">
                <div className="h-5 w-16 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Another store section skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <div className="size-5 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-3 p-4">
          <div className="size-5 bg-gray-200 rounded mt-1" />
          <div className="size-20 bg-gray-200 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="flex items-center justify-between mt-3">
              <div className="h-5 w-14 bg-gray-200 rounded" />
              <div className="h-8 w-24 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartSkeleton;

