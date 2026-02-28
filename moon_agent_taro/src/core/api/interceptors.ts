/**
 * Global request/response interceptors for Taro
 *
 * Handles:
 * - Token injection
 * - 401 auto-refresh/login redirect
 * - Error logging
 * - Retry strategy
 */

import Taro from "@tarojs/taro";
import { authClient } from "@core/auth";

// Interceptor chain type
type InterceptorChain = {
  requestParams: Taro.request.Option;
  proceed: (
    params: Taro.request.Option,
  ) => Promise<Taro.request.SuccessCallbackResult<string>>;
};

type RetriableRequest = Taro.request.Option & { __retry?: boolean };

// Request interceptor - injects headers and logs
const requestInterceptor = (chain: InterceptorChain) => {
  const requestParams = chain.requestParams as RetriableRequest;
  const { method, data, url } = requestParams;

  // Inject token from storage
  const token = authClient.getAccessToken();
  if (token) {
    requestParams.header = {
      ...requestParams.header,
      Authorization: `Bearer ${token}`,
      "tenant-id": TARO_APP_TENANT_ID, // Ensure tenant-id is present if needed globally
    };
  }

  // Log request in development
  if (TARO_APP_ENV === "development") {
    console.log(`[HTTP ${method || "GET"}] ${url}`, data);
  }

  return chain.proceed(requestParams);
};

// Response interceptor - handles errors and logging
const responseInterceptor = (chain: InterceptorChain) => {
  const requestParams = chain.requestParams as RetriableRequest;

  return chain.proceed(requestParams).then(
    async (response) => {
      const { statusCode, data } = response;
      const url = requestParams.url;

      // Log response in development
      if (TARO_APP_ENV === "development") {
        console.log(`[HTTP Response] ${url}`, { statusCode, data });
      }

      if (statusCode === 401) {
        return handleUnauthorizedResponse(requestParams, response);
      }

      // Handle HTTP errors
      if (statusCode >= 400) {
        handleHttpError(statusCode, url);
      }

      return response;
    },
    (error) => {
      // Network error or timeout
      console.error("[HTTP Error]", requestParams.url, error);

      Taro.showToast({
        title: "网络连接失败，请检查网络",
        icon: "none",
        duration: 2000,
      });

      return Promise.reject(error);
    },
  );
};

// Handle HTTP status code errors
function handleHttpError(statusCode: number, url: string): void {
  switch (statusCode) {
    case 401:
      // Unauthorized - handled by response interceptor
      console.warn("[401 Unauthorized]", url);
      break;

    case 403:
      // Forbidden
      console.warn("[403 Forbidden]", url);
      Taro.showToast({
        title: "无权限访问",
        icon: "none",
      });
      break;

    case 404:
      // Not found
      console.warn("[404 Not Found]", url);
      break;

    case 500:
    case 502:
    case 503:
      // Server errors
      console.error(`[${statusCode} Server Error]`, url);
      Taro.showToast({
        title: "服务器开小差了，请稍后重试",
        icon: "none",
      });
      break;

    default:
      console.warn(`[HTTP ${statusCode}]`, url);
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  return authClient.refreshAccessToken();
}

/**
 * Initialize global interceptors
 * Call this in app.ts during startup
 */
export function initInterceptors(): void {
  // Add request interceptor
  Taro.addInterceptor(requestInterceptor);

  // Add response interceptor
  Taro.addInterceptor(responseInterceptor);

  // Listen for unauthorized events
  Taro.eventCenter.on("auth:unauthorized", () => {
    authClient.clearTokens();

    // Navigate to login page
    Taro.navigateTo({
      url: "/pages/login/index",
      fail: () => {
        // If navigateTo fails (e.g., already on login page), try reLaunch
        Taro.reLaunch({ url: "/pages/login/index" });
      },
    });
  });

  console.log("[Interceptors] Initialized");
}

async function handleUnauthorizedResponse(
  requestParams: RetriableRequest,
  response: Taro.request.SuccessCallbackResult<string>,
): Promise<Taro.request.SuccessCallbackResult<string>> {
  // HTTP 401: refresh once and retry; otherwise trigger unauthorized flow.
  if (!requestParams.__retry) {
    const refreshed = await authClient.refreshAccessToken();

    if (refreshed) {
      const token = authClient.getAccessToken();
      const retryParams: RetriableRequest = {
        ...requestParams,
        __retry: true,
        header: {
          ...requestParams.header,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      return Taro.request(retryParams);
    }
  }

  authClient.clearTokens();
  Taro.eventCenter.trigger("auth:unauthorized");
  return response;
}

/**
 * Clean up interceptors (if needed)
 */
export function cleanupInterceptors(): void {
  Taro.eventCenter.off("auth:unauthorized");
}
