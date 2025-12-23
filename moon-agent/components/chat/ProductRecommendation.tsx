"use client";

import Image from "next/image";
import { Star, X, ChevronRight, ShoppingBag, ShoppingCart, ChevronLeft, CheckCircle2, Undo2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { StateComponentProps } from "./StateComponents";
import { useChatStore, Product } from "@/lib/store";
import { toast } from "sonner";

/**
 * Individual Product Card component - Updated per Figma 14:4931
 */
type RecommendationCardProps = {
  product: Product;
  onSelect: (val: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  isAdded: boolean;
};

function RecommendationCard({ product, onSelect, onAddToCart, onViewDetail, isAdded }: RecommendationCardProps) {
  const { product_name, price, matching, image_url, description, style, features = [], size } = product;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onViewDetail(product)}
      className="w-full bg-white rounded-[24px] overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex flex-col mb-4 cursor-pointer hover:shadow-xl transition-shadow"
    >
      {/* Product Image Area with Price Badge */}
      <div className="relative h-[180px] w-full bg-gradient-to-br from-[#F3E8FF] to-[#FCE7F3] flex items-center justify-center overflow-hidden">
        {image_url ? (
          <Image 
            src={image_url} 
            alt={product_name} 
            fill 
            unoptimized
            className="object-contain p-2"
            sizes="(max-w-768px) 100vw, 400px"
          />
        ) : (
          <div className="text-[60px]">👙</div> 
        )}
        
        {/* Price Tag Badge */}
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-bold text-[#EC4899]">¥{price}</span>
        </div>
      </div>

      {/* Product Info Area */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{product_name}</h3>
            {size && (
              <span className="shrink-0 px-2 py-1 rounded-md bg-[#F3E8FF] text-[#8B5CF6] text-xs font-bold border border-[#E9D4FF]">
                {size}
              </span>
            )}
          </div>
        </div>
        
        {/* Feature Tags */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.map((feature, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#FAF5FF] text-[#8B5CF6] border border-[#E9D4FF]"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={isAdded}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#C4B5FD] text-white rounded-[14px] h-11 font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdded ? "已加购" : "加入购物车"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Recommendation Guide Card (Figma 14:3512)
 */
function RecommendationGuide({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full max-w-[320px] p-4 rounded-[20px] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md"
    >
      <div 
        className="size-12 rounded-[14px] shadow-sm flex items-center justify-center shrink-0"
        style={{ backgroundImage: "linear-gradient(135deg, #F6339A 0%, #FF2056 100%)" }}
      >
        <ShoppingBag className="size-6 text-white" />
      </div>
      
      <div className="flex-1 flex flex-col gap-0.5">
        <h3 className="text-[16px] font-medium text-gray-800">商品推荐</h3>
        <p className="text-[14px] text-gray-500">查看适合你的内衣推荐</p>
      </div>
      
      <ChevronRight className="size-6 text-[#8B5CF6]" />
    </motion.div>
  );
}

type ProductDetailProps = {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onSelect: (value: string) => void;
  isAdded: boolean;
};

function ProductDetail({ product, onBack, onAddToCart, onSelect, isAdded }: ProductDetailProps) {
  const { product_name, description, image_url } = product;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-4"
    >
      {/* Sticky Header inside Detail View */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-4 group w-fit"
      >
        <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/40 text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors">商品详情</h2>
      </button>

      <div className="bg-white rounded-[24px] overflow-hidden shadow-lg p-6 flex flex-col gap-6">
        {/* Hero Image */}
        <div className="relative h-[200px] w-full rounded-[20px] overflow-hidden bg-gradient-to-br from-[#F3E8FF] to-[#FCE7F3] flex items-center justify-center">
          {image_url ? (
            <Image
              src={image_url}
              alt={product_name}
              fill
              unoptimized
              className="object-contain p-4"
            />
          ) : (
            <div className="text-[80px]">👙</div>
          )}
        </div>

        {/* Simplified Content: Soft Text Only */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{product_name}</h1>
          
          <div className="prose prose-purple prose-sm text-gray-600 leading-relaxed">
            <p>
              {/* Fixed Placeholder Text as requested */}
              这款内衣专为您的胸型设计，采用高弹力记忆钢圈，完美贴合胸部曲线。
              <br/><br/>
              柔软的莫代尔棉内衬给肌肤婴儿般的触感，侧比加高设计有效收纳副乳，
              配合U型美背剪裁，让您在享受舒适支撑的同时，展现迷人背部线条。
              无论是日常通勤还是居家休闲，它都是您的贴心伴侣。
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Product Recommendation System (Figma 14:3512 & 14:4560)
 */
export function ProductRecommendation({ payload, onSelect }: StateComponentProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({});
  const products = (payload?.products as Product[]) || [];
  const recommendedProducts = useChatStore((state) => state.recommendedProducts);
  
  // Use products from payload if available, else from store
  const displayProducts = products.length > 0 ? products : recommendedProducts;

  const handleAddToCart = (product: Product) => {
    setAddedProducts((prev) => ({ ...prev, [product.product_name]: true }));
    
    toast.custom((t) => (
      <div className="mx-auto w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-purple-100 p-4 flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm">已加入购物车</h4>
          <p className="text-xs text-gray-500 truncate">{product.product_name} · {product.size}</p>
        </div>
        <button 
          onClick={() => {
            setAddedProducts((prev) => {
              const next = { ...prev };
              delete next[product.product_name];
              return next;
            });
            toast.dismiss(t);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-colors"
        >
          <Undo2 className="w-3 h-3" />
          撤回
        </button>
      </div>
    ), { duration: 4000 });
  };

  if (displayProducts.length === 0) {
    return (
      <div className="w-full py-6 text-center bg-white/50 rounded-2xl border border-dashed border-purple-200">
        <p className="text-gray-400 text-sm">正在寻找最适合你的内衣...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-2">
      {/* 1. The Guide Card shown in Chat Flow (Figma 14:3512) */}
      <RecommendationGuide
        onClick={() => {
          setSelectedProduct(null);
          setShowResults(true);
        }}
      />

      {/* 2. The Full-Screen Results Overlay (Figma 14:4560) */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-md flex flex-col justify-end sm:justify-center"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-full flex flex-col"
            >
              {/* Header - Only shown in List View */}
            {!selectedProduct && (
              <div className="flex-none px-6 pt-12 pb-4 flex justify-between items-center">
                 <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-white shadow-sm">为您精选</h2>
                    <p className="text-sm text-white/90 shadow-sm">共 {displayProducts.length} 款适合您的内衣</p>
                 </div>
                 <button 
                    onClick={() => setShowResults(false)}
                    className="size-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-800" />
                  </button>
              </div>
            )}

            {/* Scrollable Content Area - Hiding Scrollbar */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               {selectedProduct ? (
                  <ProductDetail
                    product={selectedProduct}
                    onBack={() => setSelectedProduct(null)}
                    onAddToCart={handleAddToCart}
                    onSelect={(val) => {
                      setShowResults(false);
                      setSelectedProduct(null);
                    }}
                    isAdded={!!addedProducts[selectedProduct.product_name]}
                  />
               ) : (
                  displayProducts.map((product, idx) => (
                    <RecommendationCard 
                      key={`${product.product_name}-${idx}`} 
                      product={product} 
                      onSelect={(val) => setShowResults(false)} 
                      onAddToCart={handleAddToCart}
                      onViewDetail={(p) => setSelectedProduct(p)}
                      isAdded={!!addedProducts[product.product_name]}
                    />
                  ))
               )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
