import { describe, it, expect } from "vitest";
import {
  calculateSelectedTotal,
  countSelectedItems,
  areAllItemsSelected,
  groupCartItemsByStore,
  getSkuPropertiesDisplay,
  getProductImageUrl,
  type CartItem,
  type SkuProperty,
} from "./cartApi";

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
      price: 16000, // 160 yuan in cents
      stock: 100,
      properties: [],
    },
    ...overrides,
  };
}

describe("cartApi utility functions", () => {
  describe("calculateSelectedTotal", () => {
    it("returns 0 for empty array", () => {
      expect(calculateSelectedTotal([])).toBe(0);
    });

    it("returns 0 when no items are selected", () => {
      const items = [
        createMockCartItem({ id: 1, selected: false }),
        createMockCartItem({ id: 2, selected: false }),
      ];
      expect(calculateSelectedTotal(items)).toBe(0);
    });

    it("calculates total for selected items", () => {
      const items = [
        createMockCartItem({
          id: 1,
          selected: true,
          count: 2,
          sku: { id: 1, spuId: 1, picUrl: null, price: 10000, stock: 10, properties: [] },
        }),
        createMockCartItem({
          id: 2,
          selected: false,
          count: 1,
          sku: { id: 2, spuId: 2, picUrl: null, price: 20000, stock: 10, properties: [] },
        }),
        createMockCartItem({
          id: 3,
          selected: true,
          count: 1,
          sku: { id: 3, spuId: 3, picUrl: null, price: 15000, stock: 10, properties: [] },
        }),
      ];
      // 2 * 10000 + 1 * 15000 = 35000
      expect(calculateSelectedTotal(items)).toBe(35000);
    });
  });

  describe("countSelectedItems", () => {
    it("returns 0 for empty array", () => {
      expect(countSelectedItems([])).toBe(0);
    });

    it("returns 0 when no items are selected", () => {
      const items = [
        createMockCartItem({ selected: false, count: 3 }),
        createMockCartItem({ selected: false, count: 2 }),
      ];
      expect(countSelectedItems(items)).toBe(0);
    });

    it("counts total quantity of selected items", () => {
      const items = [
        createMockCartItem({ id: 1, selected: true, count: 3 }),
        createMockCartItem({ id: 2, selected: false, count: 2 }),
        createMockCartItem({ id: 3, selected: true, count: 1 }),
      ];
      expect(countSelectedItems(items)).toBe(4); // 3 + 1
    });
  });

  describe("areAllItemsSelected", () => {
    it("returns false for empty array", () => {
      expect(areAllItemsSelected([])).toBe(false);
    });

    it("returns true when all items are selected", () => {
      const items = [
        createMockCartItem({ selected: true }),
        createMockCartItem({ selected: true }),
      ];
      expect(areAllItemsSelected(items)).toBe(true);
    });

    it("returns false when some items are not selected", () => {
      const items = [
        createMockCartItem({ selected: true }),
        createMockCartItem({ selected: false }),
      ];
      expect(areAllItemsSelected(items)).toBe(false);
    });

    it("returns false when no items are selected", () => {
      const items = [
        createMockCartItem({ selected: false }),
        createMockCartItem({ selected: false }),
      ];
      expect(areAllItemsSelected(items)).toBe(false);
    });
  });

  describe("groupCartItemsByStore", () => {
    it("returns empty array for empty input", () => {
      expect(groupCartItemsByStore([])).toEqual([]);
    });

    it("groups items into default store", () => {
      const items = [
        createMockCartItem({ id: 1 }),
        createMockCartItem({ id: 2 }),
      ];
      const result = groupCartItemsByStore(items);

      expect(result).toHaveLength(1);
    expect(result[0].name).toBe("满月Moon优选");
      expect(result[0].items).toHaveLength(2);
    });
  });

  describe("getSkuPropertiesDisplay", () => {
    it("returns empty string for empty properties", () => {
      expect(getSkuPropertiesDisplay([])).toBe("");
    });

    it("returns empty string for undefined properties", () => {
      expect(getSkuPropertiesDisplay(undefined as unknown as SkuProperty[])).toBe("");
    });

    it("formats single property correctly", () => {
      const properties: SkuProperty[] = [
        { propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "云朵白" },
      ];
      expect(getSkuPropertiesDisplay(properties)).toBe("云朵白");
    });

    it("formats multiple properties with semicolon separator", () => {
      const properties: SkuProperty[] = [
        { propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "云朵白" },
        { propertyId: 2, propertyName: "尺码", valueId: 2, valueName: "M" },
      ];
      expect(getSkuPropertiesDisplay(properties)).toBe("云朵白; M");
    });
  });

  describe("getProductImageUrl", () => {
    it("returns SKU image when available", () => {
      const item = createMockCartItem({
        sku: {
          id: 1,
          spuId: 1,
          picUrl: "https://example.com/sku.jpg",
          price: 10000,
          stock: 10,
          properties: [],
        },
        spu: {
          id: 1,
          name: "Test",
          picUrl: "https://example.com/spu.jpg",
          categoryId: 1,
        },
      });
      expect(getProductImageUrl(item)).toBe("https://example.com/sku.jpg");
    });

    it("falls back to SPU image when SKU image is null", () => {
      const item = createMockCartItem({
        sku: {
          id: 1,
          spuId: 1,
          picUrl: null,
          price: 10000,
          stock: 10,
          properties: [],
        },
        spu: {
          id: 1,
          name: "Test",
          picUrl: "https://example.com/spu.jpg",
          categoryId: 1,
        },
      });
      expect(getProductImageUrl(item)).toBe("https://example.com/spu.jpg");
    });

    it("falls back to SPU image when SKU image is empty string", () => {
      const item = createMockCartItem({
        sku: {
          id: 1,
          spuId: 1,
          picUrl: "",
          price: 10000,
          stock: 10,
          properties: [],
        },
        spu: {
          id: 1,
          name: "Test",
          picUrl: "https://example.com/spu.jpg",
          categoryId: 1,
        },
      });
      expect(getProductImageUrl(item)).toBe("https://example.com/spu.jpg");
    });
  });
});

