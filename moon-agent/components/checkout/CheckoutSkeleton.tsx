"use client";

/**
 * CheckoutSkeleton - Loading skeleton for checkout page
 * Story 4.4: Task 2.3 - Loading skeleton for settlement preview
 *
 * Shows placeholder content while settlement data is loading
 */

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className ?? ""}`}
    />
  );
}

export function CheckoutSkeleton() {
  return (
    <div data-testid="checkout-skeleton" className="space-y-3">
      {/* Address Card Skeleton */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-5 h-5 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-5 w-16" />
              <SkeletonBlock className="h-5 w-28" />
            </div>
            <SkeletonBlock className="h-4 w-full max-w-[280px]" />
          </div>
          <SkeletonBlock className="w-5 h-5 rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* Product List Skeleton */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <SkeletonBlock className="w-5 h-5 rounded-full" />
          <SkeletonBlock className="h-5 w-24" />
        </div>

        {/* Product Items */}
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
            <SkeletonBlock className="w-20 h-20 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
              <div className="flex justify-between items-center mt-2">
                <SkeletonBlock className="h-5 w-16" />
                <SkeletonBlock className="h-4 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Remark Skeleton */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-10 flex-1 rounded-lg" />
        </div>
      </div>

      {/* Payment Method Skeleton */}
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <SkeletonBlock className="h-5 w-20" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-14 flex-1 rounded-xl" />
          <SkeletonBlock className="h-14 flex-1 rounded-xl" />
        </div>
      </div>

      {/* Price Summary Skeleton */}
      <div className="bg-white rounded-2xl p-4 space-y-2">
        <div className="flex justify-between">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <SkeletonBlock className="h-4 w-12" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <SkeletonBlock className="h-5 w-12" />
          <SkeletonBlock className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

export default CheckoutSkeleton;

