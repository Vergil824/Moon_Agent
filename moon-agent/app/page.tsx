"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function HomeRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait for session to be determined
    if (status === "loading") return;
    
    // Redirect based on auth status: unauthenticated -> welcome, authenticated -> chat
    if (session) {
      router.replace("/chat");
    } else {
      router.replace("/welcome");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fff5f7] to-[#faf5ff]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-10 text-[#8B5CF6] animate-spin" />
        <p className="text-[#8B5CF6] font-medium animate-pulse">正在跳转中...</p>
      </div>
    </div>
  );
}
