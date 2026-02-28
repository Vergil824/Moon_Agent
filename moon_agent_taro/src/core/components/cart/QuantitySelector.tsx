/**
 * QuantitySelector - Quantity increment/decrement control
 * Migrated from moon-agent/components/cart/QuantitySelector.tsx for Taro
 *
 * Requirements per Figma design:
 * - Border: 1px #e5e7eb rounded
 * - Minus button on left, plus button on right
 * - Current quantity in the center
 * - Disabled state when at min/max
 */

import { View, Text } from "@tarojs/components";

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = "sm",
}: QuantitySelectorProps) {
  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  // Larger sizes for better touch experience
  const containerHeight = size === "sm" ? "h-[30px]" : "h-[36px]";
  const buttonSize = size === "sm" ? "w-[30px] h-[30px]" : "w-[36px] h-[36px]";
  const fontSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <View
      className={`flex items-center border border-gray-300 rounded-[15px] overflow-hidden ${containerHeight}`}
      style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#d1d5db' }}
    >
      {/* Decrement Button - */}
      <View
        className={`flex items-center justify-center ${buttonSize} ${
          canDecrement ? "active:bg-gray-100" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleDecrement();
        }}
        hoverClass={canDecrement ? "bg-gray-100" : "none"}
      >
        <Text
          className={`${fontSize} font-medium leading-none ${
            canDecrement ? "text-moon-text-muted" : "text-gray-300"
          }`}
        >
          −
        </Text>
      </View>

      {/* Quantity Display */}
      <View className="w-[36px] flex items-center justify-center">
        <Text className={`${fontSize} font-medium text-moon-text text-center`}>
          {value}
        </Text>
      </View>

      {/* Increment Button + */}
      <View
        className={`flex items-center justify-center ${buttonSize} ${
          canIncrement ? "active:bg-gray-100" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleIncrement();
        }}
        hoverClass={canIncrement ? "bg-gray-100" : "none"}
      >
        <Text
          className={`${fontSize} font-medium leading-none ${
            canIncrement ? "text-moon-text-muted" : "text-gray-300"
          }`}
        >
          +
        </Text>
      </View>
    </View>
  );
}

export default QuantitySelector;
