"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // 1. 创建 QueryClient 实例
  // 使用 useState 确保只在首次渲染时创建一次实例，避免组件重渲染时丢失缓存
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false //配置：切回窗口时不自动刷新，减少请求
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


