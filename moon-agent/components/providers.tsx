"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import React, { useEffect } from "react";
import { Toaster, toast } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance
  // Using useState ensures it's only created once on initial render, preventing cache loss on re-renders
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false // Config: don't auto-refetch on window focus to reduce requests
          }
        }
      })
  );

  return (
    <SessionProvider
      // Refresh session periodically to keep accessToken valid (avoid 401 on idle)
      refetchInterval={600} // seconds (10 minutes)
      refetchOnWindowFocus
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <SessionErrorWatcher />
        <Toaster position="top-center" offset={32} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

// Watcher to handle refresh-token failure and sign out user gracefully
function SessionErrorWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (
      session?.error === "RefreshAccessTokenError" ||
      session?.error === "RefreshTokenError"
    ) {
      toast.error("登录已过期，请重新登录");
      // Sign out and redirect to login
      signOut({ callbackUrl: "/login" });
    }
  }, [session?.error]);

  return null;
}

