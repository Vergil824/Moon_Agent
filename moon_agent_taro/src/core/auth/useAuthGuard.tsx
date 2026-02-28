/**
 * @core/auth/useAuthGuard - Authentication Guard Hook
 *
 * Provides route protection for Taro pages.
 * Handles redirect, return URL, and prevents flicker.
 *
 * Story 2.4: Route Guards
 * AC 1: Redirect unauthenticated users
 * AC 3: Token validation
 * AC 4: Return URL handling
 * AC 5: Taro lifecycle integration
 * AC 6: Prevent flicker and loops
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import Taro, { useRouter, useDidShow } from "@tarojs/taro";
import { authClient } from "./authService";
import {
  isProtectedRoute,
  isPublicRoute,
  isAuthRedirectTarget,
  AUTH_REDIRECT_TARGET,
  POST_LOGIN_DEFAULT,
  getAuthRedirectStrategy,
  getRedirectStrategy,
} from "./routes";

// ============================================================
// Types
// ============================================================

/**
 * Guard status
 */
export type AuthGuardStatus =
  | "checking" // Initial check in progress
  | "authenticated" // User is authenticated
  | "redirecting" // Redirect in progress
  | "public"; // Public route, no guard needed

/**
 * Guard result returned by useAuthGuard
 */
export type AuthGuardResult = {
  status: AuthGuardStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectTo?: string;
};

/**
 * Guard options
 */
export type AuthGuardOptions = {
  /** Current route path (auto-detected if not provided) */
  path?: string;
  /** Custom redirect target */
  redirectTo?: string;
  /** Skip guard for this invocation */
  skip?: boolean;
  /** Show toast on redirect */
  showToast?: boolean;
  /** Custom toast message */
  toastMessage?: string;
  /** Callback when redirect occurs */
  onRedirect?: (target: string) => void;
};

// ============================================================
// Return URL Storage
// ============================================================

/**
 * Storage key for return URL
 * Uses session-level storage since it's temporary
 */
const RETURN_URL_KEY = "auth_return_url";

/**
 * Store the intercepted route for later return
 */
function storeReturnUrl(path: string, query?: Record<string, string>): void {
  try {
    const returnData = {
      path,
      query: query || {},
      timestamp: Date.now(),
    };
    // Use memory for return URL (not persistent storage)
    // This is intentional - return URL should not survive app restart
    (globalThis as Record<string, unknown>)[RETURN_URL_KEY] = returnData;
  } catch (error) {
    console.warn("[AuthGuard] Failed to store return URL:", error);
  }
}

/**
 * Get the stored return URL
 */
function getReturnUrl(): { path: string; query: Record<string, string> } | null {
  try {
    const data = (globalThis as Record<string, unknown>)[RETURN_URL_KEY] as
      | { path: string; query: Record<string, string>; timestamp: number }
      | undefined;

    if (!data) return null;

    // Expire return URL after 30 minutes
    const MAX_AGE = 30 * 60 * 1000;
    if (Date.now() - data.timestamp > MAX_AGE) {
      clearReturnUrl();
      return null;
    }

    return { path: data.path, query: data.query };
  } catch (error) {
    console.warn("[AuthGuard] Failed to get return URL:", error);
    return null;
  }
}

/**
 * Clear the stored return URL
 */
function clearReturnUrl(): void {
  try {
    delete (globalThis as Record<string, unknown>)[RETURN_URL_KEY];
  } catch (error) {
    console.warn("[AuthGuard] Failed to clear return URL:", error);
  }
}

// ============================================================
// Navigation Utilities
// ============================================================

/**
 * Execute redirect based on strategy
 */
async function executeRedirect(
  target: string,
  strategy: "reLaunch" | "redirectTo" | "switchTab" | "navigateTo"
): Promise<void> {
  try {
    switch (strategy) {
      case "reLaunch":
        await Taro.reLaunch({ url: target });
        break;
      case "redirectTo":
        await Taro.redirectTo({ url: target });
        break;
      case "switchTab":
        // switchTab doesn't support query params, strip them
        const tabPath = target.split("?")[0];
        await Taro.switchTab({ url: tabPath });
        break;
      case "navigateTo":
        await Taro.navigateTo({ url: target });
        break;
    }
  } catch (error) {
    console.error("[AuthGuard] Redirect failed:", error);
    // Fallback to reLaunch
    try {
      await Taro.reLaunch({ url: target });
    } catch (fallbackError) {
      console.error("[AuthGuard] Fallback redirect failed:", fallbackError);
    }
  }
}

/**
 * Show authentication required toast
 */
function showAuthToast(message: string = "请先登录"): void {
  Taro.showToast({
    title: message,
    icon: "none",
    duration: 2000,
  });
}

// ============================================================
// Main Hook
// ============================================================

