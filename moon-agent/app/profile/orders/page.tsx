"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useOrderList } from "@/lib/order/useOrders";
import {
  OrderListItem,
  OrderListSkeleton,
  OrderEmptyState,
} from "@/components/order";

/**
 * Order List Page - Display user's orders with pagination
 * Story 5.5: AC 3 - Order list pagination
 *
 * Features:
 * - Paginated order list
 * - Order item display (ID, no, status, payPrice, items)
 * - Skeleton loading state
 * - Empty state handling
 * - Shadcn/UI inspired pagination
 */

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const { status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/welcome");
    }
  }, [status, router]);

  const {
    data: orderData,
    isLoading,
    error,
  } = useOrderList({
    pageNo: currentPage,
    pageSize: PAGE_SIZE,
  });

  const handleBack = () => {
    router.back();
  };

  const totalPages = orderData ? Math.ceil(orderData.total / PAGE_SIZE) : 0;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showPages = 5; // Max pages to show

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
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
            我的订单
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {/* Loading State */}
        {(status === "loading" || isLoading) && <OrderListSkeleton />}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">加载失败，请稍后重试</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed] transition-colors"
            >
              重新加载
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orderData && orderData.list.length === 0 && (
          <OrderEmptyState />
        )}

        {/* Order List */}
        {!isLoading && !error && orderData && orderData.list.length > 0 && (
          <div className="space-y-3">
            {orderData.list.map((order) => (
              <OrderListItem key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && orderData && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1">
            {/* First page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="size-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="第一页"
            >
              <ChevronsLeft className="size-4" />
            </button>

            {/* Previous page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="上一页"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Page numbers */}
            {getPaginationNumbers().map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="size-9 flex items-center justify-center text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`size-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#8b5cf6] text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="下一页"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Last page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="size-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="最后一页"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        )}

        {/* Page info */}
        {!isLoading && !error && orderData && totalPages > 1 && (
          <div className="text-center text-sm text-gray-500 mt-3">
            第 {currentPage} / {totalPages} 页，共 {orderData.total} 条
          </div>
        )}
      </div>
    </div>
  );
}

