import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import { Shop } from '@taroify/icons';
import { MaterialIcons } from 'taro-icons';
import type { StateComponentProps, Product } from './types';
import { useChatStore } from '../../stores';
import { addCartItem } from '../../cart/cartApi';

/**
 * RecommendationCard - Individual product card in list view
 */
function RecommendationCard({
  product,
  onViewDetail,
  onAddToCart,
  isAdded,
  isAdding,
}: {
  product: Product;
  onViewDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAdded: boolean;
  isAdding: boolean;
}) {
  const { product_name, price, image_url, features = [], size } = product;

  return (
    <View
      className='w-full bg-white rounded-[24px] overflow-hidden mb-4 animate-slide-up moon-shadow-product-card'
      onClick={() => onViewDetail(product)}
    >
      {/* Product Image Area with Price Badge */}
      <View
        className='relative h-[180px] w-full flex items-center justify-center overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%)',
        }}
      >
        {image_url ? (
          <Image
            src={image_url}
            mode='aspectFit'
            className='w-full h-full p-2'
          />
        ) : (
          <Text className='text-6xl'>👙</Text>
        )}

        {/* Price Tag Badge */}
        <View className='absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm'>
          <Text className='text-sm font-bold text-moon-pink'>¥{price}</Text>
        </View>
      </View>

      {/* Product Info Area */}
      <View className='p-4 flex flex-col gap-3'>
        <View className='flex justify-between items-start gap-2'>
          <Text className='font-bold text-gray-800 text-lg leading-tight flex-1'>
            {product_name}
          </Text>
          {size && (
            <View className='shrink-0 px-2 py-1 rounded-md moon-size-badge'>
              <Text className='text-xs font-bold'>{size}</Text>
            </View>
          )}
        </View>

        {/* Feature Tags */}
        {features.length > 0 && (
          <View className='flex flex-wrap gap-2'>
            {features.map((feature, idx) => (
              <View
                key={idx}
                className='px-3 py-1 rounded-full moon-feature-tag'
              >
                <Text className='text-xs font-medium'>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        <View className='mt-2'>
          <Button
            type='primary'
            block
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className='h-11 rounded-[14px] font-semibold'
            style={{
              background: isAdded || isAdding ? '#C4B5FD' : '#8B5CF6',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <View className='flex items-center justify-center gap-2'>
              <MaterialIcons name='shopping-cart' size={16} color='#fff' />
              <View className='text-white'>
                {isAdded ? '已加购' : isAdding ? '处理中...' : '加入购物车'}
              </View>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}

/**
 * RecommendationGuide - Entry card shown in chat flow
 */
function RecommendationGuide({ onClick }: { onClick: () => void }) {
  return (
    <View
      className='w-full p-4 rounded-[20px] bg-white border border-gray-100 flex items-center gap-4 animate-scale-in moon-shadow-guide'
      onClick={onClick}
    >
      <View
        className='w-12 h-12 rounded-[14px] shadow-sm flex items-center justify-center shrink-0'
        style={{
          background: 'linear-gradient(135deg, #F6339A 0%, #FF2056 100%)',
        }}
      >
        <Shop size={24} color='#fff' />
      </View>

      <View className='flex-1 flex flex-col gap-0.5'>
        <Text className='text-[16px] font-medium text-gray-800'>商品推荐</Text>
        <Text className='text-[14px] text-gray-500'>查看适合你的内衣推荐</Text>
      </View>

      <MaterialIcons name='arrow-forward' size={24} color='#8B5CF6' />
    </View>
  );
}

/**
 * ProductDetail - Full product detail view
 */
function ProductDetail({
  product,
  onBack,
  onAddToCart,
  isAdded,
}: {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  isAdded: boolean;
}) {
  const { product_name, image_url } = product;

  return (
    <View className='flex flex-col gap-4 animate-slide-in-right'>
      {/* Back button */}
      <View className='flex items-center gap-2 mb-4' onClick={onBack}>
        <View className='p-1 rounded-full bg-white/20'>
          <MaterialIcons name='arrow-back' size={24} color='#fff' />
        </View>
        <Text className='text-lg font-bold text-white'>商品详情</Text>
      </View>

      <View className='bg-white rounded-[24px] overflow-hidden p-6 flex flex-col gap-6 moon-shadow-product-card'>
        {/* Hero Image */}
        <View
          className='relative h-[200px] w-full rounded-[20px] overflow-hidden flex items-center justify-center'
          style={{
            background: 'linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%)',
          }}
        >
          {image_url ? (
            <Image
              src={image_url}
              mode='aspectFit'
              className='w-full h-full p-4'
            />
          ) : (
            <Text className='text-[80px]'>👙</Text>
          )}
        </View>

        {/* Content */}
        <View className='flex flex-col gap-4'>
          <Text className='text-2xl font-bold text-gray-900'>
            {product_name}
          </Text>

          <View className='text-gray-600 leading-relaxed'>
            <Text className='block'>
              这款内衣专为您的胸型设计，采用高弹力记忆钢圈，完美贴合胸部曲线。
            </Text>
            <Text className='block mt-2'>
              柔软的莫代尔棉内衬给肌肤婴儿般的触感，侧比加高设计有效收纳副乳，
              配合U型美背剪裁，让您在享受舒适支撑的同时，展现迷人背部线条。
              无论是日常通勤还是居家休闲，它都是您的贴心伴侣。
            </Text>
          </View>
        </View>

        {/* Add to cart button */}
        <Button
          type='primary'
          block
          onClick={() => onAddToCart(product)}
          className='h-12 rounded-[14px] font-semibold'
          style={{
            background: isAdded ? '#C4B5FD' : '#8B5CF6',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <View className='flex items-center justify-center gap-2'>
            <MaterialIcons name='shopping-cart' size={16} color='#fff' />
            <View className='text-white'>
              {isAdded ? '已加购' : '加入购物车'}
            </View>
          </View>
        </Button>
      </View>
    </View>
  );
}

/**
 * ProductRecommendation - Product recommendation system
 * Aligned with moon-agent/components/chat/ProductRecommendation.tsx
 *
 * Features:
 * - Guide card in chat flow
 * - Full-screen results overlay
 * - List view with product cards
 * - Detail view with back navigation
 * - Add to cart with toast feedback (UI only)
 * - Story 3.5: Auto-open when streaming ends
 */
export function ProductRecommendation({ payload }: StateComponentProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>(
    {}
  );
  const [pendingAdds, setPendingAdds] = useState<Record<string, boolean>>({});

  // Story 3.5: Access store for auto-open feature
  const isStreaming = useChatStore((s) => s.isStreaming);
  const recommendedProducts = useChatStore((s) => s.recommendedProducts);
  const hasAutoOpenedCurrentState = useChatStore(
    (s) => s.hasAutoOpenedCurrentState
  );
  const setHasAutoOpenedCurrentState = useChatStore(
    (s) => s.setHasAutoOpenedCurrentState
  );

  // Use products from payload if available, else from store
  const payloadProducts = (payload?.products as Product[]) || [];
  const products =
    payloadProducts.length > 0 ? payloadProducts : recommendedProducts;

  const getProductKey = (product: Product) =>
    String(product.sku_id ?? product.product_name);

  // Story 3.5: Auto-open results when streaming ends (aligned with moon-agent)
  // Only auto-open if:
  // 1. Streaming finished (!isStreaming)
  // 2. We haven't already auto-opened (!hasAutoOpenedCurrentState)
  // 3. There are products to show (products.length > 0)
  useEffect(() => {
    if (!isStreaming && !hasAutoOpenedCurrentState && products.length > 0) {
      setHasAutoOpenedCurrentState(true);
      setShowResults(true);
    }
  }, [
    isStreaming,
    hasAutoOpenedCurrentState,
    products.length,
    setHasAutoOpenedCurrentState,
  ]);

  const handleAddToCart = async (product: Product) => {
    const key = getProductKey(product);
    if (pendingAdds[key] || addedProducts[key]) return;

    // Validate sku_id exists
    if (!product.sku_id) {
      Taro.showToast({
        title: '商品信息不完整',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    // Mark as pending
    setPendingAdds((prev) => ({ ...prev, [key]: true }));

    try {
      // Call real cart API
      const response = await addCartItem({
        skuId: product.sku_id,
        count: 1,
      });

      if (response.code === 0) {
        setAddedProducts((prev) => ({ ...prev, [key]: true }));
        Taro.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 2000,
        });
      } else {
        Taro.showToast({
          title: response.msg || '加入购物车失败',
          icon: 'none',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[ProductRecommendation] Add to cart error:', error);
      Taro.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      setPendingAdds((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Empty state
  if (products.length === 0) {
    return (
      <View className='w-full py-6 text-center bg-white/50 rounded-2xl border border-dashed border-purple-200'>
        <Text className='text-gray-400 text-sm'>正在寻找最适合你的内衣...</Text>
      </View>
    );
  }

  return (
    <View className='w-full flex flex-col items-center gap-4 mt-2'>
      {/* Guide Card */}
      <RecommendationGuide
        onClick={() => {
          // Mark as opened to prevent auto-open from re-triggering
          setHasAutoOpenedCurrentState(true);
          setSelectedProduct(null);
          setShowResults(true);
        }}
      />

      {/* Full-screen Results Overlay - custom implementation for mini program scroll */}
      {showResults && (
        <View
          className='fixed inset-0 z-50 flex flex-col bg-black/20 backdrop-blur-md'
          catchMove
        >
          {/* Header - only in list view */}
          {!selectedProduct && (
            <View className='flex-none px-6 pt-12 pb-4 flex justify-between items-center'>
              <View className='flex flex-col'>
                <Text className='text-xl font-bold text-white'>为您精选</Text>
                <Text className='text-sm text-white/90'>
                  共 {products.length} 款适合您的内衣
                </Text>
              </View>
              <View
                className='w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md'
                onClick={() => setShowResults(false)}
              >
                <MaterialIcons name='close' size={24} color='#1F2937' />
              </View>
            </View>
          )}

          {/* Scrollable content with fixed height for mini program */}
          <ScrollView
            className='w-full'
            style={{
              height: selectedProduct ? '100vh' : 'calc(100vh - 120px)',
            }}
            scrollY
            enhanced
            showScrollbar={false}
          >
            <View className='px-4 py-4 pb-safe'>
              {selectedProduct ? (
                <ProductDetail
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                  onAddToCart={handleAddToCart}
                  isAdded={!!addedProducts[getProductKey(selectedProduct)]}
                />
              ) : (
                products.map((product, idx) => (
                  <RecommendationCard
                    key={`${getProductKey(product)}-${idx}`}
                    product={product}
                    onViewDetail={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                    isAdded={!!addedProducts[getProductKey(product)]}
                    isAdding={!!pendingAdds[getProductKey(product)]}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
