/**
 * Auth types shared across platforms.
 */
export type AuthTokens = {
  userId?: number;
  accessToken: string;
  refreshToken?: string;
  expiresTime?: number;
};

export type SmsLoginPayload = {
  mobile: string;
  code: string;
};

/**
 * WeChat Mini App login payload
 * - phoneCode: The code from wx.getPhoneNumber() for getting phone number
 * - loginCode: The code from wx.login() for WeChat session
 * - state: Random string for CSRF protection (required by backend)
 */
export type WeixinMiniAppLoginPayload = {
  phoneCode: string;
  loginCode: string;
  state: string;
};
