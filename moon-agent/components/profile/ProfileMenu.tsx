"use client";

import Link from "next/link";
import {
  ShoppingBag,
  RotateCcw,
  MapPin,
  Info,
  Settings,
  ChevronRight,
} from "lucide-react";

/**
 * ProfileMenu - Navigation menu items for profile page
 * Story 5.5: AC 1 - Menu items navigation
 * Matches Figma design node 152:78 - grouped menu cards with purple icons
 */

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: typeof ShoppingBag;
  disabled?: boolean; // Some items are temporarily disabled
}

// First group: Orders, After-sale, Addresses
const primaryMenuItems: MenuItem[] = [
  {
    id: "orders",
    label: "我的订单",
    href: "/profile/orders",
    icon: ShoppingBag,
  },
  {
    id: "aftersale",
    label: "我的售后",
    href: "/profile/aftersale",
    icon: RotateCcw,
    disabled: true, // Temporarily disabled
  },
  {
    id: "addresses",
    label: "收货地址",
    href: "/profile/addresses",
    icon: MapPin,
  },
];

// Second group: About, Settings
const secondaryMenuItems: MenuItem[] = [
  {
    id: "about",
    label: "关于我们",
    href: "/profile/about",
    icon: Info,
    disabled: true, // Temporarily disabled
  },
  {
    id: "settings",
    label: "设置",
    href: "/profile/settings",
    icon: Settings,
  },
];

function MenuItemRow({ item, isLast }: { item: MenuItem; isLast: boolean }) {
  const Icon = item.icon;
  
  // If disabled, render a non-clickable div instead of Link
  if (item.disabled) {
    return (
      <>
        <div
          className="flex items-center justify-between py-4 px-4 cursor-not-allowed opacity-50"
        >
          <div className="flex items-center gap-3">
            <Icon className="size-5 text-[#8b5cf6]" />
            <span className="text-base text-gray-800">{item.label}</span>
          </div>
          <ChevronRight className="size-5 text-gray-300" />
        </div>
        {!isLast && <div className="h-px bg-gray-100 mx-4" />}
      </>
    );
  }

  return (
    <>
      <Link
        href={item.href}
        className="flex items-center justify-between py-4 px-4 hover:bg-gray-50/50 transition-colors active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <Icon className="size-5 text-[#8b5cf6]" />
          <span className="text-base text-gray-800">{item.label}</span>
        </div>
        <ChevronRight className="size-5 text-gray-300" />
      </Link>
      {!isLast && <div className="h-px bg-gray-100 mx-4" />}
    </>
  );
}

export default function ProfileMenu() {
  return (
    <div className="px-4 space-y-4">
      {/* Primary menu group */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {primaryMenuItems.map((item, index) => (
          <MenuItemRow
            key={item.id}
            item={item}
            isLast={index === primaryMenuItems.length - 1}
          />
        ))}
      </div>

      {/* Secondary menu group */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {secondaryMenuItems.map((item, index) => (
          <MenuItemRow
            key={item.id}
            item={item}
            isLast={index === secondaryMenuItems.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

