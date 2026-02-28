/**
 * @core/api - API client module
 * 
 * This module provides cross-platform API utilities.
 * Supports H5, WeChat Mini Program, and Taro RN.
 */

// API response type (standard backend response format)
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
    this.name = 'ApiError';
  }
}

// Re-export request utilities
export {
  request,
  get,
  post,
  put,
  del,
  setTokens,
  clearTokens,
  getAccessToken,
  type RequestConfig,
} from './request';

// Re-export interceptors
export {
  initInterceptors,
  cleanupInterceptors,
  refreshAccessToken,
} from './interceptors';
