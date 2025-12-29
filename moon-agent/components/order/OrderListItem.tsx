"use client";

import Image from "next/image";
import {
  AppTradeOrderPageItem,
  ORDER_STATUS_MAP,
  formatPrice,
} from "@/lib/order/orderApi";

/**
 * OrderListItem - Single order card in order list
 * Story 5.5: AC 3 - Order list item display
 *
 * Features:
 * - Order ID/number
 * - Status with color coding
 * - Pay price
 * - Item list with images and properties
 */
interface OrderListItemProps {
  order: AppTradeOrderPageItem;
}

export default function OrderListItem({ order }: OrderListItemProps) {
  const statusInfo = ORDER_STATUS_MAP[order.status] || {
    label: "未知",
    color: "text-gray-500",
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      {/* Header: Order number and status */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          订单号: <span className="text-gray-700 font-mono">{order.no}</span>
        </div>
        <div className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            {/* Item Image */}
            <div className="relative size-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {item.picUrl ? (
                <Image
                  src={item.picUrl}
                  alt={item.spuName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  暂无图片
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 line-clamp-2">{item.spuName}</p>
              {item.properties && item.properties.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.properties.map((p) => p.valueName).join("; ")}
                </p>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-700">
                  ¥{formatPrice(item.price)}
                </span>
                <span className="text-xs text-gray-500">x{item.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Total price */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-end gap-1">
          <span className="text-sm text-gray-500">
            共{order.items.reduce((sum, item) => sum + item.count, 0)}件
          </span>
          <span className="text-sm text-gray-700">实付</span>
          <span className="text-base font-semibold text-[#8b5cf6]">
            ¥{formatPrice(order.payPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

