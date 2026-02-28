/**
 * Order API Tests
 * Story 4.4: Task 2 - Settlement API tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatPrice,
  getSettlementSkuDisplay,
  calculateTotalCount,
  type SettlementItem,
  type SettlementSkuProperty,
} from "@/lib/order/orderApi";

describe("orderApi", () => {
  describe("formatPrice", () => {
    it("formats cents to yuan string", () => {
      expect(formatPrice(16800)).toBe("168.00");
      expect(formatPrice(100)).toBe("1.00");
      expect(formatPrice(99)).toBe("0.99");
      expect(formatPrice(0)).toBe("0.00");
    });

    it("handles decimal cents correctly", () => {
      expect(formatPrice(12345)).toBe("123.45");
      expect(formatPrice(1)).toBe("0.01");
    });
  });

  describe("getSettlementSkuDisplay", () => {
    it("returns empty string for empty properties", () => {
      expect(getSettlementSkuDisplay([])).toBe("");
    });

    it("returns empty string for undefined properties", () => {
      expect(getSettlementSkuDisplay(undefined as unknown as SettlementSkuProperty[])).toBe("");
    });

    it("formats single property correctly", () => {
      const properties: SettlementSkuProperty[] = [
        { propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "云朵白" },
      ];
      expect(getSettlementSkuDisplay(properties)).toBe("云朵白");
    });

    it("formats multiple properties with semicolon separator", () => {
      const properties: SettlementSkuProperty[] = [
        { propertyId: 1, propertyName: "颜色", valueId: 1, valueName: "云朵白" },
        { propertyId: 2, propertyName: "尺码", valueId: 2, valueName: "M" },
      ];
      expect(getSettlementSkuDisplay(properties)).toBe("云朵白; M");
    });
  });

  describe("calculateTotalCount", () => {
    it("returns 0 for empty items", () => {
      expect(calculateTotalCount([])).toBe(0);
    });

    it("calculates total count correctly", () => {
      const items: SettlementItem[] = [
        {
          spuId: 1,
          spuName: "Test Product 1",
          skuId: 1,
          count: 2,
          cartId: 1,
          categoryId: 1,
          price: 10000,
          picUrl: "http://example.com/pic1.jpg",
          stock: 100,
          properties: [],
        },
        {
          spuId: 2,
          spuName: "Test Product 2",
          skuId: 2,
          count: 3,
          cartId: 2,
          categoryId: 1,
          price: 20000,
          picUrl: "http://example.com/pic2.jpg",
          stock: 50,
          properties: [],
        },
      ];
      expect(calculateTotalCount(items)).toBe(5);
    });

    it("calculates single item count", () => {
      const items: SettlementItem[] = [
        {
          spuId: 1,
          spuName: "Test Product",
          skuId: 1,
          count: 1,
          cartId: 1,
          categoryId: 1,
          price: 10000,
          picUrl: "http://example.com/pic.jpg",
          stock: 100,
          properties: [],
        },
      ];
      expect(calculateTotalCount(items)).toBe(1);
    });
  });
});

