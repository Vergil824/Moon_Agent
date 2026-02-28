"use client";

import { toast } from "sonner";

/**
 * PaymentMethodSelector - Payment method selection component
 * Story 4.4: Task 4 - Payment method selection with visual feedback
 *
 * Requirements per AC 2:
 * - Provide "微信支付" and "支付宝" options
 * - Default select "微信支付"
 * - Selected item has colored background and border emphasis
 *   - WeChat: light green background
 *   - Alipay: light blue background
 */

export type PaymentMethod = "wechat" | "alipay";

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

type PaymentOption = {
  id: PaymentMethod;
  name: string;
  icon: string;
  selectedBg: string;
  selectedBorder: string;
  disabled?: boolean; // If true, show "coming soon" message on click
};

const paymentOptions: PaymentOption[] = [
  {
    id: "alipay",
    name: "支付宝",
    icon: "/assets/icons/alipay.svg",
    selectedBg: "bg-[#E8F4FD]",
    selectedBorder: "border-[#1677FF]",
  },
  {
    id: "wechat",
    name: "微信支付",
    icon: "/assets/icons/wechat-pay.svg",
    selectedBg: "bg-[#E8F8EB]",
    selectedBorder: "border-[#07C160]",
    disabled: true, // WeChat pay not yet implemented
  },
];

export function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div data-testid="payment-method-selector" className="bg-white rounded-2xl p-4">
      {/* Section Title */}
      <h3 className="text-base font-semibold text-moon-text mb-3">支付方式</h3>

      {/* Payment Options */}
      <div className="flex gap-3">
        {paymentOptions.map((option) => {
          const isSelected = value === option.id;
          const handleClick = () => {
            if (option.disabled) {
              toast.info("微信支付功能正在开发中，敬请期待");
              return;
            }
            onChange(option.id);
          };
          return (
            <button
              key={option.id}
              data-testid={`payment-option-${option.id}`}
              onClick={handleClick}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${option.selectedBg} ${option.selectedBorder}`
                  : "bg-gray-50 border-transparent"
              } ${option.disabled ? "opacity-60" : ""}`}
            >
              {/* Payment Icon */}
              <div className="w-6 h-6 flex-shrink-0 relative">
                {option.id === "wechat" ? (
                  <WechatPayIcon isSelected={isSelected} />
                ) : (
                  <AlipayIcon isSelected={isSelected} />
                )}
              </div>

              {/* Payment Name */}
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-moon-text" : "text-moon-text-muted"
                }`}
              >
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// WeChat Pay Icon (inline SVG for better control)
function WechatPayIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-6 h-6 ${isSelected ? "text-[#07C160]" : "text-gray-400"}`}
      fill="currentColor"
    >
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55-.177.679-.452 1.645-.452 1.645l-.003.029a.247.247 0 00.102.262.244.244 0 00.272-.009l2.014-1.222a9.85 9.85 0 001.972.505c.104-.403.248-.79.435-1.158a7.72 7.72 0 01-.59-.045c-.57-.051-1.12-.155-1.64-.306l-.102-.033-.099-.03c-.161-.048-.325-.103-.487-.168l-.15-.061-.051-.022-.15-.068-.05-.023-.099-.047-.1-.048-.097-.05-.096-.052a7.42 7.42 0 01-.09-.051l-.042-.025-.088-.054-.041-.026-.086-.055-.039-.027-.084-.056-.037-.027-.082-.058-.034-.025-.08-.059-.031-.024-.078-.061-.028-.022-.077-.062-.024-.02-.076-.064-.02-.017-.075-.066-.016-.014-.074-.067-.01-.01-.074-.069-.004-.004-.073-.071.073.071-.073-.071c-.015-.015-.028-.03-.042-.046l-.029-.031-.065-.074-.025-.028-.061-.074-.022-.027-.058-.074-.018-.024-.055-.075-.014-.02-.053-.075-.01-.015-.05-.076-.007-.011-.047-.076-.004-.007-.045-.077-.001-.002-.043-.078.043.078-.043-.078-.04-.079-.038-.08-.036-.08-.034-.08-.032-.081-.03-.081-.028-.081-.026-.082-.024-.082-.022-.082-.02-.082-.018-.083-.016-.083-.014-.083-.012-.083-.01-.083-.008-.084-.006-.084-.004-.084-.002-.084v-.084l.002-.084.004-.084.006-.084.008-.084.01-.084.012-.083.014-.083.016-.083.018-.083.02-.082.022-.082.024-.082.026-.082.028-.081.03-.081.032-.081.034-.08.036-.08.038-.08.04-.079.042-.078.044-.077.046-.077.048-.076.05-.076.052-.075.054-.075.056-.074.058-.074.06-.073.062-.073.064-.072.066-.071.068-.071.07-.07.072-.07.074-.068.076-.068.078-.067.08-.066.082-.065.084-.064.086-.063.088-.062.09-.061.092-.06.094-.058.096-.057.098-.056.1-.055.102-.053.104-.052.106-.05.108-.049.11-.047.112-.046.114-.044.116-.042.118-.04.12-.039.122-.036.124-.035.126-.032.128-.03.13-.028.132-.026.134-.024.136-.021.138-.018.14-.016.142-.013.144-.01.146-.008.148-.005.15-.002h.076z" />
    </svg>
  );
}

// Alipay Icon (inline SVG for better control)
function AlipayIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-6 h-6 ${isSelected ? "text-[#1677FF]" : "text-gray-400"}`}
      fill="currentColor"
    >
      <path d="M21.422 15.358c-3.356-1.32-5.904-2.34-7.02-2.784.696-1.536 1.2-3.24 1.44-5.064h-4.32v-1.68h5.28V4.15h-5.28V1.59H9.602v2.56H4.202v1.68h5.4v1.68h-4.68v1.68h9.84c-.192 1.248-.528 2.376-.984 3.384-1.344-.432-2.568-.744-3.6-.912-2.472-.408-4.752-.024-6.12 1.368-1.08 1.104-1.44 2.664-.96 4.152.672 2.064 2.784 3.192 5.16 3.192 2.04 0 3.96-.768 5.472-2.184.72.36 1.584.816 2.568 1.392 2.88 1.68 6.36 3.624 6.36 3.624l2.76-4.848s-1.656-.912-3.996-1.92zM8.402 18.87c-1.632 0-2.88-.84-3.24-2.016-.264-.864-.024-1.68.624-2.304.84-.816 2.328-1.08 4.08-.72.84.168 1.8.456 2.88.864-1.008 2.568-2.904 4.176-4.344 4.176z" />
    </svg>
  );
}

export default PaymentMethodSelector;

