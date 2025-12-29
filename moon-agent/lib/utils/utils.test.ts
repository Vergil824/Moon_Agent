import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isMobile,
  isWeChatBrowser,
  getPaymentChannel,
  type PaymentMethod,
  type PaymentChannelCode,
} from "@/lib/utils/utils";

describe('UA Detection Utilities', () => {
  const originalNavigator = global.navigator;

  const mockUserAgent = (ua: string) => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: ua },
      writable: true,
      configurable: true,
    });
  };

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe('isMobile', () => {
    it('should return true for iPhone user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );
      expect(isMobile()).toBe(true);
    });

    it('should return true for Android user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36'
      );
      expect(isMobile()).toBe(true);
    });

    it('should return false for desktop user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );
      expect(isMobile()).toBe(false);
    });

    it('should return false for Mac desktop user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      );
      expect(isMobile()).toBe(false);
    });
  });

  describe('isWeChatBrowser', () => {
    it('should return true for WeChat browser user agent', () => {
      mockUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 MicroMessenger/8.0.0'
      );
      expect(isWeChatBrowser()).toBe(true);
    });

    it('should return false for regular mobile browser', () => {
      mockUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );
      expect(isWeChatBrowser()).toBe(false);
    });

    it('should return false for desktop browser', () => {
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );
      expect(isWeChatBrowser()).toBe(false);
    });
  });

  describe('getPaymentChannel', () => {
    describe('Alipay channels', () => {
      it('should return alipay_wap for mobile browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        );
        expect(getPaymentChannel('alipay')).toBe('alipay_wap');
      });

      it('should return alipay_wap for Android mobile browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36'
        );
        expect(getPaymentChannel('alipay')).toBe('alipay_wap');
      });

      it('should return alipay_pc for desktop browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
        expect(getPaymentChannel('alipay')).toBe('alipay_pc');
      });

      it('should return alipay_pc for Mac desktop browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        );
        expect(getPaymentChannel('alipay')).toBe('alipay_pc');
      });
    });

    describe('WeChat channels', () => {
      it('should return wx_pub for WeChat in-app browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 MicroMessenger/8.0.0'
        );
        expect(getPaymentChannel('wechat')).toBe('wx_pub');
      });

      it('should return wx_wap for regular mobile browser (non-WeChat)', () => {
        mockUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        );
        expect(getPaymentChannel('wechat')).toBe('wx_wap');
      });

      it('should return wx_wap for Android mobile browser (non-WeChat)', () => {
        mockUserAgent(
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36'
        );
        expect(getPaymentChannel('wechat')).toBe('wx_wap');
      });

      it('should return wx_native for desktop browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
        expect(getPaymentChannel('wechat')).toBe('wx_native');
      });

      it('should return wx_native for Mac desktop browser', () => {
        mockUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        );
        expect(getPaymentChannel('wechat')).toBe('wx_native');
      });
    });
  });
});

