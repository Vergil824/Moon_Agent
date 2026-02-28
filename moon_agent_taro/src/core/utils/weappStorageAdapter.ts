/**
 * @core/utils/weappStorageAdapter - WeApp Storage Adapter
 *
 * Platform-specific storage implementation for WeChat Mini Program.
 * Uses Taro.*Storage* APIs with consistent error handling.
 *
 * Story 2.3: Session Storage Abstraction (weapp-first)
 * AC 2: weapp storage operations
 * AC 5: Error handling for weak network/quota/permission issues
 */

import Taro from "@tarojs/taro";
import type { StorageAdapter, StorageResult, StorageError } from "./storage";
import {
  defaultSerializer,
  createStorageError,
  detectErrorCode,
} from "./storage";

// ============================================================
// WeApp Storage Adapter Implementation
// ============================================================

/**
 * Create a storage adapter for WeChat Mini Program
 *
 * Uses Taro.*StorageSync APIs which wrap wx.*Storage* APIs.
 * All operations are wrapped in try-catch for consistent error handling.
 *
 * @returns StorageAdapter implementation for weapp
 */
export function createWeappStorageAdapter(): StorageAdapter {
  const serializer = defaultSerializer;

  return {
    /**
     * Get value from weapp storage
     */
    async get<T>(key: string): Promise<StorageResult<T | null>> {
      try {
        const raw = Taro.getStorageSync(key);

        // Return null for non-existent keys
        if (raw === "" || raw === undefined || raw === null) {
          return { success: true, data: null };
        }

        // If raw is already an object (Taro auto-deserializes), return it
        if (typeof raw === "object") {
          return { success: true, data: raw as T };
        }

        // Deserialize string values
        if (typeof raw === "string") {
          try {
            const data = serializer.deserialize<T>(raw);
            return { success: true, data };
          } catch {
            // Return raw string if deserialization fails
            return { success: true, data: raw as T };
          }
        }

        // Return primitive values directly
        return { success: true, data: raw as T };
      } catch (error) {
        return {
          success: false,
          error: createStorageError(
            detectErrorCode(error),
            `Failed to get key: ${key}`,
            error
          ),
        };
      }
    },

    /**
     * Set value to weapp storage
     */
    async set<T>(key: string, value: T): Promise<StorageResult<void>> {
      try {
        // Serialize value for storage
        // Taro handles object serialization, but we ensure consistency
        const serializedValue =
          typeof value === "string" ? value : serializer.serialize(value);

        Taro.setStorageSync(key, serializedValue);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: createStorageError(
            detectErrorCode(error),
            `Failed to set key: ${key}`,
            error
          ),
        };
      }
    },

    /**
     * Remove value from weapp storage
     */
    async remove(key: string): Promise<StorageResult<void>> {
      try {
        Taro.removeStorageSync(key);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: createStorageError(
            detectErrorCode(error),
            `Failed to remove key: ${key}`,
            error
          ),
        };
      }
    },

    /**
     * Clear all weapp storage
     * WARNING: This clears ALL storage, not just namespaced keys
     */
    async clear(): Promise<StorageResult<void>> {
      try {
        Taro.clearStorageSync();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: createStorageError(
            detectErrorCode(error),
            "Failed to clear storage",
            error
          ),
        };
      }
    },

    /**
     * Get all keys from weapp storage
     */
    async keys(): Promise<StorageResult<string[]>> {
      try {
        const info = Taro.getStorageInfoSync();
        return { success: true, data: info.keys || [] };
      } catch (error) {
        return {
          success: false,
          error: createStorageError(
            detectErrorCode(error),
            "Failed to get storage keys",
            error
          ),
        };
      }
    },

    /**
     * Check if key exists in weapp storage
     */
    async has(key: string): Promise<StorageResult<boolean>> {
      try {
        const info = Taro.getStorageInfoSync();
        const exists = (info.keys || []).includes(key);
        return { success: true, data: exists };
      } catch (error) {
        return {
          success: false,
          error: createStorageError(
            detectErrorCode(error),
            `Failed to check key existence: ${key}`,
            error
          ),
        };
      }
    },
  };
}

// ============================================================
// Singleton Instance for WeApp
// ============================================================

let weappAdapterInstance: StorageAdapter | null = null;

/**
 * Get singleton weapp storage adapter instance
 */
export function getWeappStorageAdapter(): StorageAdapter {
  if (!weappAdapterInstance) {
    weappAdapterInstance = createWeappStorageAdapter();
  }
  return weappAdapterInstance;
}

/**
 * Reset singleton instance (for testing purposes)
 */
export function resetWeappStorageAdapter(): void {
  weappAdapterInstance = null;
}

export type { StorageAdapter, StorageResult, StorageError };
