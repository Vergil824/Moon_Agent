/**
 * @core/auth/routes - Route Configuration for Auth Guards
 *
 * Defines protected/public routes and redirect strategies.
 * Supports Tab/non-Tab differentiated handling.
 *
 * Story 2.4: Route Guards
 * AC 1: Redirect rules for protected pages
 * AC 2: Configurable protected route list
 */

// ============================================================
// Types
// ============================================================

/**
 * Redirect strategy for navigation
 */
export type RedirectStrategy =
  | "switchTab" // For Tab pages
  | "reLaunch" // Clear stack, prevent back navigation
  | "redirectTo" // Replace current page
  | "navigateTo"; // Push to stack

/**
 * Route configuration
 */
export type RouteConfig = {
  path: string;
  isProtected: boolean;
  isTab: boolean;
  redirectStrategy: RedirectStrategy;
};

// ============================================================
// Route Definitions
// ============================================================

/**
 * Tab bar routes - these require switchTab or reLaunch for navigation
 */
export const TAB_ROUTES = [
  "/pages/chat/index",
  "/pages/cart/index",
  "/pages/profile/index",
] as const;

/**
 * Public routes - accessible without authentication
 * These routes should NOT trigger auth guard redirects
 */
export const PUBLIC_ROUTES = [
  "/pages/welcome/index",
  "/pages/login/index",
  "/pages/index/index", // Landing page
  // "/pages/ui-smoke/index", // Dev testing page (hidden in production)
] as const;

/**
 * Protected routes - require authentication
 * If user is not logged in, redirect to welcome/login
 */
export const PROTECTED_ROUTES = [
  "/pages/chat/index",
  "/pages/cart/index",
  "/pages/profile/index",
  // Future protected routes can be added here
  // "/pages/checkout/index",
  // "/pages/order/index",
] as const;

/**
 * Default redirect target when user is not authenticated
 */
export const AUTH_REDIRECT_TARGET = "/pages/welcome/index";

/**
 * Default fallback after successful login (if no return URL)
 */
export const POST_LOGIN_DEFAULT = "/pages/chat/index";

// ============================================================
// Route Utilities
// ============================================================

/**
 * Normalize route path for comparison
 * Handles paths with/without leading slash and query strings
 */
export function normalizeRoutePath(path: string): string {
  // Remove query string
  const pathWithoutQuery = path.split("?")[0];

  // Ensure leading slash
  const normalized = pathWithoutQuery.startsWith("/")
    ? pathWithoutQuery
    : `/${pathWithoutQuery}`;

  return normalized;
}

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  return (PROTECTED_ROUTES as readonly string[]).some(
    (route) => normalized === route || normalized.startsWith(route + "?")
  );
}

/**
 * Check if a route is public (no authentication required)
 */
export function isPublicRoute(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  return (PUBLIC_ROUTES as readonly string[]).some(
    (route) => normalized === route || normalized.startsWith(route + "?")
  );
}

/**
 * Check if a route is a Tab bar route
 */
export function isTabRoute(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  return (TAB_ROUTES as readonly string[]).some(
    (route) => normalized === route || normalized.startsWith(route + "?")
  );
}

/**
 * Check if a route is the auth redirect target (welcome/login)
 * Used to prevent redirect loops
 */
export function isAuthRedirectTarget(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  return (
    normalized === AUTH_REDIRECT_TARGET ||
    normalized === "/pages/login/index" ||
    normalized.startsWith(AUTH_REDIRECT_TARGET + "?") ||
    normalized.startsWith("/pages/login/index" + "?")
  );
}

/**
 * Get the appropriate redirect strategy for a route
 *
 * Tab routes: Use reLaunch to prevent back navigation to protected page
 * Non-Tab routes: Use redirectTo to replace current page
 */
export function getRedirectStrategy(targetPath: string): RedirectStrategy {
  // When redirecting TO a Tab route, use reLaunch
  // This prevents the user from pressing back to return to protected page
  if (isTabRoute(targetPath)) {
    return "reLaunch";
  }

  // For non-Tab routes, use redirectTo
  return "redirectTo";
}

/**
 * Get redirect strategy for auth redirect (to welcome/login)
 * Always uses reLaunch to clear navigation stack
 */
export function getAuthRedirectStrategy(): RedirectStrategy {
  // Always use reLaunch for auth redirects to prevent back navigation
  return "reLaunch";
}

/**
 * Build route configuration for a path
 */
export function getRouteConfig(path: string): RouteConfig {
  const normalized = normalizeRoutePath(path);

  return {
    path: normalized,
    isProtected: isProtectedRoute(normalized),
    isTab: isTabRoute(normalized),
    redirectStrategy: getRedirectStrategy(normalized),
  };
}

// ============================================================
// Route List Helpers
// ============================================================

/**
 * Get all protected routes
 */
export function getProtectedRoutes(): readonly string[] {
  return PROTECTED_ROUTES;
}

/**
 * Get all public routes
 */
export function getPublicRoutes(): readonly string[] {
  return PUBLIC_ROUTES;
}

/**
 * Get all tab routes
 */
export function getTabRoutes(): readonly string[] {
  return TAB_ROUTES;
}

/**
 * Add a route to protected list dynamically
 * Note: This modifies runtime state, not the const arrays
 */
const dynamicProtectedRoutes: string[] = [];

export function addProtectedRoute(path: string): void {
  const normalized = normalizeRoutePath(path);
  if (!dynamicProtectedRoutes.includes(normalized)) {
    dynamicProtectedRoutes.push(normalized);
  }
}

/**
 * Check if route is protected (including dynamic routes)
 */
export function isRouteProtected(path: string): boolean {
  if (isProtectedRoute(path)) return true;
  const normalized = normalizeRoutePath(path);
  return dynamicProtectedRoutes.includes(normalized);
}
