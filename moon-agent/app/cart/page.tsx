"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CartHeader,
  AddressBar,
  CartFooter,
  CartStoreSection,
  InvalidProductsSection,
  CartSkeleton,
} from "@/components/cart";
import { useCart } from "@/lib/cart/useCart";
import { useAddress } from "@/lib/address/useAddress";
import { useSelectedAddressStore } from "@/lib/address/addressStore";
import { formatFullAddress } from "@/lib/address/addressApi";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Cart Page - Shopping cart management page
 * Story 4.3: Cart Management & Page Development
 *
 * Layout structure per Figma (node-id=151:173):
 * - CartHeader: Fixed at top with title and item count
 * - AddressBar: Delivery address display
 * - Product List: Valid items grouped by store + invalid items section
 * - CartFooter: Select all, total, checkout button
 * - BottomNav: Already rendered by AppShell
 *
 * Background: Brand gradient from #fff5f7 to #faf5ff
 */

export default function CartPage() {
  const router = useRouter();

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");

  // Fetch cart data using React Query
  const {
    validItems,
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
  } = useCart();

  // Fetch address list and get selected/default address
  const { addresses, defaultAddress } = useAddress();
  const { selectedAddressId, setSelectedAddressId } = useSelectedAddressStore();

  // Determine which address to display:
  // 1. If user explicitly selected an address, use that
  // 2. Otherwise, use the default address
  // 3. If no address selected and no default, show placeholder
  const displayAddress = useMemo(() => {
    if (selectedAddressId) {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected) return selected;
    }
    // If no explicit selection or selection not found, use default
    if (defaultAddress) {
      // Auto-select default address if no selection made
      if (!selectedAddressId) {
        setSelectedAddressId(defaultAddress.id);
      }
      return defaultAddress;
    }
    return null;
  }, [selectedAddressId, addresses, defaultAddress, setSelectedAddressId]);

  // Handle select all / deselect all
  const handleSelectAllChange = (checked: boolean) => {
    selectAll(checked);
  };

  // Handle store-level selection (select all items in a store)
  const handleStoreSelect = (storeId: number, selected: boolean) => {
    const store = storeGroups.find((s) => s.id === storeId);
    if (!store) return;

    store.items.forEach((item) => {
      if (item.selected !== selected) {
        toggleItemSelected(item.id, selected);
      }
    });
  };

  // Handle individual item selection
  const handleItemSelect = (itemId: number, selected: boolean) => {
    toggleItemSelected(itemId, selected);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: number, count: number) => {
    if (count < 1) return;
    updateItemCount({ id: itemId, count });
  };

  // Handle delete single item (valid or invalid)
  const handleDeleteItem = (itemId: number) => {
    setIdsToDelete([itemId]);
    setConfirmTitle("确认删除");
    setConfirmDescription("确定要从购物车中删除该商品吗？");
    setDeleteConfirmOpen(true);
  };

  // Handle clear all invalid items
  const handleClearInvalidItems = () => {
    const invalidIds = invalidItems.map((item) => item.id);
    if (invalidIds.length > 0) {
      setIdsToDelete(invalidIds);
      setConfirmTitle("清空失效商品");
      setConfirmDescription("确定要清空所有失效商品吗？");
      setDeleteConfirmOpen(true);
    }
  };

  // Execute delete after confirmation
  const confirmDelete = () => {
    if (idsToDelete.length > 0) {
      deleteItems(idsToDelete);
      setIdsToDelete([]);
    }
    setDeleteConfirmOpen(false);
  };

  // Handle checkout navigation with validation
  const handleCheckout = () => {
    // Task 5.3: Validate before checkout
    if (selectedCount === 0) {
      // No items selected, show feedback (could use toast)
      console.warn("请先选择要结算的商品");
      return;
    }

    // Navigate to checkout confirmation page
    router.push("/checkout");
  };

  // Handle address bar press - navigate to address selection with callback
  const handleAddressPress = () => {
    router.push("/profile/addresses?mode=select&callbackUrl=/cart");
  };

  return (
    <div
      data-testid="cart-page"
      className="flex flex-col min-h-screen bg-gradient-to-b from-[#fff5f7] to-[#faf5ff]"
    >
      {/* Custom Cart Header */}
      <CartHeader itemCount={isLoading ? 0 : totalItems} />

      {/* Main Content Area */}
      <main className="flex-1 pt-[52px] pb-[104px] px-3">
        {/* Address Bar */}
        <div className="mt-3">
          <AddressBar
            address={
              displayAddress
                ? formatFullAddress(displayAddress)
                : "请选择配送地址"
            }
            onPress={handleAddressPress}
          />
        </div>

        {/* Product List Area */}
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <CartSkeleton />
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="size-20 rounded-full bg-red-50 flex items-center justify-center">
                <ShoppingCart className="size-10 text-red-400" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-moon-text">
                加载失败
              </h2>
              <p className="mt-2 text-sm text-moon-text-muted text-center max-w-xs">
                {error.message || "网络异常，请稍后重试"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-6"
              >
                <RefreshCw className="size-4 mr-2" />
                刷新页面
              </Button>
            </div>
          ) : isEmpty ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="size-20 rounded-full bg-[#faf5ff] flex items-center justify-center">
                <ShoppingCart className="size-10 text-moon-purple" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-moon-text">
                购物车空空如也
              </h2>
              <p className="mt-2 text-sm text-moon-text-muted text-center max-w-xs">
                您的购物车暂时是空的，快去和满月聊天获取专属推荐吧！
              </p>
              <button
                onClick={() => router.push("/chat")}
                className="mt-6 px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-md transition-all active:scale-95"
                style={{
                  background: "linear-gradient(105deg, #DA3568 9.87%, #FB7185 92.16%)",
                }}
              >
                去聊天
              </button>
            </div>
          ) : (
            <>
              {/* Valid Products - Grouped by Store */}
              {storeGroups.map((store) => (
                <CartStoreSection
                  key={store.id}
                  store={store}
                  onStoreSelect={(selected) => handleStoreSelect(store.id, selected)}
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
        </div>
      </main>

      {/* Cart Footer - Fixed above BottomNav */}
      <CartFooter
        isAllSelected={isAllSelected}
        totalAmount={selectedTotal}
        selectedCount={selectedCount}
        onSelectAllChange={handleSelectAllChange}
        onCheckout={handleCheckout}
        disabled={isEmpty || isMutating || isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[85vw] rounded-[20px] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:space-x-0">
            <AlertDialogCancel className="flex-1 mt-0 rounded-full border-gray-200">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="flex-1 rounded-full bg-moon-purple hover:bg-moon-purple/90 text-white"
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
