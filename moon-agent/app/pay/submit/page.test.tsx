import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

// Mock payApi
vi.mock('@/lib/payment/payApi', () => ({
  submitPayOrder: vi.fn(),
}));

// Mock utils - keep actual cn function, only mock getPaymentChannel
vi.mock('@/lib/utils/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils/utils')>();
  return {
    ...actual,
    getPaymentChannel: vi.fn(),
  };
});

import PaymentSubmitPage from './page';
import { submitPayOrder } from '@/lib/payment/payApi';
import { getPaymentChannel } from '@/lib/utils/utils';

const mockedSubmitPayOrder = vi.mocked(submitPayOrder);
const mockedGetPaymentChannel = vi.mocked(getPaymentChannel);

let mockSearchParams = '';
let mockSession: { data: { accessToken: string } | null } = {
  data: { accessToken: 'test-token' },
};

describe('PaymentSubmitPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockSearchParams = 'payOrderId=12345&orderId=100&method=alipay';
    mockSession = { data: { accessToken: 'test-token' } };
  });

  it('should render loading state initially', () => {
    mockedGetPaymentChannel.mockReturnValue('alipay_wap');
    mockedSubmitPayOrder.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    render(<PaymentSubmitPage />);

    expect(screen.getByTestId('payment-submit-page')).toBeInTheDocument();
    expect(screen.getByText('正在准备支付...')).toBeInTheDocument();
  });

  it('should show QR code for wx_native channel', async () => {
    mockSearchParams = 'payOrderId=12345&orderId=100&method=wechat';
    mockedGetPaymentChannel.mockReturnValue('wx_native');
    mockedSubmitPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        displayMode: 'qr',
        displayContent: 'weixin://wxpay/test-qr-content',
      },
    });

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(screen.getByText('微信扫码支付')).toBeInTheDocument();
    });

    expect(screen.getByText('我已完成支付')).toBeInTheDocument();
    expect(screen.getByText('返回重新选择')).toBeInTheDocument();
  });

  it('should show payment link button for alipay_wap channel', async () => {
    mockedGetPaymentChannel.mockReturnValue('alipay_wap');
    mockedSubmitPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        displayMode: 'url',
        displayContent: 'https://payment.alipay.com/redirect',
      },
    });

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(screen.getByText('请点击下方按钮前往支付')).toBeInTheDocument();
    });

    // Should have a link to payment page
    const paymentLink = screen.getByRole('link', { name: /前往支付宝支付/i });
    expect(paymentLink).toHaveAttribute('href', 'https://payment.alipay.com/redirect');
    expect(paymentLink).toHaveAttribute('target', '_blank');

    // Should have a button to check result
    expect(screen.getByText('我已完成支付，查看结果')).toBeInTheDocument();
  });

  it('should show error dialog when payment parameters are missing', async () => {
    mockSearchParams = ''; // No params

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(screen.getByText('支付参数缺失')).toBeInTheDocument();
    });
  });

  it('should navigate to result page when clicking "我已完成支付"', async () => {
    mockSearchParams = 'payOrderId=12345&orderId=100&method=wechat';
    mockedGetPaymentChannel.mockReturnValue('wx_native');
    mockedSubmitPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        displayMode: 'qr',
        displayContent: 'weixin://wxpay/test-qr-content',
      },
    });

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(screen.getByText('我已完成支付')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('我已完成支付'));

    expect(mockPush).toHaveBeenCalledWith('/pay/result?id=12345');
  });

  it('should navigate back to payment submit when clicking "返回重新选择"', async () => {
    mockSearchParams = 'payOrderId=12345&orderId=100&method=wechat';
    mockedGetPaymentChannel.mockReturnValue('wx_native');
    mockedSubmitPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        displayMode: 'qr',
        displayContent: 'weixin://wxpay/test-qr-content',
      },
    });

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(screen.getByText('返回重新选择')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('返回重新选择'));

    expect(mockReplace).toHaveBeenCalledWith('/pay/submit?payOrderId=12345&orderId=100&method=wechat');
  });

  it('should show error for wx_pub without openid', async () => {
    mockSearchParams = 'payOrderId=12345&orderId=100&method=wechat';
    mockedGetPaymentChannel.mockReturnValue('wx_pub');

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(screen.getByText('微信内支付需要获取授权')).toBeInTheDocument();
    });
  });

  it('should call submitPayOrder with correct parameters', async () => {
    mockedGetPaymentChannel.mockReturnValue('alipay_wap');
    mockedSubmitPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        displayMode: 'url',
        displayContent: 'https://payment.alipay.com/redirect',
      },
    });

    // Mock window.location.origin
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, origin: 'http://localhost:3000' },
    });

    render(<PaymentSubmitPage />);

    await waitFor(() => {
      expect(mockedSubmitPayOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 12345,
          channelCode: 'alipay_wap',
          displayMode: 'url',
        }),
        'test-token'
      );
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});

