/**
 * AuthService - cross-platform authentication client.
 *
 * Handles:
 * - SMS login
 * - Access token storage (H5 memory, weapp storage)
 * - Refresh flow (cookie vs refresh token)
 * - RN cookie fallback to header refresh
 */
import Taro from "@tarojs/taro";
import type { ApiResponse } from "@core/api";
import type { AuthTokens, SmsLoginPayload, WeixinMiniAppLoginPayload } from "./types";

type ResponseHeaders = Record<string, string | string[] | undefined>;
type CookieManagerLike = {
  setFromResponse: (url: string, cookie: string) => Promise<boolean> | boolean;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const isH5Env = process.env.TARO_ENV === "h5";
const isWeappEnv = process.env.TARO_ENV === "weapp";
const isRnEnv = process.env.TARO_ENV === "rn";

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const baseUrl = TARO_APP_API_BASE;
  let url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += (url.includes("?") ? "&" : "?") + searchParams.toString();
  }

  return url;
}

function normalizeCookieHeader(value?: string | string[]): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const filtered = value.filter((item) => Boolean(item));
    return filtered.length > 0 ? filtered.join("; ") : null;
  }
  return value;
}

function getSetCookieHeader(headers?: ResponseHeaders): string | null {
  if (!headers) return null;
  return normalizeCookieHeader(headers["set-cookie"] || headers["Set-Cookie"]);
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private useHeaderRefresh = false;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private cookieFallbackLogged = false;

  /**
   * Get current access token (platform-aware).
   */
  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;

    if (this.canPersistTokens()) {
      const stored = this.readStorage(ACCESS_TOKEN_KEY);
      this.accessToken = stored;
      return stored;
    }

    return null;
  }

  /**
   * Get refresh token for token-based refresh flows.
   */
  getRefreshToken(): string | null {
    // Refresh token is stored only for weapp or RN header-fallback flows.
    if (isH5Env || (isRnEnv && !this.useHeaderRefresh)) {
      return null;
    }

    if (this.refreshToken) return this.refreshToken;

    const stored = this.readStorage(REFRESH_TOKEN_KEY);
    this.refreshToken = stored;
    return stored;
  }

  setTokens(accessToken: string, refreshToken?: string | null): void {
    this.setAccessToken(accessToken);
    if (refreshToken !== undefined) {
      this.setRefreshToken(refreshToken);
    }
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    if (this.canPersistTokens()) {
      this.writeStorage(ACCESS_TOKEN_KEY, accessToken);
    }
  }

  setRefreshToken(refreshToken: string | null): void {
    if (isH5Env) return;
    if (isRnEnv && !this.useHeaderRefresh) return;

    this.refreshToken = refreshToken;
    if (this.canPersistTokens()) {
      this.writeStorage(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && token.length > 0;
  }

  /**
   * Clear access/refresh tokens across memory and storage.
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (this.canPersistTokens() || isH5Env) {
      this.writeStorage(ACCESS_TOKEN_KEY, null);
      this.writeStorage(REFRESH_TOKEN_KEY, null);
    }
  }

  /**
   * Send SMS verification code (scene defaults to login).
   */
  async sendSmsCode(mobile: string, scene = 1): Promise<ApiResponse<boolean>> {
    const url = buildUrl("/member/auth/send-sms-code");
    const response = await Taro.request<ApiResponse<boolean>>({
      url,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        "tenant-id": TARO_APP_TENANT_ID,
      },
      data: { mobile, scene },
    });

    return response.data;
  }

  /**
   * Login with SMS code and persist tokens per platform rules.
   */
  async login(payload: SmsLoginPayload): Promise<ApiResponse<AuthTokens>> {
    return this.loginWithSms(payload);
  }

  async loginWithSms(
    payload: SmsLoginPayload,
  ): Promise<ApiResponse<AuthTokens>> {
    const url = buildUrl("/member/auth/sms-login");
    const requestOptions: Taro.request.Option & { withCredentials?: boolean } =
      {
        url,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          "tenant-id": TARO_APP_TENANT_ID,
        },
        data: payload,
      };

    if (isH5Env) {
      requestOptions.withCredentials = true;
    }

    const response =
      await Taro.request<ApiResponse<AuthTokens>>(requestOptions);

    const result = response.data;

    if (result.code === 0 && result.data?.accessToken) {
      this.setAccessToken(result.data.accessToken);

      if (isWeappEnv) {
        this.setRefreshToken(result.data.refreshToken ?? null);
      }

      if (isRnEnv) {
        // RN prefers refresh cookie; fallback to header refresh if cookie write fails.
        this.useHeaderRefresh = false;
        const cookieOk = await this.trySetRefreshCookieFromResponse(
          url,
          response.header as ResponseHeaders | undefined,
        );
        if (!cookieOk) {
          this.enableHeaderFallback("login_set_cookie_failed", {
            headers: response.header,
          });
          this.setRefreshToken(result.data.refreshToken ?? null);
        }
      }
    }

    return result;
  }

  /**
   * Login with WeChat Mini App (phoneCode + loginCode)
   * Used for "微信一键登录" button flow in WeChat Mini Program
   *
   * Flow:
   * 1. Call wx.login() to get loginCode
   * 2. User clicks button with open-type="getPhoneNumber" to get phoneCode
   * 3. Call this method with both codes to exchange for access/refresh tokens
   */
  async loginWithWeixinMiniApp(
    payload: WeixinMiniAppLoginPayload
  ): Promise<ApiResponse<AuthTokens>> {
    const url = buildUrl("/member/auth/weixin-mini-app-login");
    const requestOptions: Taro.request.Option = {
      url,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        "tenant-id": TARO_APP_TENANT_ID,
      },
      data: payload,
    };

    const response =
      await Taro.request<ApiResponse<AuthTokens>>(requestOptions);

    const result = response.data;

    if (result.code === 0 && result.data?.accessToken) {
      // Persist tokens - same as SMS login
      this.setAccessToken(result.data.accessToken);

      // WeApp stores refresh token in localStorage
      if (isWeappEnv) {
        this.setRefreshToken(result.data.refreshToken ?? null);
      }
    }

    return result;
  }

  /**
   * Refresh access token once (deduped for concurrent calls).
   */
  async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh().finally(() => {
      this.isRefreshing = false;
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async doRefresh(): Promise<boolean> {
    // Refresh via cookie (H5/RN) or refreshToken (weapp/RN fallback).
    try {
      const refreshToken = this.getRefreshToken();
      const requiresRefreshToken =
        isWeappEnv || (isRnEnv && this.useHeaderRefresh);

      if (requiresRefreshToken && !refreshToken) {
        return false;
      }

      const url = buildUrl(
        "/member/auth/refresh-token",
        refreshToken ? { refreshToken } : undefined,
      );

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "tenant-id": TARO_APP_TENANT_ID,
      };

      if (refreshToken) {
        headers.Authorization = `Bearer ${refreshToken}`;
      }

      const requestOptions: Taro.request.Option & {
        withCredentials?: boolean;
      } = {
        url,
        method: "POST",
        header: headers,
        data: refreshToken ? { refreshToken } : undefined,
      };

      if (isH5Env) {
        requestOptions.withCredentials = true;
      }

      const response =
        await Taro.request<ApiResponse<AuthTokens>>(requestOptions);

      const result = response.data;

      if (result.code === 0 && result.data?.accessToken) {
        this.setAccessToken(result.data.accessToken);

        if (isWeappEnv || (isRnEnv && this.useHeaderRefresh)) {
          this.setRefreshToken(
            result.data.refreshToken ?? refreshToken ?? null,
          );
        }

        if (isRnEnv && !this.useHeaderRefresh) {
          const cookieOk = await this.trySetRefreshCookieFromResponse(
            url,
            response.header as ResponseHeaders | undefined,
          );
          if (!cookieOk) {
            this.enableHeaderFallback("refresh_set_cookie_failed", {
              headers: response.header,
            });
            this.setRefreshToken(
              result.data.refreshToken ?? refreshToken ?? null,
            );
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("[Auth] Refresh failed", error);
      return false;
    }
  }

  private canPersistTokens(): boolean {
    return isWeappEnv || (isRnEnv && this.useHeaderRefresh);
  }

  private readStorage(key: string): string | null {
    try {
      return Taro.getStorageSync(key) || null;
    } catch (error) {
      console.warn("[Auth] Failed to read storage", { key, error });
      return null;
    }
  }

  private writeStorage(key: string, value: string | null): void {
    try {
      if (value) {
        Taro.setStorageSync(key, value);
      } else {
        Taro.removeStorageSync(key);
      }
    } catch (error) {
      console.warn("[Auth] Failed to write storage", { key, error });
    }
  }

  private async trySetRefreshCookieFromResponse(
    url: string,
    headers?: ResponseHeaders,
  ): Promise<boolean> {
    if (!isRnEnv) return false;

    const cookieHeader = getSetCookieHeader(headers);
    if (!cookieHeader) {
      return false;
    }

    const cookieManager = this.getCookieManager();
    if (!cookieManager) {
      return false;
    }

    try {
      const result = await cookieManager.setFromResponse(url, cookieHeader);
      return Boolean(result);
    } catch (error) {
      console.warn("[Auth] CookieManager.setFromResponse failed", error);
      return false;
    }
  }

  private getCookieManager(): CookieManagerLike | null {
    const globalCookieManager = (
      globalThis as { CookieManager?: CookieManagerLike }
    ).CookieManager;

    if (globalCookieManager?.setFromResponse) {
      return globalCookieManager;
    }

    try {
      const requireFn = (globalThis as { require?: (name: string) => unknown })
        .require;
      if (typeof requireFn === "function") {
        const module = requireFn("@react-native-cookies/cookies") as {
          CookieManager?: CookieManagerLike;
          default?: CookieManagerLike;
        };
        return module.CookieManager || module.default || null;
      }
    } catch (error) {
      console.warn("[Auth] CookieManager module not available", error);
    }

    return null;
  }

  private enableHeaderFallback(reason: string, detail?: unknown): void {
    if (!isRnEnv) return;
    this.useHeaderRefresh = true;

    if (!this.cookieFallbackLogged) {
      console.warn(
        "[Auth] Cookie refresh disabled, fallback to header scheme.",
        {
          reason,
          detail,
        },
      );
      this.cookieFallbackLogged = true;
      return;
    }

    console.warn("[Auth] Cookie refresh fallback active.", { reason, detail });
  }
}

export const authClient = new AuthService();
export type { AuthTokens, SmsLoginPayload, WeixinMiniAppLoginPayload };
