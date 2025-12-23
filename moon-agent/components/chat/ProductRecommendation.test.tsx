import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, afterEach, vi } from "vitest";
import { ProductRecommendation } from "./ProductRecommendation";

const baseProduct = {
  product_name: "连翘杯",
  price: 35,
  matching: 5,
  image_url: "https://example.com/img.png",
  description: "圆盘型底盘大，宽底围分散重量，全包围防止外扩",
  style: "欧美",
  features: ["宽底围设计", "全包围侧翼"],
  size: "75C"
};

describe("ProductRecommendation", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders overlay with size and add-to-cart button", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <ProductRecommendation payload={{ products: [baseProduct] }} onSelect={vi.fn()} />
      );
    });

    await act(async () => {
      await user.click(screen.getByText("商品推荐"));
    });

    expect(await screen.findByText(/为您精选了 1 款/)).toBeInTheDocument();
    expect(screen.getByText(/尺码 75C/)).toBeInTheDocument();
    const addButton = screen.getByRole("button", { name: "加入购物车" });
    expect(addButton).toBeInTheDocument();

    await act(async () => {
      await user.click(addButton);
    });

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveTextContent("已加入购物车");
  });

  it("shows detail placeholder when viewing a product", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <ProductRecommendation payload={{ products: [baseProduct] }} onSelect={vi.fn()} />
      );
    });

    await act(async () => {
      await user.click(screen.getByText("商品推荐"));
    });

    const productTitle = await screen.findByText("连翘杯");

    await act(async () => {
      await user.click(productTitle);
    });

    expect(await screen.findByText(/返回推荐列表/)).toBeInTheDocument();
    expect(screen.getByText("连翘杯")).toBeInTheDocument();
    expect(screen.getByText(/尺码 75C/)).toBeInTheDocument();
  });
});

