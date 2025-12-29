"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";

// Stagger animation for buttons
const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const buttonVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const textVariants: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: 0.5
    }
  }
};

export default function WelcomePage() {
  const router = useRouter();

  const handleWechatLogin = () => {
    // WeChat login not implemented yet
    toast.info("微信登录功能暂未开放");
  };

  const handlePhoneLogin = () => {
    router.push("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] h-screen w-full overflow-hidden"
      style={{
        // Gradient matching background image edges (dark blue/purple tones)
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)"
      }}
    >
      {/* Background Image - cover to fill screen, gradient shows on very wide screens */}
      <motion.div
        initial={{ scale: 1.02, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/assets/statics/Screenshot 2025-12-25 at 21.54.23.png"
          alt="Welcome background"
          fill
          className="object-cover object-top pointer-events-none"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-[72px] px-6">
        {/* Button Container with stagger animation */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-[345px] flex flex-col gap-4"
        >
          {/* WeChat Login Button */}
          <motion.button
            variants={buttonVariants}
            onClick={handleWechatLogin}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 bg-[#07c160] rounded-full shadow-lg flex items-center justify-center gap-2 text-white text-lg font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            <span>微信一键登录</span>
          </motion.button>

          {/* Phone Login Button */}
          <motion.button
            variants={buttonVariants}
            onClick={handlePhoneLogin}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 bg-white/10 border border-white/30 rounded-full flex items-center justify-center gap-2 text-white text-lg font-medium"
          >
            <Phone className="w-4 h-4" />
            <span>手机号码登录</span>
          </motion.button>

          {/* Privacy Policy with fade-in */}
          <motion.p
            variants={textVariants}
            className="text-center text-xs text-white/50 mt-2"
          >
            登录即代表同意
            <span className="underline cursor-pointer mx-1">用户协议</span>
            和
            <span className="underline cursor-pointer mx-1">隐私政策</span>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
