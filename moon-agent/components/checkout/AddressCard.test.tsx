/**
 * AddressCard Component Tests
 * Story 4.4: Task 3.1 - Address card tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddressCard } from "./AddressCard";
import { type SettlementAddress } from "@/lib/order/orderApi";

const mockAddress: SettlementAddress = {
  id: 1,
  name: "张三",
  mobile: "13800138000",
  areaId: 440305,
  areaName: "广东省深圳市南山区",
  detailAddress: "科技园南区A栋1001室",
  defaultStatus: true,
};

describe("AddressCard", () => {
  it("renders with correct test id", () => {
    render(<AddressCard address={mockAddress} onPress={() => {}} />);

    expect(screen.getByTestId("address-card")).toBeInTheDocument();
  });

  it("displays address name", () => {
    render(<AddressCard address={mockAddress} onPress={() => {}} />);

    expect(screen.getByTestId("address-name")).toHaveTextContent("张三");
  });

  it("displays masked phone number", () => {
    render(<AddressCard address={mockAddress} onPress={() => {}} />);

    expect(screen.getByTestId("address-phone")).toHaveTextContent("138****8000");
  });

  it("displays full address detail", () => {
    render(<AddressCard address={mockAddress} onPress={() => {}} />);

    expect(screen.getByTestId("address-detail")).toHaveTextContent(
      "广东省深圳市南山区 科技园南区A栋1001室"
    );
  });

  it("calls onPress when clicked", () => {
    const onPress = vi.fn();
    render(<AddressCard address={mockAddress} onPress={onPress} />);

    fireEvent.click(screen.getByTestId("address-card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows add address prompt when no address provided", () => {
    render(<AddressCard address={null} onPress={() => {}} />);

    expect(screen.getByText("添加收货地址")).toBeInTheDocument();
  });

  it("shows add address prompt when address is undefined", () => {
    render(<AddressCard address={undefined} onPress={() => {}} />);

    expect(screen.getByText("添加收货地址")).toBeInTheDocument();
  });
});

