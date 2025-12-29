"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { phoneSchema, smsCodeSchema } from "@/lib/auth/authSchemas";
import { useSendSmsCode, useSmsLogin } from "@/lib/auth/useAuth";

type FormErrors = {
  mobile?: string;
  code?: string;
};

// Animation variants
const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const cardVariants: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut", delay: 0.1 }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const sendSmsCodeMutation = useSendSmsCode();
  const smsLoginMutation = useSmsLogin();

  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [countdown, setCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Validate phone number format
  const isPhoneValid = useCallback(() => {
    const result = phoneSchema.safeParse(mobile);
    return result.success;
  }, [mobile]);

  const handleMobileChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "");
    setMobile(digits);
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "");
    setCode(digits);
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }));
    }
  };

  const handleSendSmsCode = () => {
    if (!isPhoneValid()) {
      setErrors({ mobile: "请输入有效的11位手机号码" });
      return;
    }

    sendSmsCodeMutation.mutate(
      { mobile, scene: 1 }, // scene 1 = login/register
      {
        onSuccess: (data) => {
          if (data.code === 0) {
            setCountdown(60);
          }
        }
      }
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const phoneResult = phoneSchema.safeParse(mobile);
    if (!phoneResult.success) {
      newErrors.mobile = phoneResult.error.issues[0]?.message;
    }

    const codeResult = smsCodeSchema.safeParse(code);
    if (!codeResult.success) {
      newErrors.code = codeResult.error.issues[0]?.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // NextAuth handles redirect via the hook's onSuccess callback
    smsLoginMutation.mutate({ mobile, code });
  };

  const handleClose = () => {
    // Navigate back to welcome page
    router.push("/welcome");
  };

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const canSendSms = isPhoneValid() && countdown === 0 && !sendSmsCodeMutation.isPending;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[100] h-screen w-full overflow-hidden"
      style={{
        // Gradient matching background image edges (dark blue/purple tones)
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)"
      }}
    >
      {/* Background Image - cover to fill screen, gradient shows on very wide screens */}
      <Image
        src="/assets/statics/Screenshot 2025-12-25 at 21.54.23.png"
        alt="Register background"
        fill
        className="object-cover object-top pointer-events-none"
        priority
        sizes="100vw"
      />

      {/* Blur Overlay with fade animation */}
      <motion.div
        variants={backdropVariants}
        className="absolute inset-0 backdrop-blur-[5px] bg-black/20"
      />

      {/* Card with slide-up animation */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-[361px] mx-auto">
        <motion.div
          variants={cardVariants}
          className="bg-white/95 rounded-[14px] shadow-2xl"
        >
          {/* Card Header */}
          <div className="relative px-6 pt-6 pb-2">
            {/* Close Button */}
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>

            {/* Title - Pink theme */}
            <h1 className="text-2xl font-semibold text-center text-[#ec4899]">
              创建新账号
            </h1>
            <p className="text-base text-center text-gray-500 mt-2">
              填写以下信息完成注册
            </p>
          </div>

          {/* Card Content - Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                手机号码
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="请输入11位手机号"
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30 focus:border-[#ec4899] transition-all"
                maxLength={11}
              />
              {errors.mobile && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {errors.mobile}
                </motion.p>
              )}
            </div>

            {/* SMS Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4位验证码"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="flex-1 h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30 focus:border-[#ec4899] transition-all"
                  maxLength={6}
                />
                <motion.button
                  type="button"
                  onClick={handleSendSmsCode}
                  disabled={!canSendSms}
                  whileHover={canSendSms ? { scale: 1.02 } : {}}
                  whileTap={canSendSms ? { scale: 0.98 } : {}}
                  className="h-9 px-4 border border-[#ec4899] text-[#ec4899] text-sm font-medium rounded-lg transition-all hover:bg-[#ec4899]/5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </motion.button>
              </div>
              {errors.code && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {errors.code}
                </motion.p>
              )}
            </div>

            {/* Register Button - Pink theme */}
            <motion.button
              type="submit"
              disabled={smsLoginMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 bg-[#ec4899] text-white text-lg font-medium rounded-full transition-colors hover:bg-[#db2777] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {smsLoginMutation.isPending ? "注册中..." : "注册并登录"}
            </motion.button>
          </form>

          {/* Card Footer */}
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm text-gray-500">已有账号?</span>
              <motion.button
                onClick={handleNavigateToLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-base font-medium text-[#8b5cf6] hover:underline"
              >
                去登录
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
