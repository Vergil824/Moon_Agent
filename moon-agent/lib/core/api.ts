import { getAuth } from "@/lib/auth/auth";

// API response type
export type ApiResponse<T = unknown> = {
  code: number;
  msg: string;
  data: T;
};

// API error class
export class ApiError extends Error {
  code: number;
  
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:48080";

// Default headers
const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  "tenant-id": "1"
};

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  skipAuth?: boolean;
};

/**
 * Server-side fetch wrapper with automatic token injection
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export async function serverFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    cache,
    revalidate,
    tags,
    skipAuth = false
  } = options;

  const requestHeaders: HeadersInit = {
    ...defaultHeaders,
    ...headers
  };

  // Get session and inject token if available
  if (!skipAuth) {
    const session = await getAuth();
    if (session?.accessToken) {
      (requestHeaders as Record<string, string>)["Authorization"] = `Bearer ${session.accessToken}`;
    }
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method,
    headers: requestHeaders
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  // Next.js specific caching options
  if (cache) {
    fetchOptions.cache = cache;
  }

  if (revalidate !== undefined || tags) {
    fetchOptions.next = {};
    if (revalidate !== undefined) {
      fetchOptions.next.revalidate = revalidate;
    }
    if (tags) {
      fetchOptions.next.tags = tags;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
  const result: ApiResponse<T> = await response.json();

  if (result.code !== 0) {
    throw new ApiError(result.code, result.msg);
  }

  return result;
}

/**
 * Client-side fetch wrapper
 * Use this in Client Components with React Query or direct calls
 */
export async function clientFetch<T = unknown>(
  endpoint: string,
  options: Omit<FetchOptions, "cache" | "revalidate" | "tags"> & {
    accessToken?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    skipAuth = false,
    accessToken
  } = options;

  const requestHeaders: HeadersInit = {
    ...defaultHeaders,
    ...headers
  };

  // Inject token if provided
  if (!skipAuth && accessToken) {
    (requestHeaders as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include" // Include cookies for CORS requests
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
  const result: ApiResponse<T> = await response.json();

  return result;
}

// ============================================
// Auth API Functions (used before authentication)
// ============================================

export type AuthTokens = {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresTime: number;
};

/**
 * Send SMS verification code
 * @param mobile - 11-digit phone number
 * @param scene - 1: login, 2: register, 3: reset password
 */
export async function sendSmsCode(
  mobile: string,
  scene: number = 1
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/member/auth/send-sms-code", {
    method: "POST",
    body: { mobile, scene },
    skipAuth: true
  });
}

/**
 * Logout - invalidate tokens on server
 */
export async function logoutApi(accessToken?: string): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/member/auth/logout", {
    method: "POST",
    accessToken
  });
}
