/**
 * PaymentMethodSelector Component Tests
 * Story 4.4: Task 4 - Payment method selection tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentMethodSelector, type PaymentMethod } from "./PaymentMethodSelector";

describe("PaymentMethodSelector", () => {
  it("renders with correct test id", () => {
    render(<PaymentMethodSelector value="wechat" onChange={() => {}} />);

    expect(screen.getByTestId("payment-method-selector")).toBeInTheDocument();
  });

  it("displays section title", () => {
    render(<PaymentMethodSelector value="wechat" onChange={() => {}} />);

    expect(screen.getByText("支付方式")).toBeInTheDocument();
  });

  it("renders WeChat Pay option", () => {
    render(<PaymentMethodSelector value="wechat" onChange={() => {}} />);

    expect(screen.getByTestId("payment-option-wechat")).toBeInTheDocument();
    expect(screen.getByText("微信支付")).toBeInTheDocument();
  });

  it("renders Alipay option", () => {
    render(<PaymentMethodSelector value="alipay" onChange={() => {}} />);

    expect(screen.getByTestId("payment-option-alipay")).toBeInTheDocument();
    expect(screen.getByText("支付宝")).toBeInTheDocument();
  });

  it("highlights WeChat Pay when selected", () => {
    render(<PaymentMethodSelector value="wechat" onChange={() => {}} />);

    const wechatBtn = screen.getByTestId("payment-option-wechat");
    expect(wechatBtn).toHaveClass("bg-[#E8F8EB]"); // Light green bg
    expect(wechatBtn).toHaveClass("border-[#07C160]"); // Green border
  });

  it("highlights Alipay when selected", () => {
    render(<PaymentMethodSelector value="alipay" onChange={() => {}} />);

    const alipayBtn = screen.getByTestId("payment-option-alipay");
    expect(alipayBtn).toHaveClass("bg-[#E8F4FD]"); // Light blue bg
    expect(alipayBtn).toHaveClass("border-[#1677FF]"); // Blue border
  });

  it("shows unselected style for non-selected option", () => {
    render(<PaymentMethodSelector value="wechat" onChange={() => {}} />);

    const alipayBtn = screen.getByTestId("payment-option-alipay");
    expect(alipayBtn).toHaveClass("bg-gray-50");
    expect(alipayBtn).toHaveClass("border-transparent");
  });

  it("calls onChange with wechat when WeChat Pay is clicked", () => {
    const onChange = vi.fn();
    render(<PaymentMethodSelector value="alipay" onChange={onChange} />);

    fireEvent.click(screen.getByTestId("payment-option-wechat"));
    expect(onChange).toHaveBeenCalledWith("wechat");
  });

  it("calls onChange with alipay when Alipay is clicked", () => {
    const onChange = vi.fn();
    render(<PaymentMethodSelector value="wechat" onChange={onChange} />);

    fireEvent.click(screen.getByTestId("payment-option-alipay"));
    expect(onChange).toHaveBeenCalledWith("alipay");
  });

  it("does not prevent re-selecting current method", () => {
    const onChange = vi.fn();
    render(<PaymentMethodSelector value="wechat" onChange={onChange} />);

    fireEvent.click(screen.getByTestId("payment-option-wechat"));
    expect(onChange).toHaveBeenCalledWith("wechat");
  });
});

