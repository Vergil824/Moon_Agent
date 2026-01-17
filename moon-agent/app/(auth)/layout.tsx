import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "登录 - 满月 Moon",
  description: "登录或注册满月账号"
};

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Auth pages don't need the standard header and bottom nav.
  // Keep auth background stable across /welcome, /login, /register to avoid image reload on navigation.
  return (
    <div
      className="fixed inset-0 z-[100] h-screen w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)"
      }}
    >
      {/* Background Image - stable across auth routes */}
      <Image
        src="/assets/statics/Screenshot 2025-12-25 at 21.54.23.png"
        alt="Auth background"
        fill
        className="object-cover object-top pointer-events-none"
        priority
        sizes="100vw"
      />

      {/* Blur overlay - stable across auth routes */}
      <div className="absolute inset-0 backdrop-blur-[5px] bg-black/20" />

      {/* Route content */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

