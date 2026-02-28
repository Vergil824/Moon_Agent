import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the API module
vi.mock('@/lib/core/api', () => ({
  clientFetch: vi.fn(),
}));

import { clientFetch } from "@/lib/core/api";
import {
  submitPayOrder,
  getPayOrder,
  PayOrderStatus,
  type SubmitPayOrderRequest,
  type PayOrderRespVO,
} from './payApi';

const mockedClientFetch = vi.mocked(clientFetch);

describe('payApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitPayOrder', () => {
    it('should call correct endpoint with proper parameters', async () => {
      const mockResponse = {
        code: 0,
        msg: 'success',
        data: {
          displayMode: 'url',
          displayContent: 'https://payment.alipay.com/redirect',
        },
      };
      mockedClientFetch.mockResolvedValueOnce(mockResponse);

      const request: SubmitPayOrderRequest = {
        id: 12345,
        channelCode: 'alipay_wap',
        returnUrl: '/pay/result?id=12345',
        displayMode: 'url',
      };

      const result = await submitPayOrder(request, 'test-token');

      expect(mockedClientFetch).toHaveBeenCalledWith(
        '/app-api/pay/order/submit',
        {
          method: 'POST',
          body: request,
          accessToken: 'test-token',
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include openid for wx_pub channel', async () => {
      const mockResponse = {
        code: 0,
        msg: 'success',
        data: {
          displayMode: 'url',
          displayContent: 'https://wx.pay.com',
        },
      };
      mockedClientFetch.mockResolvedValueOnce(mockResponse);

      const request: SubmitPayOrderRequest = {
        id: 12345,
        channelCode: 'wx_pub',
        returnUrl: '/pay/result?id=12345',
        displayMode: 'url',
        channelExtras: {
          openid: 'user-openid-123',
        },
      };

      await submitPayOrder(request, 'test-token');

      expect(mockedClientFetch).toHaveBeenCalledWith(
        '/app-api/pay/order/submit',
        {
          method: 'POST',
          body: request,
          accessToken: 'test-token',
        }
      );
    });
  });

  describe('getPayOrder', () => {
    it('should call correct endpoint with id parameter', async () => {
      const mockPayOrder: PayOrderRespVO = {
        id: 12345,
        status: PayOrderStatus.SUCCESS,
        price: 16800,
        successTime: '2025-12-29T10:00:00Z',
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
      };
      const mockResponse = {
        code: 0,
        msg: 'success',
        data: mockPayOrder,
      };
      mockedClientFetch.mockResolvedValueOnce(mockResponse);

      const result = await getPayOrder(12345, 'test-token');

      expect(mockedClientFetch).toHaveBeenCalledWith(
        '/app-api/pay/order/get?id=12345&sync=true',
        {
          method: 'GET',
          accessToken: 'test-token',
        }
      );
      expect(result.data.status).toBe(PayOrderStatus.SUCCESS);
    });

    it('should handle waiting status', async () => {
      const mockPayOrder: PayOrderRespVO = {
        id: 12345,
        status: PayOrderStatus.WAITING,
        price: 16800,
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
      };
      const mockResponse = {
        code: 0,
        msg: 'success',
        data: mockPayOrder,
      };
      mockedClientFetch.mockResolvedValueOnce(mockResponse);

      const result = await getPayOrder(12345, 'test-token');

      expect(result.data.status).toBe(PayOrderStatus.WAITING);
      expect(result.data.successTime).toBeUndefined();
    });

    it('should handle closed status', async () => {
      const mockPayOrder: PayOrderRespVO = {
        id: 12345,
        status: PayOrderStatus.CLOSED,
        price: 16800,
        channelCode: 'wx_native',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
      };
      const mockResponse = {
        code: 0,
        msg: 'success',
        data: mockPayOrder,
      };
      mockedClientFetch.mockResolvedValueOnce(mockResponse);

      const result = await getPayOrder(12345, 'test-token');

      expect(result.data.status).toBe(PayOrderStatus.CLOSED);
    });

    it('should allow disabling sync parameter', async () => {
      const mockResponse = {
        code: 0,
        msg: 'success',
        data: {
          id: 12345,
          status: PayOrderStatus.WAITING,
          price: 16800,
          channelCode: 'alipay_wap',
          merchantOrderId: 'ORDER123',
          subject: '测试订单',
        },
      };
      mockedClientFetch.mockResolvedValueOnce(mockResponse);

      await getPayOrder(12345, 'test-token', false);

      expect(mockedClientFetch).toHaveBeenCalledWith(
        '/app-api/pay/order/get?id=12345',
        {
          method: 'GET',
          accessToken: 'test-token',
        }
      );
    });
  });

  describe('PayOrderStatus enum', () => {
    it('should have correct status values', () => {
      expect(PayOrderStatus.WAITING).toBe(0);
      expect(PayOrderStatus.SUCCESS).toBe(10);
      expect(PayOrderStatus.CLOSED).toBe(20);
    });
  });
});

