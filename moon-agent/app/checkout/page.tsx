'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import {
  CheckoutHeader,
  CheckoutSkeleton,
  AddressCard,
  ProductList,
  OrderRemark,
  PaymentMethodSelector,
  ExpressSelector,
  PriceSummary,
  CheckoutFooter,
  type PaymentMethod,
} from '@/components/checkout';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCheckout } from '@/lib/payment/useSettlement';
import { useAddress } from '@/lib/address/useAddress';
import { useSelectedAddressStore } from '@/lib/address/addressStore';
import {
  calculateTotalCount,
  type SettlementAddress,
} from '@/lib/order/orderApi';

/**
 * Checkout Page - Order confirmation page
 * Story 4.4: Checkout Confirmation & Order Creation
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageFallback />}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageFallback() {
  return (
    <div
      data-testid='checkout-page'
      className='flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]'
    >
      <CheckoutHeader />
      <main className='flex-1 pt-[52px] pb-[120px] px-3'>
        <div className='mt-3 space-y-3'>
          <CheckoutSkeleton />
        </div>
      </main>
    </div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [remark, setRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('alipay');
  const [selectedExpressId, setSelectedExpressId] = useState<number | null>(
    null
  );
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Address state - sync from cart selection or default
  const { addresses, defaultAddress, isLoading: addressLoading } = useAddress();
  const { selectedAddressId, setSelectedAddressId } = useSelectedAddressStore();

  // Get selected address ID from query params (if coming back from address selection)
  useEffect(() => {
    const addressIdParam = searchParams.get('addressId');
    if (addressIdParam) {
      const addressId = parseInt(addressIdParam, 10);
      if (!isNaN(addressId)) {
        setSelectedAddressId(addressId);
      }
    }
  }, [searchParams, setSelectedAddressId]);

  // Determine which address to use and the effective address ID
  const { displayAddress, effectiveAddressId } = useMemo<{
    displayAddress: SettlementAddress | null;
    effectiveAddressId: number | null;
  }>(() => {
    if (selectedAddressId) {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected) {
        return {
          displayAddress: {
            ...selected,
            areaName: selected.areaName || '',
          },
          effectiveAddressId: selected.id,
        };
      }
    }
    if (defaultAddress) {
      return {
        displayAddress: {
          ...defaultAddress,
          areaName: defaultAddress.areaName || '',
        },
        effectiveAddressId: defaultAddress.id,
      };
    }
    return { displayAddress: null, effectiveAddressId: null };
  }, [selectedAddressId, addresses, defaultAddress]);

  // Auto-select default address if not selected
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [selectedAddressId, defaultAddress, setSelectedAddressId]);

  // Fetch settlement data with the effective address
  const {
    settlement,
    items,
    price,
    isLoading: settlementLoading,
    error: settlementError,
    isCreatingOrder,
    createOrder,
    createOrderError,
  } = useCheckout(effectiveAddressId || undefined);

  const isLoading = settlementLoading || addressLoading;

  // Calculate total item count
  const totalItemCount = useMemo(() => calculateTotalCount(items), [items]);

  // Handle address card press - navigate to address selection
  const handleAddressPress = useCallback(() => {
    router.push('/profile/addresses?mode=select&callbackUrl=/checkout');
  }, [router]);

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

      // Success - navigate to payment submit page with payOrderId
      // Story 4.5: Payment submit page handles channel selection and payment initiation
      router.push(
        `/pay/submit?payOrderId=${result.payOrderId}&orderId=${result.id}&method=${paymentMethod}`
      );
    } catch {
      // Error handling - show toast/dialog
      setErrorMessage(createOrderError?.message || '订单创建失败，请稍后重试');
      setErrorDialogOpen(true);
    }
  }, [
    displayAddress,
    items,
    remark,
    createOrder,
    router,
    paymentMethod,
    createOrderError,
  ]);

  // Render error state
  if (settlementError && !isLoading) {
    return (
      <div
        data-testid='checkout-page'
        className='flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]'
      >
        <CheckoutHeader />
        <main className='flex-1 pt-[52px] px-3 flex flex-col items-center justify-center'>
          <div className='size-20 rounded-full bg-red-50 flex items-center justify-center'>
            <ShoppingCart className='size-10 text-red-400' />
          </div>
          <h2 className='mt-4 text-xl font-semibold text-moon-text'>
            加载失败
          </h2>
          <p className='mt-2 text-sm text-moon-text-muted text-center max-w-xs'>
            {settlementError.message || '网络异常，请稍后重试'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant='outline'
            className='mt-6'
          >
            <RefreshCw className='size-4 mr-2' />
            刷新页面
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div
      data-testid='checkout-page'
      className='flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]'
    >
      {/* Checkout Header */}
      <CheckoutHeader />

      {/* Main Content Area */}
      <main className='flex-1 pt-[52px] pb-[120px] px-3'>
        <div className='mt-3 space-y-3'>
          {isLoading ? (
            <CheckoutSkeleton />
          ) : (
            <>
              {/* Address Card */}
              <AddressCard
                address={displayAddress}
                onPress={handleAddressPress}
              />

              {/* Product List */}
              <ProductList items={items} />

              {/* Express Selector */}
              <ExpressSelector
                value={selectedExpressId}
                onChange={setSelectedExpressId}
              />

              {/* Order Remark */}
              <OrderRemark value={remark} onChange={setRemark} />

              {/* Payment Method Selector */}
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              {/* Price Summary */}
              {price && <PriceSummary price={price} />}
            </>
          )}
        </div>
      </main>

      {/* Checkout Footer */}
      <CheckoutFooter
        totalAmount={price?.payPrice ?? 0}
        itemCount={totalItemCount}
        onSubmit={handleSubmit}
        isLoading={isCreatingOrder}
        disabled={isLoading || items.length === 0 || !displayAddress}
      />

      {/* Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent className='max-w-[85vw] rounded-[20px] sm:max-w-lg'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertCircle className='size-5 text-red-500' />
              提示
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setErrorDialogOpen(false)}
              className='rounded-full bg-moon-purple hover:bg-moon-purple/90'
            >
              知道了
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
