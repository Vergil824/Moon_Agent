/**
 * Cart Page - Shopping cart management page
 * Migrated from moon-agent/app/cart/page.tsx for Taro
 *
 * Layout structure per Figma (node-id=151:173):
 * - CartHeader: Fixed at top with title and item count
 * - AddressBar: Delivery address display
 * - Product List: Valid items grouped by store + invalid items section
 * - CartFooter: Select all, total, checkout button
 * - BottomNav: Custom tabBar replacement
 *
 * Background: Brand gradient from #fff5f7 to #faf5ff
 */

import { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { ShoppingCart, Replay } from '@taroify/icons';
import { Dialog, Button } from '@nutui/nutui-react-taro';
import {
  AddressBar,
  CartFooter,
  CartStoreSection,
  InvalidProductsSection,
  CartSkeleton,
} from '@core/components/cart';
import { BottomNav } from '@core/components/layout';
import { useCart } from '@core/cart';
import { useAddress } from '@core/address';

export default function CartPage() {
  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');

  // Cart data and operations
  const {
    invalidItems,
    totalItems,
    selectedTotal,
    selectedCount,
    isAllSelected,
    storeGroups,
    isLoading,
    isEmpty,
    error,
    isMutating,
    updateItemCount,
    toggleItemSelected,
    deleteItems,
    selectAll,
    fetchCart,
  } = useCart();

  // Fetch address list and get default address
  const { defaultAddress } = useAddress();

  // Hide system tabBar when page shows
  useDidShow(() => {
    Taro.hideTabBar({ animation: false });
  });

  // Handle select all / deselect all
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      selectAll(checked);
    },
    [selectAll]
  );

  // Handle store-level selection (select all items in a store)
  const handleStoreSelect = useCallback(
    (storeId: number, selected: boolean) => {
      const store = storeGroups.find((s) => s.id === storeId);
      if (!store) return;

      store.items.forEach((item) => {
        if (item.selected !== selected) {
          toggleItemSelected(item.id, selected);
        }
      });
    },
    [storeGroups, toggleItemSelected]
  );

  // Handle individual item selection
  const handleItemSelect = useCallback(
    (itemId: number, selected: boolean) => {
      toggleItemSelected(itemId, selected);
    },
    [toggleItemSelected]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (itemId: number, count: number) => {
      if (count < 1) return;
      updateItemCount({ id: itemId, count });
    },
    [updateItemCount]
  );

  // Handle delete single item (valid or invalid)
  const handleDeleteItem = useCallback((itemId: number) => {
    setIdsToDelete([itemId]);
    setConfirmTitle('确认删除');
    setConfirmDescription('确定要从购物车中删除该商品吗？');
    setDeleteConfirmOpen(true);
  }, []);

  // Handle clear all invalid items
  const handleClearInvalidItems = useCallback(() => {
    const invalidIds = invalidItems.map((item) => item.id);
    if (invalidIds.length > 0) {
      setIdsToDelete(invalidIds);
      setConfirmTitle('清空失效商品');
      setConfirmDescription('确定要清空所有失效商品吗？');
      setDeleteConfirmOpen(true);
    }
  }, [invalidItems]);

  // Execute delete after confirmation
  const confirmDelete = useCallback(() => {
    if (idsToDelete.length > 0) {
      deleteItems(idsToDelete);
      setIdsToDelete([]);
    }
    setDeleteConfirmOpen(false);
  }, [idsToDelete, deleteItems]);

  // Handle checkout navigation with validation
  const handleCheckout = useCallback(() => {
    if (selectedCount === 0) {
      Taro.showToast({
        title: '请先选择要结算的商品',
        icon: 'none',
      });
      return;
    }

    // Navigate to checkout confirmation page
    Taro.navigateTo({
      url: '/pages/checkout/index',
    });
  }, [selectedCount]);

  // Handle address bar press - navigate to address selection
  const handleAddressPress = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/profile/addresses/index?mode=select&callbackUrl=/pages/cart/index',
    });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  // Navigate to chat
  const handleGoToChat = useCallback(() => {
    Taro.switchTab({
      url: '/pages/chat/index',
    });
  }, []);

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      {/* Main Content Area - No header */}
      {/* Bottom padding: CartFooter (60px) + BottomNav (56px) + safe-area + extra spacing */}
      <View
        className='flex-1 pt-3 px-3'
        style={{
          paddingBottom:
            'calc(60px + 56px + env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        {/* Address Bar - Show default address or prompt to add */}
        <View className='mt-3'>
          <AddressBar address={defaultAddress} onPress={handleAddressPress} />
        </View>

        {/* Product List Area */}
        <View className='mt-3 space-y-3'>
          {isLoading ? (
            <CartSkeleton />
          ) : error ? (
            /* Error State */
            <View className='flex flex-col items-center justify-center py-20'>
              <View className='w-20 h-20 rounded-full bg-red-50 flex items-center justify-center'>
                <ShoppingCart size={40} className='text-red-400' />
              </View>
              <Text className='mt-4 text-xl font-semibold text-moon-text'>
                加载失败
              </Text>
              <Text className='mt-2 text-sm text-moon-text-muted text-center max-w-xs'>
                {error.message || '网络异常，请稍后重试'}
              </Text>
              <Button
                type='default'
                className='mt-6 rounded-full'
                onClick={handleRefresh}
              >
                <View className='flex items-center gap-2'>
                  <Replay size={16} />
                  <Text>刷新页面</Text>
                </View>
              </Button>
            </View>
          ) : isEmpty ? (
            /* Empty Cart State */
            <View className='flex flex-col items-center justify-center py-20'>
              <View className='w-20 h-20 rounded-full bg-[#faf5ff] flex items-center justify-center'>
                <ShoppingCart size={40} className='text-moon-purple' />
              </View>
              <Text className='mt-4 text-xl font-semibold text-moon-text'>
                购物车空空如也
              </Text>
              <Text className='mt-2 text-sm text-moon-text-muted text-center max-w-xs'>
                您的购物车暂时是空的，快去和满月聊天获取专属推荐吧！
              </Text>
              <View
                className='mt-6 px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-md active:scale-95 bg-gradient-moon-primary'
                onClick={handleGoToChat}
              >
                <Text className='text-white font-medium'>去聊天</Text>
              </View>
            </View>
          ) : (
            <>
              {/* Valid Products - Grouped by Store */}
              {storeGroups.map((store) => (
                <CartStoreSection
                  key={store.id}
                  store={store}
                  onStoreSelect={(selected) =>
                    handleStoreSelect(store.id, selected)
                  }
                  onItemSelect={handleItemSelect}
                  onItemQuantityChange={handleQuantityChange}
                  onItemDelete={handleDeleteItem}
                  disabled={isMutating}
                />
              ))}

              {/* Invalid Products Section */}
              <InvalidProductsSection
                items={invalidItems}
                onDeleteItem={handleDeleteItem}
                onClearAll={handleClearInvalidItems}
              />
            </>
          )}
        </View>
      </View>

      {/* Cart Footer - Fixed above BottomNav */}
      <CartFooter
        isAllSelected={isAllSelected}
        totalAmount={selectedTotal}
        selectedCount={selectedCount}
        onSelectAllChange={handleSelectAllChange}
        onCheckout={handleCheckout}
        disabled={isEmpty || isMutating || isLoading}
      />

      {/* Custom BottomNav with cart count badge */}
      <BottomNav activeTab='cart' cartCount={totalItems} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteConfirmOpen}
        title={confirmTitle}
        onClose={() => setDeleteConfirmOpen(false)}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        cancelText='取消'
        confirmText='确认'
      >
        {confirmDescription}
      </Dialog>
    </View>
  );
}
