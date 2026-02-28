/**
 * WeApp Chunked Stream Client for Chat
 *
 * Stream client for WeChat Mini Program using Taro.request + enableChunked.
 * This provides SSE-like streaming capability without native EventSource support.
 *
 * Features:
 * - Real-time streaming via requestTask.onChunkReceived
 * - Automatic credential handling (cookie/token)
 * - Connection abort support
 * - SSE text format parsing
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */

import Taro from '@tarojs/taro';
import { authClient } from '@core/auth';
import {
  createDualChannelSseParser,
  type ChatRequest,
  ChatErrorCodes,
  type ChatErrorCode,
} from './index';

// ============================================================================
// Types
// ============================================================================

/**
 * Stream event callback handlers (same as H5 client)
 */
export interface WeappStreamEventHandlers {
  /** Called when a partial text chunk is received */
  onPartial?: (content: string, state?: Record<string, unknown> | null) => void;
  /** Called when streaming is complete */
  onEnd?: () => void;
  /** Called when an error occurs */
  onError?: (error: WeappStreamError) => void;
}

/**
 * Stream error structure
 */
export interface WeappStreamError {
  code: ChatErrorCode;
  message: string;
  recoverable: boolean;
}

/**
 * Stream client configuration
 */
export interface WeappChunkedClientConfig {
  /** Base URL for chat API */
  baseUrl?: string;
  /** Chat stream endpoint path */
  endpoint?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Tenant ID for multi-tenant support */
  tenantId?: string;
  /** Custom auth token getter (defaults to authClient.getAccessToken) */
  getAuthToken?: () => string | null;
}

/**
 * Active stream connection
 */
export interface WeappStreamConnection {
  /** Abort the stream */
  abort: () => void;
  /** Check if stream is active */
  isActive: () => boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<WeappChunkedClientConfig> = {
  baseUrl: typeof TARO_APP_API_BASE !== 'undefined' ? TARO_APP_API_BASE : '/app-api',
  endpoint: '/infra/chat/stream',
  timeout: 120000, // 2 minutes
  tenantId: typeof TARO_APP_TENANT_ID !== 'undefined' ? TARO_APP_TENANT_ID : '1',
  getAuthToken: () => authClient.getAccessToken(),
};

// ============================================================================
// WeApp Chunked Stream Client
// ============================================================================

/**
 * Create WeApp chunked stream client for chat
 *
 * @param config - Client configuration
 * @returns Stream client instance
 */
export function createWeappChunkedClient(config?: WeappChunkedClientConfig) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  /**
   * Check if current platform supports chunked streaming
   */
  function isStreamingSupported(): boolean {
    // WeApp platform check
    const env = Taro.getEnv();
    return env === Taro.ENV_TYPE.WEAPP;
  }

  /**
   * Send chat message and stream response
   *
   * @param request - Chat request
   * @param handlers - Event handlers for streaming
   * @returns Stream connection for aborting
   */
  function sendMessage(
    request: ChatRequest,
    handlers: WeappStreamEventHandlers
  ): WeappStreamConnection {
    let isActive = true;
    let requestTask: Taro.RequestTask<unknown> | null = null;

    // Start streaming
    streamMessage(request, handlers, (task) => {
      requestTask = task;
    }).finally(() => {
      isActive = false;
      requestTask = null;
    });

    return {
      abort: () => {
        isActive = false;
        if (requestTask) {
          requestTask.abort();
          requestTask = null;
        }
      },
      isActive: () => isActive,
    };
  }

  /**
   * Internal streaming implementation
   */
  async function streamMessage(
    request: ChatRequest,
    handlers: WeappStreamEventHandlers,
    onTaskCreated: (task: Taro.RequestTask<unknown>) => void
  ): Promise<void> {
    const { onPartial, onEnd, onError } = handlers;

    // Build request URL
    const url = mergedConfig.baseUrl + mergedConfig.endpoint;

    // Build request body (compatible with payment_interface format)
    const data = {
      sessionId: request.sessionId,
      messageId: request.messageId,
      text: request.text,
      platform: request.metadata?.platform || 'weapp',
    };

    // Build headers with auth token and tenant-id
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'tenant-id': mergedConfig.tenantId,
    };

