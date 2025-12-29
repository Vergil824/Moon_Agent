/**
 * OrderRemark Component Tests
 * Story 4.4: Task 3.3 - Order remark input tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrderRemark } from "./OrderRemark";

describe("OrderRemark", () => {
  it("renders with correct test id", () => {
    render(<OrderRemark value="" onChange={() => {}} />);

    expect(screen.getByTestId("order-remark")).toBeInTheDocument();
  });

  it("renders textarea input", () => {
    render(<OrderRemark value="" onChange={() => {}} />);

    expect(screen.getByTestId("order-remark-input")).toBeInTheDocument();
  });

  it("displays label text", () => {
    render(<OrderRemark value="" onChange={() => {}} />);

    expect(screen.getByText("订单备注")).toBeInTheDocument();
  });

  it("shows placeholder text when empty", () => {
    render(<OrderRemark value="" onChange={() => {}} />);

    const input = screen.getByTestId("order-remark-input");
    expect(input).toHaveAttribute("placeholder", "选填，可以备注您的特殊需求");
  });

  it("shows custom placeholder when provided", () => {
    render(
      <OrderRemark
        value=""
        onChange={() => {}}
        placeholder="请输入备注信息"
      />
    );

    const input = screen.getByTestId("order-remark-input");
    expect(input).toHaveAttribute("placeholder", "请输入备注信息");
  });

  it("displays current value", () => {
    render(<OrderRemark value="请尽快发货" onChange={() => {}} />);

    const input = screen.getByTestId("order-remark-input");
    expect(input).toHaveValue("请尽快发货");
  });

  it("calls onChange when input changes", () => {
    const onChange = vi.fn();
    render(<OrderRemark value="" onChange={onChange} />);

    const input = screen.getByTestId("order-remark-input");
    fireEvent.change(input, { target: { value: "新备注" } });

    expect(onChange).toHaveBeenCalledWith("新备注");
  });

  it("displays character count", () => {
    render(<OrderRemark value="测试" onChange={() => {}} maxLength={100} />);

    expect(screen.getByText("2/100")).toBeInTheDocument();
  });

  it("respects maxLength", () => {
    const onChange = vi.fn();
    render(<OrderRemark value="" onChange={onChange} maxLength={5} />);

    const input = screen.getByTestId("order-remark-input");
    fireEvent.change(input, { target: { value: "123456" } });

    // Should not call onChange with value exceeding maxLength
    expect(onChange).not.toHaveBeenCalled();
  });

  it("allows input within maxLength", () => {
    const onChange = vi.fn();
    render(<OrderRemark value="" onChange={onChange} maxLength={5} />);

    const input = screen.getByTestId("order-remark-input");
    fireEvent.change(input, { target: { value: "12345" } });

    expect(onChange).toHaveBeenCalledWith("12345");
  });
});

