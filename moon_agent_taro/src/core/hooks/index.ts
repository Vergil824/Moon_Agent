/**
 * @core/hooks - Custom React hooks
 * 
 * This module contains cross-platform React hooks.
 * All hooks should work on H5, WeChat Mini Program, and Taro RN.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage loading state with minimum display time
 * Prevents flash of loading state for fast operations
 */
export function useLoadingState(minimumMs: number = 300): [boolean, (loading: boolean) => void] {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      setIsLoading(true);
      setLoadingStartTime(Date.now());
    } else {
      const elapsed = loadingStartTime ? Date.now() - loadingStartTime : 0;
      const remaining = Math.max(0, minimumMs - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStartTime(null);
      }, remaining);
    }
  }, [loadingStartTime, minimumMs]);

  return [isLoading, setLoading];
}

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for boolean toggle state
 */
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue((v) => !v), []);
  
  return [value, toggle, setValue];
}

/**
 * Hook for previous value tracking
 */
export function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState<T>(value);
  const [previous, setPrevious] = useState<T | undefined>(undefined);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}

