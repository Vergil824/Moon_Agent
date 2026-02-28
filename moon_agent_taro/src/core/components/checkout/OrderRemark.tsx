/**
 * OrderRemark - Order remark input component
 * Migrated from moon-agent/components/checkout/OrderRemark.tsx for Taro
 *
 * Per Figma (node-id=166:732):
 * - Compact single-row display
 * - Click to expand or show modal for input
 * - Show current value or placeholder
 */

import { View, Text } from "@tarojs/components";
import { useState, useCallback } from "react";
import { ArrowRight } from "@taroify/icons";
import { Dialog, Input } from "@nutui/nutui-react-taro";

type OrderRemarkProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
};

export function OrderRemark({
  value,
  onChange,
  maxLength = 100,
  placeholder = "无备注",
}: OrderRemarkProps) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handlePress = useCallback(() => {
    setTempValue(value);
    setDialogVisible(true);
  }, [value]);

  const handleConfirm = useCallback(() => {
    onChange(tempValue);
    setDialogVisible(false);
  }, [tempValue, onChange]);

  const handleCancel = useCallback(() => {
    setTempValue(value);
    setDialogVisible(false);
  }, [value]);

  const displayText = value || placeholder;
  const hasValue = !!value;

  return (
    <>
      {/* Compact Row Display */}
      <View
        className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between active:bg-gray-50"
        onClick={handlePress}
      >
        {/* Label */}
        <Text className="text-sm text-moon-text-muted">订单备注</Text>

        {/* Value + Arrow */}
        <View className="flex items-center gap-1">
          <Text
            className={`text-sm ${hasValue ? "text-moon-text" : "text-gray-400"}`}
          >
            {displayText}
          </Text>
          <ArrowRight size={16} className="text-gray-400" />
        </View>
      </View>

      {/* Input Dialog */}
      <Dialog
        visible={dialogVisible}
        title="订单备注"
        onClose={handleCancel}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelText="取消"
        confirmText="确定"
      >
        <View className="px-2">
          <Input
            value={tempValue}
            onChange={(val) => setTempValue(val)}
            placeholder="选填，可以备注您的特殊需求"
            maxLength={maxLength}
            className="border border-gray-200 rounded-lg px-3 py-2"
          />
          <Text className="text-xs text-gray-400 mt-2 text-right">
            {tempValue.length}/{maxLength}
          </Text>
        </View>
      </Dialog>
    </>
  );
}

export default OrderRemark;
