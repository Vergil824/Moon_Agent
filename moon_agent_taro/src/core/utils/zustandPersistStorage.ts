/**
 * @core/utils/zustandPersistStorage - Zustand Persist Storage Adapter
 *
 * Provides StateStorage implementation for Zustand persist middleware.
 * Persistence is enabled only for weapp platform (AC 2).
 * Sensitive tokens are never persisted (AC 3).
 *
 * Story 2.3: Session Storage Abstraction (weapp-first)
 */

import type { StateStorage } from 'zustand/middleware';
import { StorageManager, DEFAULT_NAMESPACE } from './storage';
import { createWeappStorageAdapter } from './weappStorageAdapter';

// ============================================================
// Constants
// ============================================================

const isWeappEnv = process.env.TARO_ENV === 'weapp';

/**
 * Whitelist of keys that can be persisted
 * CRITICAL: Never include accessToken, refreshToken, or any token-related keys
 */
export const PERSIST_WHITELIST = [
  // Navigation state
  'lastActiveTab',

  // User preferences
  'theme',
  'locale',

  // Chat state (non-sensitive)
  'chestType',
  'painPoints',
  'measurementData',
  'auxiliaryData',

  // UI preferences
  'modalDismissed',
] as const;

/**
 * Keys that should NEVER be persisted (safety check)
 */
const SENSITIVE_KEYS = [
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
  'token',
  'password',
  'secret',
] as const;

// ============================================================
// Platform Detection
// ============================================================

/**
 * Check if persistence is enabled for current platform
 * Returns true only for weapp environment
 */
export function isPersistenceEnabled(): boolean {
  return isWeappEnv;
}

// ============================================================
// Zustand Persist Storage Implementation
// ============================================================

/**
 * Memory storage for non-weapp platforms
 * Provides same interface but doesn't persist across sessions
 */
function createMemoryStorage(): StateStorage {
  const storage = new Map<string, string>();

  return {
    getItem: (name: string): string | null => {
      return storage.get(name) ?? null;
    },
    setItem: (name: string, value: string): void => {
      storage.set(name, value);
    },
    removeItem: (name: string): void => {
      storage.delete(name);
    },
  };
}

/**
 * Create Zustand StateStorage implementation
 *
 * For weapp: Uses StorageManager with weapp adapter
 * For other platforms: Uses in-memory storage
 *
 * @returns StateStorage compatible with Zustand persist middleware
 */
export function createZustandPersistStorage(): StateStorage {
  // Use memory storage for non-weapp platforms
  if (!isPersistenceEnabled()) {
    return createMemoryStorage();
  }

  // Create storage manager for weapp
  const storageManager = new StorageManager(createWeappStorageAdapter(), {
    namespace: `${DEFAULT_NAMESPACE}_zustand`,
  });

  return {
    getItem: async (name: string): Promise<string | null> => {
      const result = await storageManager.get<string>(name);
      if (result.success) {
        return result.data ?? null;
      }
      console.warn('[ZustandPersist] Failed to get item:', name, result.error);
      return null;
    },

    setItem: async (name: string, value: string): Promise<void> => {
      // Safety check: Ensure we're not persisting sensitive data
      const isSensitive = SENSITIVE_KEYS.some(
        (key) =>
          name.toLowerCase().includes(key.toLowerCase()) ||
          value.toLowerCase().includes(key.toLowerCase())
      );

      if (isSensitive) {
        console.warn(
          '[ZustandPersist] Blocked attempt to persist sensitive data:',
          name
        );
        return;
      }

      const result = await storageManager.set(name, value);
      if (!result.success) {
        console.warn(
          '[ZustandPersist] Failed to set item:',
          name,
          result.error
        );
      }
    },

    removeItem: async (name: string): Promise<void> => {
      const result = await storageManager.remove(name);
      if (!result.success) {
        console.warn(
          '[ZustandPersist] Failed to remove item:',
          name,
          result.error
        );
      }
    },
  };
}

// ============================================================
// Persist Configuration Helper
// ============================================================

/**
 * Filter function for Zustand persist partialize
 * Only allows whitelisted keys to be persisted
 *
 * Usage:
 * ```ts
 * persist(
 *   (set) => ({ ... }),
 *   {
 *     name: 'store-name',
 *     storage: createZustandPersistStorage(),
 *     partialize: createPartializeFilter(['key1', 'key2']),
 *   }
 * )
 * ```
 */
export function createPartializeFilter<T extends object>(
  allowedKeys: readonly (keyof T)[]
): (state: T) => Partial<T> {
  return (state: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of allowedKeys) {
      if (key in state) {
        // Double-check not persisting sensitive data
        const keyStr = String(key);
        const isSensitive = SENSITIVE_KEYS.some((s) =>
          keyStr.toLowerCase().includes(s.toLowerCase())
        );
        if (!isSensitive) {
          result[key] = state[key];
        }
      }
    }
    return result;
  };
}

/**
 * Pre-built partialize filter for common user state
 */
export const defaultUserStatePartialize = createPartializeFilter(
  PERSIST_WHITELIST as unknown as readonly string[]
);

// ============================================================
// Singleton Instance
// ============================================================

let storageInstance: StateStorage | null = null;

/**
 * Get singleton Zustand persist storage instance
 */
export function getZustandPersistStorage(): StateStorage {
  if (!storageInstance) {
    storageInstance = createZustandPersistStorage();
  }
  return storageInstance;
}

/**
 * Reset singleton instance (for testing purposes)
 */
export function resetZustandPersistStorage(): void {
  storageInstance = null;
}
