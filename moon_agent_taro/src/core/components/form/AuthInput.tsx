/**
 * AuthInput - Lightweight input for auth forms
 *
 * Key points:
 * - Uncontrolled Input to avoid value flicker on mini program
 * - Stable handlers via refs to prevent unnecessary re-renders
 */
import { Input } from '@tarojs/components';
import { memo, useCallback, useEffect, useRef } from 'react';

export interface AuthInputProps {
  className?: string;
  type?: 'text' | 'number' | 'digit' | 'idcard';
  placeholder?: string;
  placeholderClass?: string;
  maxLength?: number;
  debounceDelay?: number;
  onImmediateChange?: (value: string) => void;
}

function AuthInputInner({
  className,
  type = 'text',
  placeholder,
  placeholderClass,
  maxLength,
  onImmediateChange,
}: AuthInputProps) {
  const onImmediateChangeRef = useRef(onImmediateChange);

  useEffect(() => {
    onImmediateChangeRef.current = onImmediateChange;
  }, [onImmediateChange]);

  const handleInput = useCallback((e: { detail: { value: string } }) => {
    const newValue = e.detail.value;
    onImmediateChangeRef.current?.(newValue);
    return newValue;
  }, []);

  return (
    <Input
      className={className}
      type={type}
      placeholder={placeholder}
      placeholderClass={placeholderClass}
      maxlength={maxLength}
      onInput={handleInput}
    />
  );
}

function arePropsEqual(
  prevProps: AuthInputProps,
  nextProps: AuthInputProps
): boolean {
  return (
    prevProps.className === nextProps.className &&
    prevProps.type === nextProps.type &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.placeholderClass === nextProps.placeholderClass &&
    prevProps.maxLength === nextProps.maxLength
  );
}

export const AuthInput = memo(AuthInputInner, arePropsEqual);

export default AuthInput;
