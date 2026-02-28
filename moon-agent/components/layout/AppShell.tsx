"use client";

import { usePathname } from "next/navigation";
import { ChatHeader, BottomNav } from "@/components/layout";

type Props = {
  children: React.ReactNode;
};

const AUTH_PATHS = ["/", "/welcome", "/login", "/register"];
const PAGES_WITHOUT_SHELL = ["/profile/addresses", "/checkout"]; // Full-page layouts with own header/nav
const PAGES_WITH_CHAT_HEADER = ["/chat"];
const PAGES_WITH_BOTTOM_NAV = ["/chat", "/cart", "/profile"];

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => 
    p === "/" ? pathname === "/" : pathname?.startsWith(p)
  );
  const hideShell = PAGES_WITHOUT_SHELL.some((p) =>
    pathname?.startsWith(p)
  );
  const showChatHeader = PAGES_WITH_CHAT_HEADER.some((p) =>
    pathname?.startsWith(p)
  );
  const showBottomNav = PAGES_WITH_BOTTOM_NAV.some((p) =>
    pathname?.startsWith(p)
  );

  // Pages with their own full-page layout (address pages have own header/nav)
  if (isAuthPage || hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showChatHeader && <ChatHeader />}
      <main className={`flex-1 ${showBottomNav ? "pb-20" : ""}`}>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

