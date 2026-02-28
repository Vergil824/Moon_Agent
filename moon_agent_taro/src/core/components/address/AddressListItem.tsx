/**
 * AddressListItem - Single address item with dual hot zones
 * Migrated from moon-agent/components/address/AddressListItem.tsx for Taro
 *
 * Dual Hot Zone Design:
 * - Hot Zone A (main area): In manage mode -> edit; In select mode -> select & return
 * - Hot Zone B (edit icon): Always navigates to edit form
 */

import { View, Text } from "@tarojs/components";
import { MaterialIcons } from "taro-icons";
import {
  maskPhoneNumber,
  formatFullAddress,
  type Address,
} from "@core/address";

type AddressListItemProps = {
  address: Address;
  mode?: "manage" | "select";
  onMainClick?: () => void;
  onEditClick?: () => void;
};

export function AddressListItem({
  address,
  mode = "manage",
  onMainClick,
  onEditClick,
}: AddressListItemProps) {
  const handleMainClick = () => {
    onMainClick?.();
  };

  const handleEditClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // Prevent triggering main click
    onEditClick?.();
  };

  return (
    <View
      className={`relative p-4 bg-white rounded-xl border border-gray-100 ${
        mode === "select" ? "active:bg-gray-50" : ""
      }`}
      onClick={handleMainClick}
    >
      {/* Main Content Area */}
      <View className="pr-10">
        {/* Name, Phone, Default Badge Row */}
        <View className="flex items-center gap-2 mb-2">
          <Text className="font-medium text-moon-text">{address.name}</Text>
          <Text className="text-moon-text-muted text-sm">
            {maskPhoneNumber(address.mobile)}
          </Text>
          {address.defaultStatus && (
            <View className="ml-auto px-2 py-0.5 bg-moon-purple/10 rounded">
              <Text className="text-xs font-medium text-moon-purple">默认</Text>
            </View>
          )}
        </View>

        {/* Full Address */}
        <Text className="text-sm text-moon-text-muted leading-relaxed block">
          {formatFullAddress(address)}
        </Text>
      </View>

      {/* Edit Button (Hot Zone B) */}
      <View
        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
        onClick={handleEditClick}
      >
        <MaterialIcons name="edit" size={16} color="#9ca3af" />
      </View>
    </View>
  );
}

export default AddressListItem;
