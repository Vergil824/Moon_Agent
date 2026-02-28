// Auth service
export { authClient } from "./authService";
export type { AuthTokens, SmsLoginPayload } from "./types";

// Route configuration
export * from "./routes";

// Auth guard hook
export {
  useAuthGuard,
  withAuthGuard,
  navigateToReturnUrl,
  hasReturnUrl,
  peekReturnUrl,
  clearReturnUrl,
  type AuthGuardOptions,
  type AuthGuardResult,
  type AuthGuardStatus,
} from "./useAuthGuard";
