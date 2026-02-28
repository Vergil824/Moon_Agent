import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartStoreSection } from "./CartStoreSection";
import { type CartStore, type CartItem } from "@/lib/cart/cartApi";

// Helper to create mock cart items
function createMockCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 1,
    userId: 1,
    spuId: 100,
    skuId: 1000,
    count: 1,
    selected: false,
    addTime: "2025-12-28T10:00:00Z",
    spu: {
      id: 100,
      name: "测试商品",
      picUrl: "https://example.com/spu.jpg",
      categoryId: 1,
    },
    sku: {
      id: 1000,
      spuId: 100,
      picUrl: null,
      price: 16000,
      stock: 100,
      properties: [],
    },
    ...overrides,
  };
}

function createMockStore(items: CartItem[]): CartStore {
  return {
    id: 1,
    name: "满月Moon优选",
    items,
  };
}

describe("CartStoreSection", () => {
  const defaultProps = {
    onStoreSelect: vi.fn(),
    onItemSelect: vi.fn(),
    onItemQuantityChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders store name correctly", () => {
    const store = createMockStore([createMockCartItem()]);
    render(<CartStoreSection {...defaultProps} store={store} />);
    
    expect(screen.getByTestId("cart-store-section")).toBeInTheDocument();
    expect(screen.getByText("满月Moon优选")).toBeInTheDocument();
  });

  it("renders all product items in the store", () => {
    const store = createMockStore([
      createMockCartItem({ id: 1, spu: { id: 1, name: "商品1", picUrl: "", categoryId: 1 } }),
      createMockCartItem({ id: 2, spu: { id: 2, name: "商品2", picUrl: "", categoryId: 1 } }),
    ]);
    render(<CartStoreSection {...defaultProps} store={store} />);
    
    expect(screen.getByText("商品1")).toBeInTheDocument();
    expect(screen.getByText("商品2")).toBeInTheDocument();
  });

  it("calls onStoreSelect when store checkbox is clicked", async () => {
    const user = userEvent.setup();
    const handleStoreSelect = vi.fn();
    const store = createMockStore([createMockCartItem()]);
    
    render(
      <CartStoreSection {...defaultProps} store={store} onStoreSelect={handleStoreSelect} />
    );
    
    // Find the first checkbox (store checkbox)
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    
    expect(handleStoreSelect).toHaveBeenCalledWith(true);
  });

  it("shows store checkbox as checked when all items are selected", () => {
    const store = createMockStore([
      createMockCartItem({ id: 1, selected: true }),
      createMockCartItem({ id: 2, selected: true }),
    ]);
    render(<CartStoreSection {...defaultProps} store={store} />);
    
    const checkboxes = screen.getAllByRole("checkbox");
    // Store checkbox should be checked
    expect(checkboxes[0]).toHaveAttribute("data-state", "checked");
  });

  it("shows store checkbox as unchecked when no items are selected", () => {
    const store = createMockStore([
      createMockCartItem({ id: 1, selected: false }),
      createMockCartItem({ id: 2, selected: false }),
    ]);
    render(<CartStoreSection {...defaultProps} store={store} />);
    
    const checkboxes = screen.getAllByRole("checkbox");
    // Store checkbox should be unchecked
    expect(checkboxes[0]).toHaveAttribute("data-state", "unchecked");
  });

  it("calls onItemSelect when item checkbox is clicked", async () => {
    const user = userEvent.setup();
    const handleItemSelect = vi.fn();
    const store = createMockStore([createMockCartItem({ id: 123, selected: false })]);
    
    render(
      <CartStoreSection {...defaultProps} store={store} onItemSelect={handleItemSelect} />
    );
    
    // Find the item checkbox (second checkbox, after store checkbox)
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    
    expect(handleItemSelect).toHaveBeenCalledWith(123, true);
  });

  it("calls onItemQuantityChange when quantity is changed", async () => {
    const user = userEvent.setup();
    const handleQuantityChange = vi.fn();
    const store = createMockStore([createMockCartItem({ id: 456, count: 2 })]);
    
    render(
      <CartStoreSection
        {...defaultProps}
        store={store}
        onItemQuantityChange={handleQuantityChange}
      />
    );
    
    // Click the increment button
    const plusButton = screen.getByRole("button", { name: "增加数量" });
    await user.click(plusButton);
    
    expect(handleQuantityChange).toHaveBeenCalledWith(456, 3);
  });

  it("disables interactions when disabled prop is true", () => {
    const store = createMockStore([createMockCartItem()]);
    render(<CartStoreSection {...defaultProps} store={store} disabled={true} />);
    
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute("data-disabled");
    });
  });
});

