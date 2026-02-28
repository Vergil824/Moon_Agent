/**
 * Request Auth Refresh Type Test Specifications
 *
 * NOTE: Test framework is not configured for moon_agent_taro yet.
 * This file provides type-level validation until Epic 6 test setup.
 */

import { request, type RequestConfig } from "@core/api";

const typeCheck = (): void => {
  const config: RequestConfig = {
    method: "POST",
    skipAuth: true,
    withCredentials: true,
  };

  const resultPromise = request<{ ok: boolean }>(
    "/member/auth/refresh-token",
    config,
  );

  void resultPromise;
};

export { typeCheck };
