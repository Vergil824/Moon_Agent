/**
 * Payment Submit Page - Intermediate payment processing page
 * Migrated from moon-agent/app/pay/submit/page.tsx for Taro
 *
 * This page handles:
 * 1. Auto-detect device environment and select appropriate payment channel
 * 2. Submit payment order to backend
 * 3. For wx_lite: call Taro.requestPayment with payment params
 * 4. For other channels: redirect to payment URL or display QR code
 *
 * Query params:
 * - payOrderId: Payment order ID (required)
 * - orderId: Trade order ID (for reference)
 * - method: Payment method - "alipay" | "wechat" (required)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { Loading, Button } from "@nutui/nutui-react-taro";
import { Failure, Replay, WarningOutlined } from "@taroify/icons";
import {
  submitPayOrder,
  getPaymentChannelCode,
  parseWxLitePaymentParams,
  type PaymentMethod,
  type SubmitPayOrderRequest,
} from "@core/payment";

type PaymentStatus = "loading" | "processing" | "redirecting" | "error";

export default function PaySubmitPage() {
  const router = useRouter();

  // Parse query parameters
  const payOrderId = router.params?.payOrderId;
  const orderId = router.params?.orderId;
  const method = router.params?.method as PaymentMethod | undefined;

  // State
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Determine payment channel based on environment
  const channelCode = useMemo(() => {
    if (!method) return null;
    return getPaymentChannelCode(method);
  }, [method]);

  // Get channel display name
  const channelDisplayName = useMemo(() => {
    if (!channelCode) return "";
    const names: Record<string, string> = {
      alipay_wap: "支付宝",
      alipay_pc: "支付宝",
      wx_pub: "微信支付",
      wx_wap: "微信支付",
      wx_native: "微信扫码支付",
      wx_lite: "微信支付",
    };
    return names[channelCode] || "支付";
  }, [channelCode]);

  // Handle WeChat Mini Program payment
  const handleWxLitePayment = useCallback(
    async (displayContent: string) => {
      const payParams = parseWxLitePaymentParams(displayContent);

      if (!payParams) {
        setErrorMessage("支付参数解析失败");
        setStatus("error");
        return;
      }

      try {
        setStatus("processing");

        // Call Taro.requestPayment
        await Taro.requestPayment({
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType as "MD5" | "RSA",
          paySign: payParams.paySign,
        });

        // Payment success - navigate to result page
        Taro.redirectTo({
          url: `/pages/pay/result/index?id=${payOrderId}&status=success`,
        });
      } catch (err) {
        // Handle payment failure or cancellation
        const error = err as { errMsg?: string };
        if (error.errMsg?.includes("cancel")) {
          // User cancelled - navigate to result page with cancel status
          Taro.redirectTo({
            url: `/pages/pay/result/index?id=${payOrderId}&status=cancel`,
          });
        } else {
          // Payment failed
          setErrorMessage(error.errMsg || "支付失败，请稍后重试");
          setStatus("error");
        }
      }
    },
    [payOrderId]
  );

  // Handle payment submission
  const submitPayment = useCallback(async () => {
    if (!payOrderId || !method || !channelCode) {
      setErrorMessage("支付参数不完整");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");

      // Build request
      const request: SubmitPayOrderRequest = {
        id: parseInt(payOrderId, 10),
        channelCode,
        displayMode: channelCode === "wx_native" ? "qr" : "app",
      };

      // For H5 channels, add returnUrl
      if (channelCode !== "wx_lite") {
        const pages = Taro.getCurrentPages();
        const currentPage = pages[pages.length - 1];
        request.returnUrl = `${process.env.TARO_APP_H5_BASE || ""}${currentPage?.route || ""}`;
      }

      // Submit payment
      const response = await submitPayOrder(request);

      if (response.code !== 0) {
        throw new Error(response.msg || "支付提交失败");
      }

      const { displayMode, displayContent } = response.data;

      // Handle response based on channel and display mode
      if (channelCode === "wx_lite") {
        // WeChat Mini Program - call requestPayment
        await handleWxLitePayment(displayContent);
      } else if (displayMode === "url" && displayContent) {
        // URL redirect - use web-view or external browser
        setStatus("redirecting");
        // In mini program, we can use web-view to open payment URL
        // For H5, we can use window.location
        if (process.env.TARO_ENV === "h5") {
          window.location.href = displayContent;
        } else {
          // Mini program cannot directly open payment URLs, show error
          setErrorMessage("当前环境不支持该支付方式，请使用微信支付");
          setStatus("error");
        }
      } else if (displayMode === "qr" && displayContent) {
        // QR code - show in result page (not implemented in mini program)
        setErrorMessage("请使用微信扫码支付");
        setStatus("error");
      } else {
        throw new Error("支付响应格式错误");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "支付提交失败，请稍后重试";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [payOrderId, method, channelCode, handleWxLitePayment]);

  // Auto-submit payment on mount
  useEffect(() => {
    if (payOrderId && method && channelCode) {
      submitPayment();
    } else if (!payOrderId || !method) {
      setErrorMessage("支付参数缺失");
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setErrorMessage("");
    submitPayment();
  }, [submitPayment]);

  // Handle back to cart
  const handleBackToCart = useCallback(() => {
    Taro.switchTab({
      url: "/pages/cart/index",
    });
  }, []);

  // Handle view order
  const handleViewOrder = useCallback(() => {
    Taro.navigateTo({
      url: "/pages/profile/orders/index",
    });
  }, []);

  return (
    <View className="flex flex-col min-h-screen bg-page-gradient">
      <View className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Loading State */}
        {status === "loading" && (
          <View className="text-center">
            <Loading
              type="circular"
              className="text-moon-purple"
            />
            <Text className="mt-6 text-xl font-semibold text-moon-text block">
              正在准备支付...
            </Text>
            <Text className="mt-2 text-sm text-moon-text-muted block">
              即将跳转至{channelDisplayName}
            </Text>
          </View>
        )}

        {/* Processing State (WeChat Payment) */}
        {status === "processing" && (
          <View className="text-center">
            <Loading
              type="circular"
              className="text-moon-purple"
            />
            <Text className="mt-6 text-xl font-semibold text-moon-text block">
              正在调起{channelDisplayName}...
            </Text>
            <Text className="mt-2 text-sm text-moon-text-muted block">
              请在弹出的支付窗口中完成支付
            </Text>
          </View>
        )}

        {/* Redirecting State */}
        {status === "redirecting" && (
          <View className="text-center">
            <View className="w-16 h-16 rounded-full bg-moon-purple/10 flex items-center justify-center mx-auto">
              <WarningOutlined size={32} className="text-moon-purple" />
            </View>
            <Text className="mt-6 text-xl font-semibold text-moon-text block">
              正在跳转至支付页面
            </Text>
            <Text className="mt-2 text-sm text-moon-text-muted block">
              请在新页面中完成支付
            </Text>
          </View>
        )}

        {/* Error State */}
        {status === "error" && (
          <View className="text-center">
            <View className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <Failure size={40} className="text-red-400" />
            </View>
            <Text className="mt-4 text-xl font-semibold text-moon-text block">
              支付失败
            </Text>
            <Text className="mt-2 text-sm text-moon-text-muted block max-w-xs">
              {errorMessage}
            </Text>

            <View className="mt-6 flex flex-col gap-3 w-full max-w-xs mx-auto">
              <Button
                type="primary"
                className="rounded-full!"
                style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                onClick={handleRetry}
              >
                <View className="flex items-center justify-center gap-2">
                  <Replay size={16} />
                  <Text>重试</Text>
                </View>
              </Button>
              <Button
                type="default"
                className="rounded-full!"
                onClick={handleViewOrder}
              >
                查看订单
              </Button>
              <Button
                fill="none"
                className="text-moon-text-muted!"
                onClick={handleBackToCart}
              >
                返回购物车
              </Button>
            </View>

            {/* Order info */}
            <Text className="mt-4 text-xs text-gray-400 block">
              订单号: {orderId || payOrderId}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
