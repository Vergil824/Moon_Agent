/**
 * AuthClient Type Test Specifications
 *
 * NOTE: Test framework is not configured for moon_agent_taro yet.
 * This file provides type-level validation until Epic 6 test setup.
 */

import { authClient, type SmsLoginPayload, type AuthTokens } from "@core/auth";

const typeCheck = (): void => {
  const payload: SmsLoginPayload = {
    mobile: "13800138000",
    code: "123456",
  };

  const resultPromise: Promise<{
    code: number;
    msg: string;
    data: AuthTokens;
  }> = authClient.login(payload);
  const smsPromise = authClient.sendSmsCode(payload.mobile);

  const token = authClient.getAccessToken();

  void resultPromise;
  void smsPromise;
  void token;
};

export { typeCheck };
