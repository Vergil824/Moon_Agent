/**
 * Checkout Page - Order confirmation page
 * Migrated from moon-agent/app/checkout/page.tsx for Taro
 *
 * Layout structure per Figma (node-id=166:672):
 * - CheckoutHeader: Fixed at top with "确认订单" title and back button
 * - Address Card: Display delivery address
 * - Product List: Items to be purchased
 * - Order Remark: Optional note input
 * - Payment Method: WeChat Pay / Alipay selection
 * - Price Summary: Total breakdown
 * - Bottom Footer: Total amount and "立即支付" button
 *
 * Background: Brand gradient from #FFF5F7 to #FAF5FF
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { ShoppingCart, Replay } from '@taroify/icons';
import { Dialog, Button } from '@nutui/nutui-react-taro';
import {
  CheckoutHeader,
  CheckoutSkeleton,
  AddressCard,
  ProductList,
  OrderRemark,
  PaymentMethodSelector,
  PriceSummary,
  CheckoutFooter,
  type PaymentMethod,
} from '@core/components/checkout';
import {
  useCheckout,
  calculateTotalCount,
  type SettlementAddress,
} from '@core/order';
import { saveCartBackup, updateBackupOrderId } from '@core/cart';

// Default payment method based on platform
const isWeapp = process.env.TARO_ENV === 'weapp';
const defaultPaymentMethod: PaymentMethod = isWeapp ? 'wechat' : 'alipay';

export default function CheckoutPage() {
  const router = useRouter();

  // Get status bar height for proper header spacing
  // Header = statusBarHeight + header content (44px) - matches native navigation bar
  const [headerHeight, setHeaderHeight] = useState(88); // Default: 44px + 44px
  
  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync();
    if (systemInfo?.statusBarHeight) {
      // Status bar height + header content height (44px)
      setHeaderHeight(systemInfo.statusBarHeight + 44);
    }
  }, []);

  // Form state
  const [remark, setRemark] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(defaultPaymentMethod);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Address state - from query params or settlement
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );

  // Get address ID from query params (if coming back from address selection)
  useEffect(() => {
    const addressIdParam = router.params?.addressId;
    if (addressIdParam) {
      const addressId = parseInt(addressIdParam, 10);
      if (!Number.isNaN(addressId)) {
        setSelectedAddressId(addressId);
      }
    }
  }, [router.params?.addressId]);

  // Fetch settlement data
  const {
    items,
    address: settlementAddress,
    price,
    isLoading,
    error: settlementError,
    isCreatingOrder,
    createOrder,
  } = useCheckout(selectedAddressId || undefined);

  // Determine which address to use
  const displayAddress = useMemo<SettlementAddress | null>(() => {
    if (settlementAddress) {
      return {
        ...settlementAddress,
        areaName: settlementAddress.areaName || '',
      };
    }
    return null;
  }, [settlementAddress]);

  // Calculate total item count
  const totalItemCount = useMemo(() => calculateTotalCount(items), [items]);

  // Handle address card press - navigate to address selection
  const handleAddressPress = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/profile/addresses/index?mode=select&callbackUrl=/pages/checkout/index',
    });
  }, []);

  // Handle order submission
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!displayAddress) {
      setErrorMessage('请先选择收货地址');
      setErrorDialogOpen(true);
      return;
    }

    if (items.length === 0) {
      setErrorMessage('订单中没有商品');
      setErrorDialogOpen(true);
      return;
    }

    try {
      // Save cart backup before creating order (for rollback if payment fails)
      saveCartBackup(
        items.map((item) => ({
          skuId: item.skuId,
          count: item.count,
          spuName: item.spuName,
        }))
      );

      // Build order request
      const orderItems = items.map((item) => ({
        skuId: item.skuId,
        count: item.count,
        cartId: item.cartId,
      }));

      const result = await createOrder({
        items: orderItems,
        addressId: displayAddress.id,
        deliveryType: 1, // Express delivery
        remark: remark || undefined,
        pointStatus: false, // Not using points
      });

      // Update backup with order ID
      updateBackupOrderId(result.id);

      // Success - navigate to payment submit page with payOrderId
      Taro.navigateTo({
        url: `/pages/pay/submit/index?payOrderId=${result.payOrderId}&orderId=${result.id}&method=${paymentMethod}`,
      });
    } catch (err) {
      // Error handling
      setErrorMessage(
        err instanceof Error ? err.message : '订单创建失败，请稍后重试'
      );
      setErrorDialogOpen(true);
    }
  }, [displayAddress, items, remark, createOrder, paymentMethod]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    Taro.reLaunch({
      url: '/pages/checkout/index',
    });
  }, []);

  // Render error state
  if (settlementError && !isLoading) {
    return (
      <View className='flex flex-col min-h-screen bg-page-gradient'>
        <CheckoutHeader />
        <View className='flex-1 pt-[52px] px-3 flex flex-col items-center justify-center'>
          <View className='w-20 h-20 rounded-full bg-red-50 flex items-center justify-center'>
            <ShoppingCart size={40} className='text-red-400' />
          </View>
          <Text className='mt-4 text-xl font-semibold text-moon-text'>
            加载失败
          </Text>
          <Text className='mt-2 text-sm text-moon-text-muted text-center max-w-xs'>
            {settlementError.message || '网络异常，请稍后重试'}
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
      </View>
    );
  }

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      {/* Checkout Header */}
      <CheckoutHeader />

      {/* Main Content Area - Scrollable */}
      {/* ScrollView needs explicit height to enable scrolling in mini program */}
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        style={{
          height: `calc(100vh - ${headerHeight}px - 80px)`,
          marginTop: `${headerHeight}px`,
        }}
      >
        {/* Content wrapper with padding */}
        <View className='px-4 pt-3 pb-4'>
          {isLoading ? (
            <CheckoutSkeleton />
          ) : (
            <>
              {/* Address Card */}
              <View className='mb-3'>
                <AddressCard
                  address={displayAddress}
                  onPress={handleAddressPress}
                />
              </View>

              {/* Product List */}
              <View className='mb-3'>
                <ProductList items={items} />
              </View>

              {/* Order Remark */}
              <View className='mb-3'>
                <OrderRemark value={remark} onChange={setRemark} />
              </View>

              {/* Payment Method Selector */}
              <View className='mb-3'>
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </View>

              {/* Price Summary */}
              {price && (
                <View className='mb-3'>
                  <PriceSummary price={price} />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <CheckoutFooter
        totalAmount={price?.payPrice ?? 0}
        itemCount={totalItemCount}
        onSubmit={handleSubmit}
        isLoading={isCreatingOrder}
        disabled={isLoading || items.length === 0 || !displayAddress}
      />

      {/* Error Dialog */}
      <Dialog
        visible={errorDialogOpen}
        title='提示'
        onClose={() => setErrorDialogOpen(false)}
        onConfirm={() => setErrorDialogOpen(false)}
        confirmText='知道了'
        hideCancelButton
      >
        {errorMessage}
      </Dialog>
    </View>
  );
}
