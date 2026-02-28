/**
 * @core/utils/storage - Cross-platform Storage Abstraction
 *
 * Provides unified storage interface with:
 * - JSON serialization/deserialization with error tolerance
 * - Key namespace versioning to prevent schema conflicts
 * - Sensitive field filtering (tokens never persisted)
 * - Consistent async/sync boundary handling
 *
 * Story 2.3: Session Storage Abstraction (weapp-first)
 */

// ============================================================
// Types
// ============================================================

/**
 * Result type for storage operations with explicit error handling
 */
export type StorageResult<T> =
  | { success: true; data?: T }
  | { success: false; error: StorageError };

/**
 * Storage error with code and message
 */
export type StorageError = {
  code: StorageErrorCode;
  message: string;
  originalError?: unknown;
};

/**
 * Storage error codes for consistent error handling
 */
export type StorageErrorCode =
  | "STORAGE_ERROR" // Generic storage error
  | "SERIALIZATION_ERROR" // JSON serialization failed
  | "DESERIALIZATION_ERROR" // JSON deserialization failed
  | "QUOTA_EXCEEDED" // Storage quota exceeded
  | "PERMISSION_DENIED" // Storage access denied
  | "SENSITIVE_KEY_BLOCKED" // Attempt to store sensitive data
  | "KEY_NOT_FOUND"; // Key does not exist

/**
 * Serializer interface for custom serialization strategies
 */
export type Serializer = {
  serialize: <T>(value: T) => string;
  deserialize: <T>(raw: string) => T;
};

/**
 * Filter function to detect sensitive keys that should never be persisted
 */
export type SensitiveKeyFilter = (key: string) => boolean;

/**
 * Storage adapter interface for platform-specific implementations
 */
export type StorageAdapter = {
  get: <T>(key: string) => Promise<StorageResult<T | null>>;
  set: <T>(key: string, value: T) => Promise<StorageResult<void>>;
  remove: (key: string) => Promise<StorageResult<void>>;
  clear: () => Promise<StorageResult<void>>;
  keys: () => Promise<StorageResult<string[]>>;
  has: (key: string) => Promise<StorageResult<boolean>>;
};

/**
 * Storage options for initialization
 */
export type StorageOptions = {
  /** Key namespace/version prefix (e.g., "moon_v1") */
  namespace?: string;
  /** Custom serializer (defaults to JSON) */
  serializer?: Serializer;
  /** Sensitive key filter function */
  sensitiveKeyFilter?: SensitiveKeyFilter;
};

// ============================================================
// Constants
// ============================================================

/** Default namespace version for storage keys */
export const DEFAULT_NAMESPACE = "moon_v1";

/** Keys that should be preserved during session clear */
export const PRESERVED_KEYS = ["lastActiveTab", "theme", "locale"] as const;

/** Default sensitive key patterns (tokens should never be persisted) */
const DEFAULT_SENSITIVE_PATTERNS = [
  "accesstoken",
  "refreshtoken",
  "access_token",
  "refresh_token",
  "token",
] as const;

// ============================================================
// Utilities
// ============================================================

/**
 * Default JSON serializer with error tolerance
 */
export const defaultSerializer: Serializer = {
  serialize: <T>(value: T): string => {
    try {
      return JSON.stringify(value);
    } catch {
      // Handle circular references or non-serializable values
      return JSON.stringify(null);
    }
  },
  deserialize: <T>(raw: string): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Return null for malformed JSON
      return null as T;
    }
  },
};

/**
 * Default sensitive key filter - blocks tokens from being stored
 */
export const defaultSensitiveKeyFilter: SensitiveKeyFilter = (
  key: string
): boolean => {
  const lowerKey = key.toLowerCase();
  return DEFAULT_SENSITIVE_PATTERNS.some((pattern) =>
    lowerKey.includes(pattern)
  );
};

/**
 * Build namespaced key
 */
export function buildNamespacedKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

/**
 * Extract original key from namespaced key
 */
export function extractOriginalKey(
  namespace: string,
  namespacedKey: string
): string | null {
  const prefix = `${namespace}:`;
  if (namespacedKey.startsWith(prefix)) {
    return namespacedKey.slice(prefix.length);
  }
  return null;
}

/**
 * Check if a key should be preserved during session clear
 */
export function isPreservedKey(key: string): boolean {
  return (PRESERVED_KEYS as readonly string[]).includes(key);
}

/**
 * Create storage error from unknown error
 */
export function createStorageError(
  code: StorageErrorCode,
  message: string,
  originalError?: unknown
): StorageError {
  return {
    code,
    message,
    originalError,
  };
}

/**
 * Detect error code from platform-specific error
 */
