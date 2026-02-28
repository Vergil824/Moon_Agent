/**
 * AddressEmptyState - Empty state for address list
 * Migrated from moon-agent/components/address/AddressEmptyState.tsx for Taro
 */

import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import { LocationOutlined, Add } from "@taroify/icons";

type AddressEmptyStateProps = {
  onAddClick?: () => void;
};

export function AddressEmptyState({ onAddClick }: AddressEmptyStateProps) {
  return (
    <View className="flex flex-col items-center justify-center py-16 px-4">
      <View className="w-20 h-20 rounded-full bg-moon-purple/10 flex items-center justify-center mb-4">
        <LocationOutlined size={40} className="text-moon-purple" />
      </View>
      <Text className="text-lg font-medium text-moon-text mb-2 block">
        还没有收货地址
      </Text>
      <Text className="text-sm text-moon-text-muted mb-6 text-center block">
        添加一个收货地址，让配送更便捷
      </Text>
      <Button
        type="primary"
        className="rounded-full!"
        style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
        onClick={onAddClick}
      >
        <View className="flex items-center gap-2">
          <Add size={16} />
          <Text>添加新地址</Text>
        </View>
      </Button>
    </View>
  );
}

export default AddressEmptyState;
