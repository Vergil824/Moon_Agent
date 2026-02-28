/**
 * OrderEmptyState - Empty state when no orders
 * Migrated from moon-agent/components/order/OrderEmptyState.tsx for Taro
 */

import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";
import { ShopOutlined } from "@taroify/icons";

interface OrderEmptyStateProps {
  onGoShopping?: () => void;
}

export function OrderEmptyState({ onGoShopping }: OrderEmptyStateProps) {
  const handleGoShopping = () => {
    if (onGoShopping) {
      onGoShopping();
    } else {
      // Navigate to chat (main shopping page)
      Taro.switchTab({ url: "/pages/chat/index" });
    }
  };

  return (
    <View className="flex flex-col items-center justify-center py-16 px-4">
      <View className="w-20 h-20 rounded-full bg-moon-purple/10 flex items-center justify-center mb-4">
        <ShopOutlined size={40} className="text-moon-purple" />
      </View>
      <Text className="text-base font-medium text-moon-text mb-1 block">
        暂无订单
      </Text>
      <Text className="text-sm text-moon-text-muted text-center mb-6 block">
        您还没有任何订单，快去选购心仪的商品吧
      </Text>
      <Button
        type="primary"
        size="small"
        className="rounded-full!"
        style={{ backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }}
        onClick={handleGoShopping}
      >
        去购物
      </Button>
    </View>
  );
}

export default OrderEmptyState;
