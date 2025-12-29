"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendSmsCode, logoutApi, type ApiResponse } from "@/lib/core/api";

// Re-export useSession for convenience
export { useSession };

// Password Login mutation using NextAuth signIn
export function usePasswordLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      mobile,
      password
    }: {
      mobile: string;
      password: string;
    }) => {
      const result = await signIn("password", {
        mobile,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error === "CredentialsSignin" 
          ? "手机号或密码错误" 
          : result.error);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("登录成功");
      router.push("/chat");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "登录失败，请稍后重试");
    }
  });
}

// SMS Code mutation
export function useSendSmsCode() {
  return useMutation({
    mutationFn: async ({
      mobile,
      scene = 1
    }: {
      mobile: string;
      scene?: number;
    }) => {
      const response = await sendSmsCode(mobile, scene);
      return response;
    },
    onSuccess: (data: ApiResponse<boolean>) => {
      if (data.code === 0) {
        toast.success("验证码已发送");
      } else {
        toast.error(data.msg || "发送失败");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "发送失败，请稍后重试");
    }
  });
}

// SMS Login mutation using NextAuth signIn
export function useSmsLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ mobile, code }: { mobile: string; code: string }) => {
      const result = await signIn("sms", {
        mobile,
        code,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error === "CredentialsSignin" 
          ? "验证码错误或已过期" 
          : result.error);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("登录成功");
      router.push("/chat");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "登录失败，请稍后重试");
    }
  });
}

// Logout mutation
export function useLogout() {
  const { data: session } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Call backend logout API to invalidate tokens
      if (session?.accessToken) {
        try {
          await logoutApi(session.accessToken);
        } catch {
          // Ignore backend errors, still proceed with local logout
        }
      }
      
      // Sign out from NextAuth
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      toast.success("已退出登录");
      router.push("/welcome");
      router.refresh();
    },
    onError: () => {
      // Still clear local session even if API fails
      signOut({ redirect: false });
      router.push("/welcome");
    }
  });
}

// Hook to get current authentication status
export function useAuthStatus() {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: !!session,
    isLoading: status === "loading",
    user: session?.user,
    accessToken: session?.accessToken,
    error: session?.error
  };
}
