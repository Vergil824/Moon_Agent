import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - 满月 Moon",
  description: "登录或注册满月账号"
};

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Auth pages don't need the standard header and bottom nav
  return <>{children}</>;
}

