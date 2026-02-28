/**
 * @core/utils/sessionClear - User Session Clear Utility
 *
 * Provides clearUserSession function for logout/expiry flows.
 * Preserves non-sensitive preferences (Tab, Theme) while clearing user data.
 *
 * Story 2.3: Session Storage Abstraction (weapp-first)
 * AC 4: Clear user session on logout/expiry while preserving preferences
 */

import type { StorageResult } from "./storage";
import { StorageManager, createStorageError } from "./storage";
import { createWeappStorageAdapter } from "./weappStorageAdapter";
import { resetZustandPersistStorage } from "./zustandPersistStorage";

// ============================================================
// Constants
// ============================================================

const isWeappEnv = process.env.TARO_ENV === "weapp";

/**
 * Keys that should be PRESERVED during session clear
 * These are non-sensitive user preferences
 */
export const PRESERVED_KEYS_SESSION = [
  "lastActiveTab",
  "theme",
  "locale",
] as const;

/**
 * Keys that should be CLEARED during session clear
 * These are user-specific data that should not persist after logout
 */
export const CLEARABLE_KEYS = [
  // User profile
  "userProfile",
  "userId",
  "userInfo",

  // Chat state
  "chatMessages",
  "sessionId",
  "currentState",

  // Measurement and selection data
  "measurementData",
  "auxiliaryData",
  "chestType",
  "painPoints",

  // Product data
  "recommendedProducts",
  "cartItems",

  // Other session data
  "onboardingComplete",
] as const;

// ============================================================
// Session Clear Implementation
// ============================================================

/**
 * Clear user session data from storage
 *
 * This function should be called during:
 * - User logout
 * - Token expiry/invalidation
 * - Account switch
 *
 * Behavior:
 * - Clears all user-specific data (profile, chat, selections)
 * - Preserves non-sensitive preferences (Tab, Theme, Locale)
 * - Works with both StorageManager and Zustand persist storage
 *
 * @returns StorageResult indicating success or failure
 */
export async function clearUserSession(): Promise<StorageResult<void>> {
  const errors: string[] = [];

  // Only clear persistent storage on weapp
  if (isWeappEnv) {
    try {
      // Create storage manager for main storage
      const mainStorage = new StorageManager(createWeappStorageAdapter());
      const mainResult = await mainStorage.clearUserSession();

      if (!mainResult.success) {
        errors.push(`Main storage: ${mainResult.error.message}`);
      }

      // Create storage manager for Zustand persist storage (different namespace)
      const zustandStorage = new StorageManager(createWeappStorageAdapter(), {
        namespace: "moon_v1_zustand",
      });
      const zustandResult = await zustandStorage.clearUserSession();

      if (!zustandResult.success) {
        errors.push(`Zustand storage: ${zustandResult.error.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Storage clear failed: ${message}`);
    }
  }

  // Reset Zustand persist storage singleton (works for all platforms)
  try {
    resetZustandPersistStorage();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(`Zustand reset failed: ${message}`);
  }

  // Return result
  if (errors.length > 0) {
    console.warn("[SessionClear] Partial failure:", errors);
    return {
      success: false,
      error: createStorageError(
        "STORAGE_ERROR",
        `Session clear had ${errors.length} errors: ${errors.join("; ")}`
      ),
    };
  }

  return { success: true };
}

/**
 * Clear specific keys from storage
 *
 * @param keys - Array of keys to clear
 * @returns StorageResult indicating success or failure
 */
export async function clearStorageKeys(
  keys: readonly string[]
): Promise<StorageResult<void>> {
  if (!isWeappEnv) {
    // Non-weapp platforms don't have persistent storage
    return { success: true };
  }

  const storage = new StorageManager(createWeappStorageAdapter());
  const errors: string[] = [];

  for (const key of keys) {
    // Skip preserved keys
    if (
      (PRESERVED_KEYS_SESSION as readonly string[]).includes(key)
    ) {
      continue;
    }

    const result = await storage.remove(key);
    if (!result.success) {
      errors.push(`Failed to remove ${key}: ${result.error.message}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: createStorageError(
        "STORAGE_ERROR",
        `Failed to clear ${errors.length} keys`
      ),
    };
  }

  return { success: true };
}

/**
 * Check if a key should be preserved during session clear
 */
export function isPreservedSessionKey(key: string): boolean {
  return (PRESERVED_KEYS_SESSION as readonly string[]).includes(key);
}

/**
 * Check if a key should be cleared during session clear
 */
export function isClearableSessionKey(key: string): boolean {
  return (CLEARABLE_KEYS as readonly string[]).includes(key);
}
