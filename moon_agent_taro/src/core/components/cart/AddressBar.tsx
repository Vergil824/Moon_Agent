/**
 * AddressBar - Delivery address display component
 * Migrated from moon-agent/components/cart/AddressBar.tsx for Taro
 *
 * Requirements:
 * - Rounded card with glass morphism effect
 * - Location icon on the left
 * - Address text (truncated if too long)
 * - Right arrow for navigation to address selection
 * - Support for Address object or string
 */

import { View, Text } from '@tarojs/components';
import { Location, ArrowRight } from '@taroify/icons';
import {
  type Address,
  formatFullAddress,
  maskPhoneNumber,
} from '@core/address';

type AddressBarProps = {
  /** Address object from API, or null if no address */
  address?: Address | null;
  /** Fallback text when no address (for backward compatibility) */
  addressText?: string;
  onPress?: () => void;
};

export function AddressBar({ address, addressText, onPress }: AddressBarProps) {
  // Determine what to display
  const hasAddress = !!address;
  const displayText = hasAddress
    ? formatFullAddress(address)
    : addressText || '请稍后添加地址';

  return (
    <View
      className='w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/60 backdrop-blur border border-white/50 rounded-[14px] shadow-sm active:bg-white/80'
      onClick={onPress}
    >
      {/* Left: Icon + Address info */}
      <View className='flex items-center gap-2 min-w-0 flex-1'>
        <View className='w-8 h-8 rounded-full bg-[#FFF5F7] flex items-center justify-center shrink-0'>
          <Location size={16} className='text-moon-pink' />
        </View>

        {hasAddress ? (
          <View className='min-w-0 flex-1'>
            <View className='flex items-center gap-2'>
              <Text className='text-sm font-medium text-moon-text truncate'>
                {address.name}
              </Text>
              <Text className='text-xs text-moon-text-muted'>
                {maskPhoneNumber(address.mobile)}
              </Text>
            </View>
            <Text className='text-xs text-moon-text-muted truncate mt-0.5'>
              配送至: {displayText}
            </Text>
          </View>
        ) : (
          <Text className='text-sm text-moon-text-muted'>{displayText}</Text>
        )}
      </View>

      {/* Right: Chevron */}
      <ArrowRight size={16} className='text-gray-400 shrink-0' />
    </View>
  );
}

export default AddressBar;
