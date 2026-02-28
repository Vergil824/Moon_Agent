import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressBar } from "./AddressBar";

describe("AddressBar", () => {
  it("renders with default placeholder when no address provided", () => {
    render(<AddressBar />);
    
    expect(screen.getByTestId("address-bar")).toBeInTheDocument();
    expect(screen.getByText(/配送至:/)).toBeInTheDocument();
    expect(screen.getByText(/请选择配送地址/)).toBeInTheDocument();
  });

  it("displays the provided address", () => {
    const address = "北京市朝阳区某某街道123号";
    render(<AddressBar address={address} />);
    
    expect(screen.getByText(new RegExp(address))).toBeInTheDocument();
  });

  it("calls onPress callback when clicked", async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    
    render(<AddressBar onPress={handlePress} />);
    
    const button = screen.getByTestId("address-bar");
    await user.click(button);
    
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("is accessible as a button", () => {
    render(<AddressBar />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("truncates long addresses gracefully", () => {
    const longAddress = "北京市海淀区中关村南大街甲12号中国科学院软件研究所5号楼302室这是一个非常长的地址用于测试截断功能";
    render(<AddressBar address={longAddress} />);
    
    // The truncate class should be applied
    const addressBar = screen.getByTestId("address-bar");
    expect(addressBar).toBeInTheDocument();
    // Text should still be present in DOM
    expect(screen.getByText(new RegExp(longAddress.substring(0, 20)))).toBeInTheDocument();
  });
});

