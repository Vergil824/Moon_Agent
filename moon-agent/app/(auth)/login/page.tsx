"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { loginFormSchema, LoginFormData } from "@/lib/auth/authSchemas";
import { usePasswordLogin } from "@/lib/auth/useAuth";

type FormErrors = {
  mobile?: string;
  password?: string;
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

export default function LoginPage() {
  const router = useRouter();
  const passwordLoginMutation = usePasswordLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    mobile: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = loginFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // NextAuth handles redirect via the hook's onSuccess callback
    passwordLoginMutation.mutate({
      mobile: formData.mobile,
      password: formData.password
    });
  };

  const handleClose = () => {
    // Navigate back to welcome page
    router.push("/welcome");
  };

  const handleNavigateToRegister = () => {
    router.push("/register");
  };

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
        alt="Login background"
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
          className="bg-white rounded-[14px] shadow-xl"
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

            {/* Title */}
            <h1 className="text-2xl font-semibold text-center text-[#8b5cf6]">
              欢迎回来
            </h1>
            <p className="text-base text-center text-gray-500 mt-2">
              使用手机号码登录您的账户
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
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all"
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

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] transition-all"
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={passwordLoginMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 bg-[#8b5cf6] text-white text-lg font-medium rounded-full transition-colors hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoginMutation.isPending ? "登录中..." : "登录"}
            </motion.button>
          </form>

          {/* Card Footer */}
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm text-gray-500">还没有账号?</span>
              <motion.button
                onClick={handleNavigateToRegister}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-base font-medium text-[#ec4899] hover:underline"
              >
                立即注册
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