/**
 * useAuthGuard - Route protection hook
 *
 * Usage in page component:
 * ```tsx
 * function ProfilePage() {
 *   const { status, isLoading } = useAuthGuard();
 *
 *   if (isLoading || status === 'redirecting') {
 *     return <LoadingScreen />;
 *   }
 *
 *   return <ProfileContent />;
 * }
 * ```
 */
export function useAuthGuard(options: AuthGuardOptions = {}): AuthGuardResult {
  const router = useRouter();
  const [result, setResult] = useState<AuthGuardResult>({
    status: "checking",
    isAuthenticated: false,
    isLoading: true,
  });

  // Track if redirect is in progress to prevent duplicate redirects
  const isRedirecting = useRef(false);
  const hasChecked = useRef(false);

  const {
    path: providedPath,
    redirectTo = AUTH_REDIRECT_TARGET,
    skip = false,
    showToast = true,
    toastMessage = "请先登录",
    onRedirect,
  } = options;

  // Get current path from router or options
  const currentPath = providedPath || router.path || "";

  /**
   * Perform authentication check
   */
  const checkAuth = useCallback(async () => {
    // Skip if already redirecting
    if (isRedirecting.current) return;

    // Skip if option specified
    if (skip) {
      setResult({
        status: "public",
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    // Skip for public routes (welcome, login)
    if (isPublicRoute(currentPath) || isAuthRedirectTarget(currentPath)) {
      setResult({
        status: "public",
        isAuthenticated: authClient.getAccessToken() !== null,
        isLoading: false,
      });
      return;
    }

    // Check if route is protected
    if (!isProtectedRoute(currentPath)) {
      setResult({
        status: "public",
        isAuthenticated: authClient.getAccessToken() !== null,
        isLoading: false,
      });
      return;
    }

    // Check authentication
    const token = authClient.getAccessToken();
    const isAuthenticated = token !== null && token.length > 0;

    if (isAuthenticated) {
      setResult({
        status: "authenticated",
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    // User not authenticated - prepare redirect
    isRedirecting.current = true;

    // Store current path for return after login
    const query = router.params as Record<string, string> | undefined;
    storeReturnUrl(currentPath, query);

    // Show toast if enabled
    if (showToast) {
      showAuthToast(toastMessage);
    }

    // Update state before redirect
    setResult({
      status: "redirecting",
      isAuthenticated: false,
      isLoading: false,
      redirectTo,
    });

    // Call onRedirect callback if provided
    if (onRedirect) {
      onRedirect(redirectTo);
    }

    // Execute redirect
    const strategy = getAuthRedirectStrategy();
    await executeRedirect(redirectTo, strategy);
  }, [currentPath, skip, redirectTo, showToast, toastMessage, onRedirect, router.params]);

  // Check on mount
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  // Re-check on page show (Taro lifecycle)
  useDidShow(() => {
    // Only re-check if not already redirecting
    if (!isRedirecting.current) {
      checkAuth();
    }
  });

  return result;
}

// ============================================================
// Return URL Utilities (exported for login flow)
// ============================================================

/**
 * Navigate to return URL after successful login
 * Call this from login success handler
 */
export async function navigateToReturnUrl(): Promise<void> {
  const returnData = getReturnUrl();

  if (returnData) {
    clearReturnUrl();

    // Build URL with query params
    let url = returnData.path;
    if (returnData.query && Object.keys(returnData.query).length > 0) {
      const queryString = new URLSearchParams(returnData.query).toString();
      url += `?${queryString}`;
    }

    // Use appropriate navigation method
    const strategy = getRedirectStrategy(returnData.path);
    await executeRedirect(url, strategy);
  } else {
    // No return URL, go to default
    await executeRedirect(POST_LOGIN_DEFAULT, "switchTab");
  }
}

/**
 * Check if there's a pending return URL
 */
export function hasReturnUrl(): boolean {
  return getReturnUrl() !== null;
}

/**
 * Get return URL info without consuming it
 */
export function peekReturnUrl(): { path: string; query: Record<string, string> } | null {
  return getReturnUrl();
}

/**
 * Clear return URL manually
 */
export { clearReturnUrl };

// ============================================================
// HOC Alternative (for class components)
// ============================================================

/**
 * withAuthGuard HOC
 * Wraps a component with authentication guard
 *
 * Usage:
 * ```tsx
 * export default withAuthGuard(ProfilePage);
 * ```
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardOptions?: AuthGuardOptions
): React.FC<P> {
  return function AuthGuardedComponent(props: P) {
    const { status, isLoading } = useAuthGuard(guardOptions);

    // Show loading or return null while checking/redirecting
    if (isLoading || status === "redirecting" || status === "checking") {
      // Return null to prevent flash of protected content
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

