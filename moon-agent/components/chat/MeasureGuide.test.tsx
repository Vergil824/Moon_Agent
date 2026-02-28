import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeasureGuide } from "@/components/chat/MeasureGuide";

describe("MeasureGuide", () => {
  it("renders in-chat card with data entry", () => {
    const onSelect = vi.fn();
    render(<MeasureGuide onSelect={onSelect} />);

    expect(screen.getByTestId("measure-guide-card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "观看测量演示" })).toBeInTheDocument();
    expect(screen.getByText("胸围差")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认数据" })).toBeInTheDocument();
  });

  it("opens the demo modal only after clicking watch button", () => {
    const onSelect = vi.fn();
    render(<MeasureGuide onSelect={onSelect} />);

    expect(screen.queryByTestId("measure-demo-backdrop")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "观看测量演示" }));
    expect(screen.getByTestId("measure-demo-backdrop")).toBeInTheDocument();
    expect(screen.getByText("测量演示")).toBeInTheDocument();
    expect(screen.getByText("下胸围测量")).toBeInTheDocument();
  });

  it("navigates demo modal steps", () => {
    const onSelect = vi.fn();
    render(<MeasureGuide onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "观看测量演示" }));
    expect(screen.getByText("下胸围测量")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一步" }));
    expect(screen.getByText("上胸围测量")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "上一步" }));
    expect(screen.getByText("下胸围测量")).toBeInTheDocument();
  });

  it("updates bust difference when sliders change", () => {
    const onSelect = vi.fn();
    render(<MeasureGuide onSelect={onSelect} />);

    expect(screen.getByTestId("bust-difference-value")).toHaveTextContent("15");

    fireEvent.change(screen.getByTestId("lower-bust-slider"), {
      target: { value: "70" }
    });
    fireEvent.change(screen.getByTestId("upper-bust-slider"), {
      target: { value: "95" }
    });

    expect(screen.getByTestId("bust-difference-value")).toHaveTextContent("25");
  });

  it("submits measurement data on confirm", () => {
    const onSelect = vi.fn();
    render(<MeasureGuide onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "确认数据" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(String(onSelect.mock.calls[0][0])).toContain("下胸围");
    expect(String(onSelect.mock.calls[0][0])).toContain("上胸围");
  });
});
