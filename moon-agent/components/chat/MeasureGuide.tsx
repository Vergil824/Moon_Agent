"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { StateComponentProps } from "./StateComponents";
import { useChatStore } from "@/lib/store";

type DemoStep = "lower" | "upper";

const LOWER_BUST_TIPS: string[] = [
  "• 保持站立姿势，不要弯腰",
  "• 深呼气后再测量，确保数据准确",
  "• 软尺要保持水平，不要倾斜",
  "• 拉紧但不要勒进皮肤"
];

const UPPER_BUST_TIPS: string[] = [
  "• 弯腰90度，让胸部自然下垂",
  "• 测量胸部最高点，不是乳头位置",
  "• 软尺要绕过肩胛骨最突出处",
  "• 保持软尺水平不倾斜"
];

function LowerBustIllustration() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      role="img"
      aria-label="Lower bust illustration"
    >
      {/* silhouette */}
      <circle cx="110" cy="50" r="22" fill="#d1d5dc" />
      <path
        d="M80 210V95c0-10 8-18 18-18h24c10 0 18 8 18 18v115"
        fill="#d1d5dc"
        opacity="0.75"
      />
      {/* bust tint */}
      <ellipse
        cx="110"
        cy="125"
        rx="55"
        ry="35"
        fill="#ec4899"
        opacity="0.12"
      />

      {/* dashed measuring line */}
      <ellipse
        cx="110"
        cy="142"
        rx="68"
        ry="20"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 6"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-24"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* arrows */}
      <path d="M40 142h26" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M154 142h26" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 142l10-6" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 142l10 6" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M180 142l-10-6" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M180 142l-10 6" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />

      {/* label */}
      <text x="185" y="150" fontSize="12" fill="#8b5cf6" opacity="0.7">
        下胸围
      </text>
    </svg>
  );
}

function UpperBustIllustration() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      role="img"
      aria-label="Upper bust illustration"
    >
      {/* silhouette (bent forward) */}
      <circle cx="96" cy="58" r="22" fill="#d1d5dc" />
      <path
        d="M74 196l18-93c2-10 12-17 22-15l28 6c10 2 17 12 15 22l-18 93"
        fill="#d1d5dc"
        opacity="0.75"
      />
      {/* dotted spine */}
      <path
        d="M126 55l26 14"
        stroke="#9ca3af"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 6"
        opacity="0.8"
      />

      {/* bust tint */}
      <ellipse
        cx="112"
        cy="128"
        rx="58"
        ry="36"
        fill="#ec4899"
        opacity="0.14"
      />

      {/* dashed measuring line */}
      <ellipse
        cx="112"
        cy="142"
        rx="70"
        ry="20"
        fill="none"
        stroke="#ec4899"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 6"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-24"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* arrows */}
      <path d="M42 142h26" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M156 142h26" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 142l10-6" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 142l10 6" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M182 142l-10-6" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M182 142l-10 6" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />

      {/* label */}
      <text x="186" y="150" fontSize="12" fill="#ec4899" opacity="0.9">
        上胸围
      </text>
    </svg>
  );
}

