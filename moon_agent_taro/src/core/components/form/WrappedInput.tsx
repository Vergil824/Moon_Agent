/**
 * WrappedInput - Custom Input component to solve Taro3 input lag/jitter issue
 *
 * Problem: Taro3 uses template rendering with page-level diff by default.
 * This causes performance issues with Input components during fast typing.
 *
 * Solution: Use <CustomWrapper> to isolate Input into its own custom component,
 * which limits diff to the component level instead of page level.
 *
 * Reference: https://github.com/NervJS/taro/issues/13979
 *
 * Key points:
 * 1. CustomWrapper creates a separate rendering context (custom component in mini-program)
 * 2. Input value is managed inside this component to avoid page-level setData
 * 3. Memoized to prevent re-mounts when parent re-renders
 */
import { Input, CustomWrapper } from '@tarojs/components';
import type { InputProps } from '@tarojs/components';
import { memo, useCallback, useState } from 'react';

export interface WrappedInputProps {
  /** Custom class name for the Input */
  className?: string;
  /** Input type - 'text' | 'number' | 'digit' | 'idcard' */
  type?: InputProps['type'];
  /** Placeholder text */
  placeholder?: string;
  /** Placeholder class name (for styling placeholder text) */
  placeholderClass?: string;
  /** Max length */
  maxLength?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Called on every input - use this to sync value to parent */
  onImmediateChange?: (value: string) => void;
  /** Called on blur */
  onBlur?: () => void;
  /** Called on focus */
  onFocus?: () => void;
  /** Debounce delay - kept for API compatibility but not used in this simplified version */
  debounceDelay?: number;
  /** Default value - used only for initial render */
  defaultValue?: string;
  /** Value - kept for API compatibility but not used */
  value?: string;
  /** onChange - kept for API compatibility but recommend using onImmediateChange */
  onChange?: (value: string) => void;
}

/**
 * WrappedInput - A simple Input wrapped with CustomWrapper
 *
 * This creates a separate custom component in the mini-program,
 * which isolates the diff to this component level only.
 *
 * Usage:
 * ```tsx
 * <WrappedInput
 *   className="your-styles"
 *   placeholder="Enter text"
 *   onImmediateChange={(val) => { myRef.current = val; }}
 * />
 * ```
 */
export const WrappedInput = memo(function WrappedInput({
  className = '',
  type = 'text',
  placeholder,
  placeholderClass,
  maxLength,
  disabled = false,
  defaultValue,
  onImmediateChange,
  onBlur,
  onFocus,
  onChange,
}: WrappedInputProps) {
  const [inputValue, setInputValue] = useState(() => defaultValue ?? '');

  // Handle input - call both immediate and debounced callbacks
  const handleInput = useCallback(
    (e: { detail: { value: string } }) => {
      const newValue = e.detail.value;
      setInputValue(newValue);
      // Immediate callback for real-time sync
      onImmediateChange?.(newValue);
      // Also call onChange for backwards compatibility
      onChange?.(newValue);
    },
    [onImmediateChange, onChange]
  );

  return (
    <CustomWrapper>
      {/*
        Note:
        - value is managed inside this custom component
        - parent does not pass value to avoid page-level sync issues
      */}
      <Input
        className={className}
        type={type}
        placeholder={placeholder}
        placeholderClass={placeholderClass}
        maxlength={maxLength}
        disabled={disabled}
        value={inputValue}
        onInput={handleInput}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </CustomWrapper>
  );
});

export default WrappedInput;
