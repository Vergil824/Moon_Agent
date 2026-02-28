/**
 * Order List Page
 * Migrated from moon-agent/app/profile/orders/page.tsx for Taro
 *
 * Features:
 * - Paginated order list
 * - Order item display (ID, no, status, payPrice, items)
 * - Skeleton loading state
 * - Empty state handling
 * - Pull-down refresh
 * - Pagination controls
 */

import { useState, useCallback, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import { MaterialIcons } from 'taro-icons';
import { useOrderList } from '@core/order';
import {
  OrderListItem,
  OrderEmptyState,
  OrderListSkeleton,
} from '@core/components/order';

const PAGE_SIZE = 10;

export default function OrderListPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { orders, totalPages, total, isLoading, error, isEmpty, refetch } =
    useOrderList({
      pageNo: currentPage,
      pageSize: PAGE_SIZE,
    });

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        // Scroll to top when changing page
        Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
      }
    },
    [totalPages]
  );

  // Pull-down refresh
  usePullDownRefresh(() => {
    setCurrentPage(1);
    refetch().finally(() => {
      Taro.stopPullDownRefresh();
    });
  });

  // Generate pagination numbers
  const paginationNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
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
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [totalPages, currentPage]);

  // Handle order item click (could navigate to order detail in future)
  const handleOrderClick = useCallback((orderId: number) => {
    // Future: navigate to order detail page
    // Taro.navigateTo({ url: `/pages/profile/orders/detail/index?id=${orderId}` });
    console.log('Order clicked:', orderId);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient pb-safe'>
      {/* Content */}
      <View className='flex-1 px-4 py-4'>
        {/* Loading State */}
        {isLoading && <OrderListSkeleton />}

        {/* Error State */}
        {!isLoading && error && (
          <View className='flex flex-col items-center justify-center py-12'>
            <Text className='text-moon-text-muted mb-4 text-center block'>
              {error.message || '加载失败，请稍后重试'}
            </Text>
            <Button
              type='primary'
              size='small'
              className='rounded-lg!'
              style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
              onClick={handleRetry}
            >
              重新加载
            </Button>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && isEmpty && <OrderEmptyState />}

        {/* Order List */}
        {!isLoading && !error && orders.length > 0 && (
          <View>
            {orders.map((order, index) => (
              <View key={order.id} className={index > 0 ? 'mt-3' : ''}>
                <OrderListItem
                  order={order}
                  onClick={() => handleOrderClick(order.id)}
                />
              </View>
            ))}
          </View>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <View className='mt-6 flex items-center justify-center gap-1 flex-wrap'>
            {/* First page */}
            <View
              className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white ${
                currentPage === 1
                  ? 'opacity-50'
                  : 'active:bg-gray-50'
              }`}
              onClick={() => currentPage > 1 && handlePageChange(1)}
            >
              <Text className='text-gray-600 text-sm'>«</Text>
            </View>

            {/* Previous page */}
            <View
              className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white ${
                currentPage === 1
                  ? 'opacity-50'
                  : 'active:bg-gray-50'
              }`}
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
            >
              <MaterialIcons name='chevron_left' size={18} color='#4b5563' />
            </View>

            {/* Page numbers */}
            {paginationNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <View
                  key={`ellipsis-${index}`}
                  className='w-9 h-9 flex items-center justify-center'
                >
                  <Text className='text-moon-text-muted'>...</Text>
                </View>
              ) : (
                <View
                  key={page}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-moon-purple text-white'
                      : 'border border-gray-200 bg-white text-moon-text active:bg-gray-50'
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  <Text
                    className={
                      currentPage === page ? 'text-white' : 'text-moon-text'
                    }
                  >
                    {page}
                  </Text>
                </View>
              )
            )}

            {/* Next page */}
            <View
              className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white ${
                currentPage === totalPages
                  ? 'opacity-50'
                  : 'active:bg-gray-50'
              }`}
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
            >
              <MaterialIcons name='chevron_right' size={18} color='#4b5563' />
            </View>

            {/* Last page */}
            <View
              className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white ${
                currentPage === totalPages
                  ? 'opacity-50'
                  : 'active:bg-gray-50'
              }`}
              onClick={() =>
                currentPage < totalPages && handlePageChange(totalPages)
              }
            >
              <Text className='text-gray-600 text-sm'>»</Text>
            </View>
          </View>
        )}

        {/* Page info */}
        {!isLoading && !error && totalPages > 1 && (
          <Text className='text-center text-sm text-moon-text-muted mt-3 block'>
            第 {currentPage} / {totalPages} 页，共 {total} 条
          </Text>
        )}
      </View>
    </View>
  );
}
