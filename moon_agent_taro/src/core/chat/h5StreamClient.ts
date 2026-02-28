/**
 * H5 Stream Client for Chat
 *
 * SSE streaming client for H5 platform using fetch + ReadableStream.
 * This client connects to payment_interface (NOT directly to n8n).
 *
 * Features:
 * - Real-time streaming via fetch API
 * - Automatic credential handling (withCredentials)
 * - Authorization header support (Bearer token)
 * - Connection abort support
 * - SSE/JSONL format parsing via dual-channel parser
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */

import Taro from '@tarojs/taro';
import { authClient } from '@core/auth';
import {
  createDualChannelParser,
  type ChatRequest,
  ChatErrorCodes,
  type ChatErrorCode,
} from './index';

// ============================================================================
// Types
// ============================================================================

/**
 * Stream event callback handlers
 */
export interface StreamEventHandlers {
  /** Called when a partial text chunk is received */
  onPartial?: (content: string, state?: Record<string, unknown> | null) => void;
  /** Called when streaming is complete */
  onEnd?: () => void;
  /** Called when an error occurs */
  onError?: (error: StreamError) => void;
}

/**
 * Stream error structure
 */
export interface StreamError {
  code: ChatErrorCode;
  message: string;
  recoverable: boolean;
}

/**
 * Stream client configuration
 */
export interface H5StreamClientConfig {
  /** Base URL for chat API (defaults to current origin) */
  baseUrl?: string;
  /** Chat stream endpoint path */
  endpoint?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable credentials (cookies) */
  withCredentials?: boolean;
  /** Tenant ID for multi-tenant support */
  tenantId?: string;
  /** Custom auth token getter (defaults to authClient.getAccessToken) */
  getAuthToken?: () => string | null;
}

/**
 * Active stream connection
 */
export interface StreamConnection {
  /** Abort the stream */
  abort: () => void;
  /** Check if stream is active */
  isActive: () => boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<H5StreamClientConfig> = {
  baseUrl: '',
  endpoint: '/infra/chat/stream',
  timeout: 120000, // 2 minutes
  withCredentials: true,
  tenantId:
    typeof TARO_APP_TENANT_ID !== 'undefined' ? TARO_APP_TENANT_ID : '1',
  getAuthToken: () => authClient.getAccessToken(),
};

// ============================================================================
// H5 Stream Client
// ============================================================================

/**
 * Create H5 stream client for chat
 *
 * @param config - Client configuration
 * @returns Stream client instance
 */
export function createH5StreamClient(config?: H5StreamClientConfig) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  /**
   * Check if current platform supports fetch streaming
   */
  function isStreamingSupported(): boolean {
    // H5 platform check - fetch with ReadableStream support
    const env = Taro.getEnv();
    if (env !== Taro.ENV_TYPE.WEB) {
      return false;
    }

    // Check for fetch and ReadableStream support
    return (
      typeof fetch !== 'undefined' && typeof ReadableStream !== 'undefined'
    );
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
    handlers: StreamEventHandlers
  ): StreamConnection {
    const abortController = new AbortController();
    let isActive = true;

    // Start streaming in background
    streamMessage(request, handlers, abortController).finally(() => {
      isActive = false;
    });

    return {
      abort: () => {
        isActive = false;
        abortController.abort();
      },
      isActive: () => isActive,
    };
  }

  /**
   * Internal streaming implementation
   */
  async function streamMessage(
    request: ChatRequest,
    handlers: StreamEventHandlers,
    abortController: AbortController
  ): Promise<void> {
    const { onPartial, onEnd, onError } = handlers;

    // Build request URL
    const url = mergedConfig.baseUrl + mergedConfig.endpoint;

    // Build request body (compatible with payment_interface format)
    const body = JSON.stringify({
      sessionId: request.sessionId,
      messageId: request.messageId,
      text: request.text,
      platform: request.metadata?.platform || 'h5',
    });

    try {
      // Build headers with auth token and tenant-id
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'tenant-id': mergedConfig.tenantId,
      };

      // Add Authorization header if token is available
      const authToken = mergedConfig.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Send fetch request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        credentials: mergedConfig.withCredentials ? 'include' : 'same-origin',
        signal: abortController.signal,
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorCode = mapHttpStatusToErrorCode(response.status);
        onError?.({
          code: errorCode,
          message: `HTTP ${response.status}: ${response.statusText}`,
          recoverable: response.status >= 500,
        });
        return;
      }

      // Get response body stream
      const reader = response.body?.getReader();
      if (!reader) {
        onError?.({
          code: ChatErrorCodes.NETWORK_ERROR,
          message: 'Response body is not readable',
          recoverable: false,
        });
        return;
      }

      // Create parser based on Content-Type
      // n8n returns JSONL for streaming, payment_interface may return SSE
      const contentType = response.headers.get('content-type');
      const parser = createDualChannelParser(contentType);
      const decoder = new TextDecoder();

      // Read stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onEnd?.();
          break;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });

        // Parse and emit events
        const events = parser.push(chunk);
        for (const event of events) {
          if (event.textDelta) {
            onPartial?.(event.textDelta, event.state);
          } else if (event.state !== undefined) {
            // State-only event
            onPartial?.('', event.state);
          }
        }
      }
    } catch (error) {
      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled - not an error
        return;
      }

      // Handle network errors
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
        return status >= 500
          ? ChatErrorCodes.SERVER_ERROR
          : ChatErrorCodes.UNKNOWN;
    }
  }

  return {
    isStreamingSupported,
    sendMessage,
  };
}

/**
 * Default H5 stream client instance
 */
export const h5StreamClient = createH5StreamClient();
