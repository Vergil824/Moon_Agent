"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, ShoppingCart, User } from "lucide-react";
import { useNavigationStore, NavTab } from "@/lib/core/store";

/**
 * BottomNav - Bottom navigation bar with three functional buttons
 * Story 1.4: AC 3 - Bottom navigation bar (BottomNav)
 *
 * Requirements per Figma design (node-id=152:54):
 * - Fixed at bottom with rounded top corners (rounded-tl-[15px] rounded-tr-[15px])
 * - Background: pure white with top shadow and border
 * - Three icon-only buttons: Message, Shopping Cart, Profile
 * - Active item: rounded container with bg-[#faf5ff], purple icon
 * - Safe area padding for mobile devices
 */

type NavItem = {
  id: NavTab;
  href: string;
  icon: typeof MessageCircle;
};

const navItems: NavItem[] = [
  { id: "home", href: "/chat", icon: MessageCircle },
  { id: "discover", href: "/cart", icon: ShoppingCart },
  { id: "profile", href: "/profile", icon: User }
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useNavigationStore();
  const pathname = usePathname();

  // Sync active tab with current route to avoid stale highlight
  useEffect(() => {
    if (!pathname) return;
    const match = navItems.find((item) => pathname.startsWith(item.href));
    if (match && match.id !== activeTab) {
      setActiveTab(match.id);
    }
  }, [pathname, activeTab, setActiveTab]);

  return (
    <nav
      role="navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e7eb] rounded-tl-[15px] rounded-tr-[15px] shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-14 items-center justify-between px-6 pt-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className="flex items-center justify-center w-16"
            >
              <div
                className={`flex items-center justify-center size-9 rounded-[14px] transition-colors ${
                  isActive ? "bg-[#faf5ff]" : ""
                }`}
              >
                <Icon
                  className={`size-6 ${
                    isActive ? "text-moon-purple" : "text-moon-text-muted"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "#8b5cf6" : "none"}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

