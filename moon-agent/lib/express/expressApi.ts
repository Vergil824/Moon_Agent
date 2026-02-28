/**
 * Express Delivery API Types and Functions
 * Story 4.4: Checkout Confirmation - Express Company Selection
 *
 * API Endpoint:
 * - GET /app-api/trade/delivery/express/list - Get available express companies
 */

import { clientFetch, type ApiResponse } from "@/lib/core/api";

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ============================================================
// Type Definitions (based on AppDeliveryExpressRespVO)
// ============================================================

/**
 * Express company item
 */
export type ExpressCompany = {
  id: number;
  name: string;
};

// ============================================================
// API Functions
// ============================================================

/**
 * Get list of available express companies
 *
 * @param accessToken User auth token (optional - endpoint is @PermitAll)
 */
export async function getExpressList(
  accessToken?: string
): Promise<ApiResponse<ExpressCompany[]>> {
  return clientFetch<ExpressCompany[]>("/app-api/trade/delivery/express/list", {
    method: "GET",
    accessToken,
  });
}