    // Add Authorization header if token is available
    const authToken = mergedConfig.getAuthToken();
    if (authToken) {
      header['Authorization'] = `Bearer ${authToken}`;
    }

    // Create SSE parser for payment_interface output
    // payment_interface wraps JSONL as SSE: "data: {json}\n\n"
    const parser = createDualChannelSseParser();
    // Decoder for ArrayBuffer to string conversion
    const textDecoder = new TextDecoder('utf-8');

    try {
      // Use wx.request directly instead of Taro.request
      // Taro.request may not correctly pass enableChunked to underlying wx.request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wxRequest = (wx as any).request as typeof Taro.request;
      const requestTask = wxRequest({
        url,
        method: 'POST',
        header,
        data,
        timeout: mergedConfig.timeout,
        enableChunked: true, // Enable chunked transfer - critical for streaming!
        responseType: 'text',
        success: (res: { statusCode: number }) => {
          // Request completed
          if (res.statusCode === 200) {
            onEnd?.();
          } else { 
            const errorCode = mapHttpStatusToErrorCode(res.statusCode);
            onError?.({
              code: errorCode,
              message: `HTTP ${res.statusCode}`,
              recoverable: res.statusCode >= 500,
            });
          }
        },
        fail: (err: { errMsg?: string }) => {
          // Request failed
          if (err.errMsg?.includes('abort')) {
            // User cancelled - not an error
            return;
          }
          onError?.({
            code: ChatErrorCodes.NETWORK_ERROR,
            message: err.errMsg || 'Request failed',
            recoverable: true,
          });
        },
      }) as Taro.RequestTask<unknown>;

      // Pass task to caller for abort capability
      onTaskCreated(requestTask);

      // Listen for chunked data
      requestTask.onChunkReceived?.((res: { data: ArrayBuffer }) => {
        try {
          // Decode ArrayBuffer to string
          // IMPORTANT: Use { stream: true } to handle UTF-8 characters that may be
          // split across chunk boundaries. Without this option, incomplete multi-byte
          // sequences (like Chinese characters which are 3 bytes in UTF-8) would be
          // replaced with U+FFFD (replacement character, shown as diamond question mark).
          const chunk = textDecoder.decode(res.data, { stream: true });

          // Parse and emit events
          const events = parser.push(chunk);

          for (const event of events) {
            // Only process and emit events with actual content
            if (event.textDelta) {
              onPartial?.(event.textDelta, event.state);
            } else if (event.state !== undefined) {
              // State-only event
              onPartial?.('', event.state);
            }
          }
        } catch (parseError) {
          console.error('[WeappChunkedClient] Parse error:', parseError);
        }
      });

      // Wait for request to complete (the promise resolves when success/fail is called)
      // Note: We don't await here because we're handling events via onChunkReceived
    } catch (error) {
      // Unexpected error
      onError?.({
        code: ChatErrorCodes.NETWORK_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
        recoverable: true,
      });
    }
  }

  /**
   * Map HTTP status code to error code
   */
  function mapHttpStatusToErrorCode(status: number): ChatErrorCode {
    switch (status) {
      case 401:
        return ChatErrorCodes.AUTH_REQUIRED;
      case 403:
        return ChatErrorCodes.AUTH_FAILED;
      case 429:
        return ChatErrorCodes.RATE_LIMITED;
      case 408:
        return ChatErrorCodes.TIMEOUT;
      default:
        return status >= 500 ? ChatErrorCodes.SERVER_ERROR : ChatErrorCodes.UNKNOWN;
    }
  }

  return {
    isStreamingSupported,
    sendMessage,
  };
}

/**
 * Default WeApp chunked client instance
 */
export const weappChunkedClient = createWeappChunkedClient();
