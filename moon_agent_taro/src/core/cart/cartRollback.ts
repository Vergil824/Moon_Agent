/**
 * Cart Rollback - Save and restore cart state for payment failure scenarios
 *
 * Flow:
 * 1. Before checkout, save selected cart items to storage
 * 2. If payment succeeds, clear saved state
 * 3. If payment fails/cancelled, user can restore cart items
 */

import Taro from '@tarojs/taro';
import { addCartItem } from './cartApi';

const CART_BACKUP_KEY = 'cart_backup';

/**
 * Cart item backup structure (minimal data needed to restore)
 */
export interface CartBackupItem {
  skuId: number;
  count: number;
  spuName: string; // For display purposes
}

/**
 * Cart backup structure
 */
export interface CartBackup {
  items: CartBackupItem[];
  timestamp: number;
  /** The trade order ID associated with this backup (if order was created) */
  orderId?: number;
}

/**
 * Save cart items to backup storage before checkout
 * @param items Items to backup (usually selected cart items)
 */
export function saveCartBackup(items: CartBackupItem[]): void {
  if (items.length === 0) return;

  const backup: CartBackup = {
    items,
    timestamp: Date.now(),
  };

  try {
    Taro.setStorageSync(CART_BACKUP_KEY, JSON.stringify(backup));
    console.log('[CartRollback] Saved backup with', items.length, 'items');
  } catch (error) {
    console.warn('[CartRollback] Failed to save backup:', error);
  }
}

/**
 * Update backup with order ID after order creation
 * This helps identify which order the backup is associated with
 * @param orderId The created order ID
 */
export function updateBackupOrderId(orderId: number): void {
  try {
    const backupStr = Taro.getStorageSync(CART_BACKUP_KEY);
    if (!backupStr) return;

    const backup: CartBackup = JSON.parse(backupStr);
    backup.orderId = orderId;
    Taro.setStorageSync(CART_BACKUP_KEY, JSON.stringify(backup));
    console.log('[CartRollback] Updated backup with orderId:', orderId);
  } catch (error) {
    console.warn('[CartRollback] Failed to update backup:', error);
  }
}

/**
 * Get saved cart backup
 * @returns CartBackup or null if no backup exists
 */
export function getCartBackup(): CartBackup | null {
  try {
    const backupStr = Taro.getStorageSync(CART_BACKUP_KEY);
    if (!backupStr) return null;

    const backup: CartBackup = JSON.parse(backupStr);

    // Expire backup after 24 hours
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (Date.now() - backup.timestamp > ONE_DAY_MS) {
      clearCartBackup();
      return null;
    }

    return backup;
  } catch (error) {
    console.warn('[CartRollback] Failed to get backup:', error);
    return null;
  }
}

/**
 * Clear cart backup (call after successful payment)
 */
export function clearCartBackup(): void {
  try {
    Taro.removeStorageSync(CART_BACKUP_KEY);
    console.log('[CartRollback] Cleared backup');
  } catch (error) {
    console.warn('[CartRollback] Failed to clear backup:', error);
  }
}

/**
 * Restore cart items from backup
 * @returns Promise<boolean> - true if restoration was successful
 */
export async function restoreCartFromBackup(): Promise<{
  success: boolean;
  restoredCount: number;
  failedItems: string[];
}> {
  const backup = getCartBackup();
  if (!backup || backup.items.length === 0) {
    return { success: false, restoredCount: 0, failedItems: [] };
  }

  let restoredCount = 0;
  const failedItems: string[] = [];

  for (const item of backup.items) {
    try {
      const response = await addCartItem({
        skuId: item.skuId,
        count: item.count,
      });

      if (response.code === 0) {
        restoredCount++;
      } else {
        failedItems.push(item.spuName);
        console.warn(
          '[CartRollback] Failed to restore item:',
          item.spuName,
          response.msg
        );
      }
    } catch (error) {
      failedItems.push(item.spuName);
      console.error('[CartRollback] Error restoring item:', item.spuName, error);
    }
  }

  // Clear backup after restoration attempt
  clearCartBackup();

  return {
    success: restoredCount > 0,
    restoredCount,
    failedItems,
  };
}

/**
 * Check if there is a valid cart backup that can be restored
 */
export function hasRestorableBackup(): boolean {
  const backup = getCartBackup();
  return backup !== null && backup.items.length > 0;
}
