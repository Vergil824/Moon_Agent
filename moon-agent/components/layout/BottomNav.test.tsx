import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BottomNav from "./BottomNav";
import { useNavigationStore } from "@/lib/core/store";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("BottomNav", () => {
  beforeEach(() => {
    // Reset navigation store before each test
    useNavigationStore.setState({ activeTab: "home" });
  });

  it("renders bottom navigation with three icon-only items", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    // Check for three nav items (icon-only, no text labels)
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("has fixed positioning at bottom", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("bottom-0");
  });

  it("has rounded top corners", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("rounded-tl-[15px]");
    expect(nav).toHaveClass("rounded-tr-[15px]");
  });

  it("has white background with top shadow and border", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("bg-white");
    expect(nav).toHaveClass("border-t");
    // Shadow is applied as arbitrary value
    expect(nav.className).toContain("shadow");
  });

  it("highlights active navigation item with correct background", () => {
    useNavigationStore.setState({ activeTab: "home" });
    render(<BottomNav />);

    // The active item's inner container should have the highlight background
    const links = screen.getAllByRole("link");
    const homeLink = links[0];
    // Check that the inner div has the active background class
    const innerContainer = homeLink.querySelector("div");
    expect(innerContainer).toHaveClass("bg-[#faf5ff]");
  });

  it("updates active tab when clicking navigation item", () => {
    render(<BottomNav />);

    // Click the second link (discover/shopping cart)
    const links = screen.getAllByRole("link");
    fireEvent.click(links[1]);

    expect(useNavigationStore.getState().activeTab).toBe("discover");
  });

  it("includes safe area padding for bottom", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation");
    // Check for safe area inset class
    expect(nav.className).toContain("pb-[env(safe-area-inset-bottom)]");
  });

  it("renders three navigation links with correct hrefs", () => {
    render(<BottomNav />);
    const links = screen.getAllByRole("link");
    
    expect(links[0]).toHaveAttribute("href", "/chat");
    expect(links[1]).toHaveAttribute("href", "/discover");
    expect(links[2]).toHaveAttribute("href", "/profile");
  });
});