function MeasureDemoModal({
  open,
  step,
  onClose,
  onPrev,
  onNext
}: {
  open: boolean;
  step: DemoStep;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!open) return null;

  const isLower = step === "lower";
  const title = isLower ? "下胸围测量" : "上胸围测量";
  const subtitle = isLower
    ? "站直，深呼气，软尺水平绕胸部根部，拉紧贴合身体"
    : "身体前倾90度（弯腰），软尺水平绕过胸部最高点";
  const tips = isLower ? LOWER_BUST_TIPS : UPPER_BUST_TIPS;

  return (
    <div
      data-testid="measure-demo-backdrop"
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Measure demo"
    >
      <div className="w-full max-w-[371px] bg-white rounded-[32px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Header */}
        <div className="relative h-[62px] bg-gradient-to-b from-[#8b5cf6] to-[#ec4899]">
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-[20px] font-semibold">测量演示</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-6">
          <div className="text-center">
            <div className="text-[#8b5cf6] text-[16px] font-semibold">{title}</div>
            <div className="mt-2 text-[#6b7280] text-[14px] leading-5">
              {subtitle}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF] h-[364px] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {isLower ? <LowerBustIllustration /> : <UpperBustIllustration />}
            </div>
          </div>

          <div className="mt-6 rounded-[16px] bg-[#FAF5FF] border border-[#E9D4FF] p-4">
            <div className="text-[#8b5cf6] text-[12px]">💡 小贴士</div>
            <ul className="mt-2 space-y-1 text-[#1f2937] text-[12px]">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            disabled={isLower}
            className="inline-flex items-center gap-1 text-[14px] font-semibold disabled:text-[#d1d5dc] text-[#8b5cf6]"
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          <div className="flex items-center gap-2" aria-label="Progress">
            <div
              className={`h-2 rounded-full ${
                isLower ? "w-6 bg-[#8b5cf6]" : "w-2 bg-[#d1d5dc]"
              }`}
            />
            <div
              className={`h-2 rounded-full ${
                !isLower ? "w-6 bg-[#8b5cf6]" : "w-2 bg-[#d1d5dc]"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!isLower}
            className="inline-flex items-center gap-1 text-[14px] font-semibold disabled:text-[#d1d5dc] text-[#8b5cf6]"
          >
            下一步
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MeasureGuide
 * Renders an in-chat card when state.step === "size_input".
 * The "Watch demo" button opens the measurement demo modal.
 */
export function MeasureGuide({ onSelect }: StateComponentProps) {
  const setMeasurementData = useChatStore((s) => s.setMeasurementData);

  const [lowerBust, setLowerBust] = useState<number>(75);
  const [upperBust, setUpperBust] = useState<number>(90);
  const bustDifference = upperBust - lowerBust;

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<DemoStep>("lower");

  const openDemo = () => {
    setDemoStep("lower");
    setDemoOpen(true);
  };

  const onConfirm = () => {
    setMeasurementData({
      lowerBust,
      upperBust,
      bustDifference
    });

    onSelect(
      `测量数据：下胸围${lowerBust}cm，上胸围${upperBust}cm，胸围差${bustDifference}cm`
    );
  };

  const lowerLabel = useMemo(() => "下胸围 (cm)", []);
  const upperLabel = useMemo(() => "上胸围 (cm)", []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-3 ml-10"
    >
      <div
        data-testid="measure-guide-card"
        className="bg-white rounded-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full max-w-[331px] p-4"
      >
        <button
          type="button"
          onClick={openDemo}
          className="w-full h-10 rounded-[14px] bg-gradient-to-b from-[#8b5cf6] to-[#ec4899] text-white text-[14px] flex items-center justify-center gap-2 shadow-md"
        >
          <Play className="w-4 h-4" />
          观看测量演示
        </button>

        <div className="mt-5 space-y-6">
          {/* Lower bust */}
          <div>
            <div className="flex items-center gap-2 text-[#6b7280] text-[14px]">
              <span className="inline-block size-4 rounded bg-[#8b5cf6]/15" aria-hidden="true" />
              <span>{lowerLabel}</span>
            </div>
            <input
              data-testid="lower-bust-slider"
              type="range"
              min={50}
              max={120}
              step={1}
              value={lowerBust}
              onChange={(e) => setLowerBust(Number(e.target.value))}
              className="mt-3 w-full accent-[#8b5cf6]"
            />
            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="number"
                value={lowerBust}
                onChange={(e) => setLowerBust(Number(e.target.value || 0))}
                className="w-20 h-10 text-center text-[18px] font-medium rounded-[10px] border-2 border-[#8b5cf6] text-[#1f2937] outline-none"
              />
              <span className="text-[#6b7280] text-[14px]">cm</span>
            </div>
          </div>

          {/* Upper bust */}
          <div>
            <div className="flex items-center gap-2 text-[#6b7280] text-[14px]">
              <span className="inline-block size-4 rounded bg-[#ec4899]/15" aria-hidden="true" />
              <span>{upperLabel}</span>
            </div>
            <input
              data-testid="upper-bust-slider"
              type="range"
              min={50}
              max={140}
              step={1}
              value={upperBust}
              onChange={(e) => setUpperBust(Number(e.target.value))}
              className="mt-3 w-full accent-[#ec4899]"
            />
            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="number"
                value={upperBust}
                onChange={(e) => setUpperBust(Number(e.target.value || 0))}
                className="w-20 h-10 text-center text-[18px] font-medium rounded-[10px] border-2 border-[#ec4899] text-[#1f2937] outline-none"
              />
              <span className="text-[#6b7280] text-[14px]">cm</span>
            </div>
          </div>

          {/* Bust difference */}
          <div className="pt-4 border-t border-[#e5e7eb] text-center">
            <div className="text-[#6b7280] text-[12px]">胸围差</div>
            <div
              data-testid="bust-difference-value"
              className="mt-1 text-[24px] font-medium text-[#EC4899]"
            >
              {bustDifference} cm
            </div>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-12 rounded-[14px] bg-[#8b5cf6] text-white text-[16px] font-semibold shadow-md"
          >
            确认数据
          </button>
        </div>
      </div>

      <MeasureDemoModal
        open={demoOpen}
        step={demoStep}
        onClose={() => setDemoOpen(false)}
        onPrev={() => setDemoStep("lower")}
        onNext={() => setDemoStep("upper")}
      />
    </motion.div>
  );
}
