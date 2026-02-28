import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

// Mock payApi
vi.mock('@/lib/payment/payApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/payment/payApi')>();
  return {
    ...actual,
    getPayOrder: vi.fn(),
  };
});

import PaymentResultPage from './page';
import { getPayOrder, PayOrderStatus } from '@/lib/payment/payApi';

const mockedGetPayOrder = vi.mocked(getPayOrder);

let mockSearchParams = '';
let mockSession: { data: { accessToken: string } | null } = {
  data: { accessToken: 'test-token' },
};

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PaymentResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockPush.mockClear();
    mockSearchParams = 'id=12345';
    mockSession = { data: { accessToken: 'test-token' } };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render loading state initially', () => {
    mockedGetPayOrder.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('payment-result-page')).toBeInTheDocument();
    expect(screen.getByText('正在查询支付结果...')).toBeInTheDocument();
  });

  it('should display success state when payment is successful', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        id: 12345,
        status: PayOrderStatus.SUCCESS,
        price: 16800,
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
        successTime: '2025-12-29T10:00:00Z',
      },
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('支付成功')).toBeInTheDocument();
    });

    expect(screen.getByText('¥168.00')).toBeInTheDocument();
    expect(screen.getByText('查看订单')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('should display waiting state and poll when payment is pending', async () => {
    mockedGetPayOrder.mockResolvedValue({
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
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('等待支付结果')).toBeInTheDocument();
    });

    expect(screen.getByText('自动刷新中')).toBeInTheDocument();
  });

  it('should display closed state when payment is closed', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        id: 12345,
        status: PayOrderStatus.CLOSED,
        price: 16800,
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
      },
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('已关闭')).toBeInTheDocument();
    });

    expect(screen.getByText('订单已关闭或已取消')).toBeInTheDocument();
  });

  it('should display error state when query fails', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 500,
      msg: '服务器错误',
      data: null as any,
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '查询失败' })).toBeInTheDocument();
    });

    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('should navigate to orders page when clicking "查看订单"', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        id: 12345,
        status: PayOrderStatus.SUCCESS,
        price: 16800,
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
        successTime: '2025-12-29T10:00:00Z',
      },
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('查看订单')).toBeInTheDocument();
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByText('查看订单'));

    expect(mockPush).toHaveBeenCalledWith('/profile/orders');
  });

  it('should navigate to home when clicking "返回首页"', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        id: 12345,
        status: PayOrderStatus.SUCCESS,
        price: 16800,
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
        successTime: '2025-12-29T10:00:00Z',
      },
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('返回首页')).toBeInTheDocument();
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByText('返回首页'));

    expect(mockPush).toHaveBeenCalledWith('/chat');
  });

  it('should display order info in footer', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        id: 12345,
        status: PayOrderStatus.SUCCESS,
        price: 16800,
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
        successTime: '2025-12-29T10:00:00Z',
        channelOrderNo: 'CHANNEL123',
      },
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/支付单号: 12345/)).toBeInTheDocument();
    });

    expect(screen.getByText(/渠道单号: CHANNEL123/)).toBeInTheDocument();
  });

  it('should format price correctly', async () => {
    mockedGetPayOrder.mockResolvedValue({
      code: 0,
      msg: 'success',
      data: {
        id: 12345,
        status: PayOrderStatus.SUCCESS,
        price: 99, // 0.99 yuan
        channelCode: 'alipay_wap',
        merchantOrderId: 'ORDER123',
        subject: '测试订单',
        successTime: '2025-12-29T10:00:00Z',
      },
    });

    render(<PaymentResultPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('¥0.99')).toBeInTheDocument();
    });
  });
});

