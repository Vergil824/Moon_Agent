/**
 * Cross-platform HTTP request client for Moon Agent Taro
 *
 * Uses Taro.request across all platforms:
 * - H5
 * - WeChat Mini Program
 * - Taro RN
 * - 401 silent refresh + retry
 */

import Taro from "@tarojs/taro";
import { authClient } from "@core/auth";
import type { ApiResponse } from "./index";

// Request configuration type
export type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  withCredentials?: boolean;
  skipAuth?: boolean;
  showLoading?: boolean;
  showError?: boolean;
};

// Token management (delegated to auth client)
export function setTokens(access: string, refresh?: string): void {
  authClient.setTokens(access, refresh ?? null);
}

export function clearTokens(): void {
  authClient.clearTokens();
}

export function getAccessToken(): string | null {
  return authClient.getAccessToken();
}

// Build full URL with query params
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): string {
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

// Build request headers
function buildHeaders(config: RequestConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "tenant-id": TARO_APP_TENANT_ID,
    ...(config.headers || {}),
  };

  // Add auth token if available and not skipped
  if (!config.skipAuth) {
    const token = authClient.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Show loading toast
function showLoadingToast(): void {
  Taro.showLoading({
    title: "加载中",
    mask: true,
  });
}

// Hide loading toast
function hideLoadingToast(): void {
  Taro.hideLoading();
}

// Show error toast
function showErrorToast(message: string): void {
  Taro.showToast({
    title: message,
    icon: "none",
    duration: 2000,
  });
}

// Taro.request adapter (H5 / WeChat Mini Program / RN)
async function taroRequest<T>(
  url: string,
  config: RequestConfig,
  headers: Record<string, string>,
): Promise<ApiResponse<T>> {
  const isH5Env = process.env.TARO_ENV === "h5";
  const withCredentials =
    config.withCredentials ?? (isH5Env ? true : undefined);

  const requestOptions: Taro.request.Option & { withCredentials?: boolean } = {
    url,
    method: (config.method || "GET") as keyof Taro.request.Method,
    header: headers,
    data: config.data as object,
    timeout: config.timeout || 30000,
  };

  if (isH5Env && typeof withCredentials === "boolean") {
    requestOptions.withCredentials = withCredentials;
  }

  const response = await Taro.request<ApiResponse<T>>(requestOptions);

  return response.data;
}

/**
 * Main request function - automatically adapts to platform
 */
export async function request<T = unknown>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const url = buildUrl(endpoint, config.params);
  const headers = buildHeaders(config);
  const showLoading = config.showLoading !== false;
  const showError = config.showError !== false;

  if (showLoading) {
    showLoadingToast();
  }

  try {
    let result = await taroRequest<T>(url, config, headers);

    // On 401, attempt a silent refresh and retry once.
    if (result.code === 401 && !config.skipAuth) {
      const refreshed = await authClient.refreshAccessToken();

      if (refreshed) {
        const retryHeaders = buildHeaders(config);
        result = await taroRequest<T>(url, config, retryHeaders);

        if (result.code === 401) {
          authClient.clearTokens();
          Taro.eventCenter.trigger("auth:unauthorized");
        }
      } else {
        authClient.clearTokens();
        Taro.eventCenter.trigger("auth:unauthorized");
      }
    }

    if (result.code !== 0 && showError) {
      showErrorToast(result.msg || "请求失败");
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "网络请求失败";

    if (showError) {
      showErrorToast(errorMessage);
    }

    return {
      code: -1,
      msg: errorMessage,
      data: null as unknown as T,
    };
  } finally {
    if (showLoading) {
      hideLoadingToast();
    }
  }
}

// Convenience methods
export const get = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  config?: Omit<RequestConfig, "method" | "params">,
) => request<T>(endpoint, { ...config, method: "GET", params });

export const post = <T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: Omit<RequestConfig, "method" | "data">,
) => request<T>(endpoint, { ...config, method: "POST", data });

export const put = <T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: Omit<RequestConfig, "method" | "data">,
) => request<T>(endpoint, { ...config, method: "PUT", data });

export const del = <T = unknown>(
  endpoint: string,
  config?: Omit<RequestConfig, "method">,
) => request<T>(endpoint, { ...config, method: "DELETE" });
