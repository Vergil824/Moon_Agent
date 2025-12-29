import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { act } from "react-dom/test-utils";
import { ProductRecommendation } from "./ProductRecommendation";
import { useChatStore } from "@/lib/core/store";

const addCartItemMock = vi.fn();
const deleteCartItemsMock = vi.fn();
const updateCartCountMock = vi.fn();
const getCartListMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    custom: (renderer: (id: string) => React.ReactNode) => {
      const node = renderer("toast-id");
      render(node);
      return "toast-id";
    },
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock("@/lib/cart/cartApi", () => ({
  addCartItem: (...args: unknown[]) => addCartItemMock(...args),
  deleteCartItems: (...args: unknown[]) => deleteCartItemsMock(...args),
  updateCartCount: (...args: unknown[]) => updateCartCountMock(...args),
  getCartList: (...args: unknown[]) => getCartListMock(...args)
}));

const baseProduct = {
  sku_id: 1,
  spu_id: 10,
  product_name: "Test Bra",
  price: 199,
  matching: 95,
  image_url: "",
  size: "M"
};

const createWrapper = async (product = baseProduct) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  let utils: ReturnType<typeof render>;
  await act(async () => {
    utils = render(
      <QueryClientProvider client={client}>
        <ProductRecommendation payload={{ products: [product] }} onSelect={() => {}} />
      </QueryClientProvider>
    );
  });

  // @ts-expect-error utils is assigned in act block
  return utils as ReturnType<typeof render>;
};

const buildCartItem = (overrides: Partial<unknown> = {}) => ({
  id: 50,
  userId: 1,
  spuId: baseProduct.spu_id,
  skuId: baseProduct.sku_id!,
  count: 2,
  selected: true,
  addTime: "",
  spu: { id: baseProduct.spu_id!, name: "spu", picUrl: "", categoryId: 1 },
  sku: { id: baseProduct.sku_id!, spuId: baseProduct.spu_id!, picUrl: "", price: baseProduct.price, stock: 10, properties: [] },
  promotions: [],
  ...overrides
});

describe("ProductRecommendation add & undo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.persist?.clearStorage?.();
    useChatStore.setState({ hasAutoOpenedCurrentState: false, recommendedProducts: [] });
  });

  it("restores previous count via update-count when item existed", async () => {
    getCartListMock.mockResolvedValueOnce({
      code: 0,
      msg: "",
      data: { validList: [buildCartItem({ count: 2, id: 77 })], invalidList: [] }
    });
    addCartItemMock.mockResolvedValue({ code: 0, msg: "", data: 105 });
    updateCartCountMock.mockResolvedValue({ code: 0, msg: "", data: true });
    deleteCartItemsMock.mockResolvedValue({ code: 0, msg: "", data: true });

    await createWrapper();

    const addButton = await screen.findByRole("button", { name: "加入购物车" });
    await userEvent.click(addButton);

    await waitFor(() =>
      expect(addCartItemMock).toHaveBeenCalledWith({ skuId: baseProduct.sku_id, count: 1 }, "test-token")
    );

    const undoButton = await screen.findByRole("button", { name: "撤回" });
    await userEvent.click(undoButton);

    await waitFor(() =>
      expect(
        updateCartCountMock.mock.calls.length + deleteCartItemsMock.mock.calls.length
      ).toBeGreaterThan(0)
    );
    expect(updateCartCountMock).toHaveBeenCalledWith({ id: 77, count: 2 }, "test-token");
    expect(deleteCartItemsMock).not.toHaveBeenCalled();
  });

  it("deletes newly added item when no previous count", async () => {
    getCartListMock
      .mockResolvedValueOnce({
        code: 0,
        msg: "",
        data: { validList: [], invalidList: [] }
      })
      .mockResolvedValueOnce({
        code: 0,
        msg: "",
        data: { validList: [buildCartItem({ id: 200, count: 1 })], invalidList: [] }
      });

    addCartItemMock.mockResolvedValue({ code: 0, msg: "", data: 200 });
    deleteCartItemsMock.mockResolvedValue({ code: 0, msg: "", data: true });
    updateCartCountMock.mockResolvedValue({ code: 0, msg: "", data: true });

    await createWrapper();

    const addButton = await screen.findByRole("button", { name: "加入购物车" });
    await userEvent.click(addButton);

    await waitFor(() =>
      expect(addCartItemMock).toHaveBeenCalledWith({ skuId: baseProduct.sku_id, count: 1 }, "test-token")
    );

    const undoButton = await screen.findByRole("button", { name: "撤回" });
    await userEvent.click(undoButton);

    await waitFor(() => expect(deleteCartItemsMock).toHaveBeenCalledWith([200], "test-token"));
    expect(updateCartCountMock).not.toHaveBeenCalled();
  });
});
