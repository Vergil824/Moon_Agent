/**
 * CheckoutSkeleton Component Tests
 * Story 4.4: Task 2.3 - Loading skeleton tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutSkeleton } from "./CheckoutSkeleton";

describe("CheckoutSkeleton", () => {
  it("renders skeleton with correct test id", () => {
    render(<CheckoutSkeleton />);

    expect(screen.getByTestId("checkout-skeleton")).toBeInTheDocument();
  });

  it("renders multiple animated skeleton blocks", () => {
    const { container } = render(<CheckoutSkeleton />);

    // Should have multiple skeleton blocks with animation
    const skeletonBlocks = container.querySelectorAll(".animate-pulse");
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it("renders address card skeleton section", () => {
    const { container } = render(<CheckoutSkeleton />);

    // Address card should have rounded-2xl container
    const roundedContainers = container.querySelectorAll(".rounded-2xl");
    expect(roundedContainers.length).toBeGreaterThan(0);
  });

  it("renders product list skeleton items", () => {
    const { container } = render(<CheckoutSkeleton />);

    // Should have product image placeholders (20x20 squares)
    const imagePlaceholders = container.querySelectorAll(".w-20.h-20");
    expect(imagePlaceholders.length).toBe(2); // 2 product items
  });
});

