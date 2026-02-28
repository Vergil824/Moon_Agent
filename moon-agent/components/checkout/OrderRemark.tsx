"use client";

import { useState, useCallback } from "react";

/**
 * OrderRemark - Order remark input component
 * Story 4.4: Task 3.3 - Order remark input
 *
 * Requirements per AC 1:
 * - Support user text input for simple notes
 * - Character limit and placeholder text
 */

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
  placeholder = "选填，可以备注您的特殊需求",
}: OrderRemarkProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    [onChange, maxLength]
  );

  return (
    <div data-testid="order-remark" className="bg-white rounded-2xl p-4">
      <div className="flex items-start gap-3">
        {/* Label */}
        <span className="text-sm font-medium text-moon-text whitespace-nowrap pt-2">
          订单备注
        </span>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            data-testid="order-remark-input"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={2}
            className={`w-full px-3 py-2 text-sm rounded-lg resize-none transition-colors ${
              isFocused
                ? "bg-[#FFF5F7] border border-moon-pink/30"
                : "bg-gray-50 border border-transparent"
            } focus:outline-none placeholder:text-gray-400`}
          />

          {/* Character Count */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderRemark;

