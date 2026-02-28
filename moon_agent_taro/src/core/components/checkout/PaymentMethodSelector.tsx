/**
 * PaymentMethodSelector - Payment method selection component
 * Migrated from moon-agent/components/checkout/PaymentMethodSelector.tsx for Taro
 *
 * Requirements:
 * - In WeChat Mini Program: Only show "微信支付" (Alipay is NOT supported)
 * - In H5: Show both "微信支付" and "支付宝" options
 * - Selected item has colored background and border emphasis
 *
 * IMPORTANT: WeChat Mini Program does NOT support Alipay payment.
 * This is a platform limitation due to competition between WeChat and Alipay.
 */

import { View, Text } from '@tarojs/components';
import { WechatPay } from '@taroify/icons';

export type PaymentMethod = 'wechat' | 'alipay';

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

type PaymentOption = {
  id: PaymentMethod;
  name: string;
  selectedBg: string;
  selectedBorder: string;
  iconBg: string;
};

const isWeapp = process.env.TARO_ENV === 'weapp';

// WeChat Pay option - always available
const wechatOption: PaymentOption = {
  id: 'wechat',
  name: '微信支付',
  selectedBg: 'bg-[rgba(240,253,244,0.3)]',
  selectedBorder: 'border-[#07C160]',
  iconBg: '#07C160',
};

// Alipay option - only available in H5
const alipayOption: PaymentOption = {
  id: 'alipay',
  name: '支付宝',
  selectedBg: 'bg-[rgba(232,244,253,0.3)]',
  selectedBorder: 'border-[#1677FF]',
  iconBg: '#1677FF',
};

// In WeChat Mini Program, only show WeChat Pay
// In H5, show both options
const paymentOptions: PaymentOption[] = isWeapp
  ? [wechatOption]
  : [wechatOption, alipayOption];

// WeChat Pay Icon Component - Uses Taroify icon
function WechatPayIcon() {
  return (
    <WechatPay size={20} color='#ffffff' />
  );
}

// Alipay Icon Component - Uses text "支" as icon (per Figma)
function AlipayIcon() {
  return (
    <Text className='text-xs font-bold text-white'>支</Text>
  );
}

export function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  const handleSelect = (option: PaymentOption) => {
    onChange(option.id);
  };

  return (
    <View className='bg-white rounded-2xl p-4'>
      {/* Section Title */}
      <Text className='text-base font-semibold text-moon-text block mb-3'>
        支付方式
      </Text>

      {/* Payment Options - Vertical layout per Figma */}
      <View className='space-y-3'>
        {paymentOptions.map((option) => {
          const isSelected = value === option.id;
          return (
            <View
              key={option.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isSelected
                  ? `${option.selectedBg} ${option.selectedBorder}`
                  : 'bg-white border-gray-100'
              }`}
              onClick={() => handleSelect(option)}
            >
              {/* Left: Icon + Name */}
              <View className='flex items-center gap-3'>
                {/* Payment Icon Container */}
                <View
                  className='w-8 h-8 rounded flex items-center justify-center'
                  style={{ backgroundColor: option.iconBg }}
                >
                  {option.id === 'wechat' ? <WechatPayIcon /> : <AlipayIcon />}
                </View>

                {/* Payment Name */}
                <Text className='text-sm font-medium text-moon-text'>
                  {option.name}
                </Text>
              </View>

              {/* Right: Radio indicator */}
              <View
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#07C160] bg-white' : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <View className='w-2 h-2 rounded-full bg-[#07C160]' />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Info text for WeChat Mini Program */}
      {isWeapp && (
        <Text className='text-xs text-moon-text-muted mt-3 block'>
          微信小程序仅支持微信支付
        </Text>
      )}
    </View>
  );
}

export default PaymentMethodSelector;