export function detectErrorCode(error: unknown): StorageErrorCode {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("quota") || msg.includes("exceeded")) {
      return "QUOTA_EXCEEDED";
    }
    if (msg.includes("permission") || msg.includes("denied")) {
      return "PERMISSION_DENIED";
    }
  }
  return "STORAGE_ERROR";
}

// ============================================================
// Storage Manager Class
// ============================================================

/**
 * StorageManager - Cross-platform storage manager with unified interface
 *
 * Usage:
 * ```ts
 * const storage = new StorageManager(weappAdapter, { namespace: 'moon_v1' });
 *
 * // Set value
 * await storage.set('userProfile', { name: 'User' });
 *
 * // Get value
 * const result = await storage.get<UserProfile>('userProfile');
 * if (result.success && result.data) {
 *   console.log(result.data.name);
 * }
 *
 * // Sensitive keys are blocked
 * await storage.set('accessToken', 'xxx'); // Returns error result
 * ```
 */
export class StorageManager {
  private readonly adapter: StorageAdapter;
  private readonly namespace: string;
  private readonly serializer: Serializer;
  private readonly sensitiveKeyFilter: SensitiveKeyFilter;

  constructor(adapter: StorageAdapter, options: StorageOptions = {}) {
    this.adapter = adapter;
    this.namespace = options.namespace ?? DEFAULT_NAMESPACE;
    this.serializer = options.serializer ?? defaultSerializer;
    this.sensitiveKeyFilter =
      options.sensitiveKeyFilter ?? defaultSensitiveKeyFilter;
  }

  /**
   * Get value from storage
   */
  async get<T>(key: string): Promise<StorageResult<T | null>> {
    const namespacedKey = buildNamespacedKey(this.namespace, key);
    return this.adapter.get<T>(namespacedKey);
  }

  /**
   * Set value to storage
   * Returns error if key matches sensitive pattern
   */
  async set<T>(key: string, value: T): Promise<StorageResult<void>> {
    // Block sensitive keys
    if (this.sensitiveKeyFilter(key)) {
      return {
        success: false,
        error: createStorageError(
          "SENSITIVE_KEY_BLOCKED",
          `Cannot store sensitive key: ${key}`
        ),
      };
    }

    const namespacedKey = buildNamespacedKey(this.namespace, key);
    return this.adapter.set(namespacedKey, value);
  }

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<StorageResult<void>> {
    const namespacedKey = buildNamespacedKey(this.namespace, key);
    return this.adapter.remove(namespacedKey);
  }

  /**
   * Check if key exists in storage
   */
  async has(key: string): Promise<StorageResult<boolean>> {
    const namespacedKey = buildNamespacedKey(this.namespace, key);
    return this.adapter.has(namespacedKey);
  }

  /**
   * Get all keys in current namespace
   */
  async keys(): Promise<StorageResult<string[]>> {
    const result = await this.adapter.keys();
    if (!result.success) return result;

    const allKeys = result.data ?? [];
    const namespacePrefix = `${this.namespace}:`;

    // Filter and extract keys belonging to this namespace
    const filteredKeys = allKeys
      .filter((k) => k.startsWith(namespacePrefix))
      .map((k) => k.slice(namespacePrefix.length));

    return { success: true, data: filteredKeys };
  }

  /**
   * Clear all data in current namespace
   * Note: Use clearUserSession for selective clearing that preserves preferences
   */
  async clear(): Promise<StorageResult<void>> {
    const keysResult = await this.keys();
    if (!keysResult.success) return keysResult;

    const allKeys = keysResult.data ?? [];
    const errors: StorageError[] = [];

    for (const key of allKeys) {
      const removeResult = await this.remove(key);
      if (!removeResult.success) {
        errors.push(removeResult.error);
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
   * Clear user session data while preserving preferences (AC 4)
   *
   * Preserves: lastActiveTab, theme, locale
   * Clears: userProfile, chatMessages, sessionId, etc.
   */
  async clearUserSession(): Promise<StorageResult<void>> {
    const keysResult = await this.keys();
    if (!keysResult.success) return keysResult;

    const allKeys = keysResult.data ?? [];
    const errors: StorageError[] = [];

    for (const key of allKeys) {
      // Skip preserved keys
      if (isPreservedKey(key)) {
        continue;
      }

      const removeResult = await this.remove(key);
      if (!removeResult.success) {
        errors.push(removeResult.error);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: createStorageError(
          "STORAGE_ERROR",
          `Failed to clear ${errors.length} user session keys`
        ),
      };
    }

    return { success: true };
  }

  /**
   * Get serializer (for external use if needed)
   */
  getSerializer(): Serializer {
    return this.serializer;
  }

  /**
   * Get namespace (for external use if needed)
   */
  getNamespace(): string {
    return this.namespace;
  }
}

