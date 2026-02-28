import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

// Mock the cartApi module (next-auth/react is mocked in vitest.setup.ts)
vi.mock('@/lib/cart/cartApi', async () => {
  const actual = await vi.importActual("./cartApi");
  return {
    ...actual,
    getCartList: vi.fn(),
    updateCartCount: vi.fn(),
    updateCartSelected: vi.fn(),
    deleteCartItems: vi.fn(),
  };
});

import * as cartApi from "./cartApi";
import {
  useCartList,
  useCartComputed,
  useUpdateCartCount,
  useUpdateCartSelected,
  useDeleteCartItems,
  CART_QUERY_KEY,
} from "@/lib/cart/useCart";

// Helper to create wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  wrapper.displayName = 'QueryClientWrapper';
  return wrapper;
}

// Mock cart data
const mockCartData = {
  validList: [
    {
      id: 1,
      userId: 1,
      spuId: 100,
      skuId: 1000,
      count: 2,
      selected: true,
      addTime: "2025-12-28T10:00:00Z",
      spu: { id: 100, name: "商品1", picUrl: "test.jpg", categoryId: 1 },
      sku: { id: 1000, spuId: 100, picUrl: null, price: 10000, stock: 100, properties: [] },
    },
    {
      id: 2,
      userId: 1,
      spuId: 101,
      skuId: 1001,
      count: 1,
      selected: false,
      addTime: "2025-12-28T11:00:00Z",
      spu: { id: 101, name: "商品2", picUrl: "test2.jpg", categoryId: 1 },
      sku: { id: 1001, spuId: 101, picUrl: null, price: 15000, stock: 50, properties: [] },
    },
  ],
  invalidList: [],
};

describe("useCartList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches cart list successfully", async () => {
    vi.mocked(cartApi.getCartList).mockResolvedValueOnce({
      code: 0,
      msg: "success",
      data: mockCartData,
    });

    const { result } = renderHook(() => useCartList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCartData);
    expect(cartApi.getCartList).toHaveBeenCalledWith("test-token");
  });

  it("handles error when API returns non-zero code", async () => {
    vi.mocked(cartApi.getCartList).mockResolvedValueOnce({
      code: 500,
      msg: "Server Error",
      data: null as unknown as typeof mockCartData,
    });

    const { result } = renderHook(() => useCartList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useCartComputed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes cart values correctly", async () => {
    vi.mocked(cartApi.getCartList).mockResolvedValueOnce({
      code: 0,
      msg: "success",
      data: mockCartData,
    });

    const { result } = renderHook(() => useCartComputed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Total items: 2 + 1 = 3
    expect(result.current.totalItems).toBe(3);
    // Selected total: 2 * 10000 = 20000 (only first item is selected)
    expect(result.current.selectedTotal).toBe(20000);
    // Selected count: 2 (count of selected item)
    expect(result.current.selectedCount).toBe(2);
    // Not all selected (second item is not selected)
    expect(result.current.isAllSelected).toBe(false);
    // Valid items
    expect(result.current.validItems).toHaveLength(2);
    // Invalid items
    expect(result.current.invalidItems).toHaveLength(0);
  });

  it("returns isEmpty true when cart is empty", async () => {
    vi.mocked(cartApi.getCartList).mockResolvedValueOnce({
      code: 0,
      msg: "success",
      data: { validList: [], invalidList: [] },
    });

    const { result } = renderHook(() => useCartComputed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
  });
});

describe("useUpdateCartCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateCartCount API with correct params", async () => {
    vi.mocked(cartApi.updateCartCount).mockResolvedValueOnce({
      code: 0,
      msg: "success",
      data: true,
    });

    const { result } = renderHook(() => useUpdateCartCount(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 1, count: 5 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(cartApi.updateCartCount).toHaveBeenCalledWith({ id: 1, count: 5 }, "test-token");
  });
});

describe("useUpdateCartSelected", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateCartSelected API with correct params", async () => {
    vi.mocked(cartApi.updateCartSelected).mockResolvedValueOnce({
      code: 0,
      msg: "success",
      data: true,
    });

    const { result } = renderHook(() => useUpdateCartSelected(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ ids: [1, 2], selected: true });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(cartApi.updateCartSelected).toHaveBeenCalledWith({
      ids: [1, 2],
      selected: true,
    }, "test-token");
  });
});

describe("useDeleteCartItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deleteCartItems API with correct params", async () => {
    vi.mocked(cartApi.deleteCartItems).mockResolvedValueOnce({
      code: 0,
      msg: "success",
      data: true,
    });

    const { result } = renderHook(() => useDeleteCartItems(), {
      wrapper: createWrapper(),
    });

    result.current.mutate([1, 2, 3]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(cartApi.deleteCartItems).toHaveBeenCalledWith([1, 2, 3], "test-token");
  });
});

