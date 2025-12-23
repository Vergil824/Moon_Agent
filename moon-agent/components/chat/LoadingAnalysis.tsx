"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StateComponentProps } from "./StateComponents";

const ANALYSIS_STAGES = [
  { text: "Get！数据齐全，分析即将开始～", delay: 0 },
  { text: "正在为你重建3D体态模型...", delay: 2000 },
  { text: "正在计算抗引力系数...", delay: 4000 },
  { text: "正在进行商品推荐..", delay: 6000 }
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * LoadingAnalysis
 * - Conic gradient ring with seamless rotation
 * - Dynamic staged text
 * - Pink indeterminate progress bar + timer
 */
export function LoadingAnalysis(_props: StateComponentProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeStage < ANALYSIS_STAGES.length - 1) {
      const nextDelay =
        ANALYSIS_STAGES[activeStage + 1].delay - ANALYSIS_STAGES[activeStage].delay;
      stageTimerRef.current = setTimeout(() => {
        setActiveStage((prev) => prev + 1);
      }, nextDelay);
    }
    return () => {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, [activeStage]);

  return (
    <motion.div
      data-testid="loading-analysis"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[330px] mx-auto"
    >
      <div className="rounded-3xl p-[2px] bg-gradient-to-r from-moon-purple to-moon-pink">
        <div className="rounded-3xl bg-gradient-to-br from-[#F6F0FF] to-[#FFF1F6] p-6">
          {/* Ring */}
          <div className="flex justify-center mb-6">
            <div
              data-testid="loading-analysis-ring"
              className="relative size-24"
            >
              <div className="absolute inset-0 rounded-full border-[0.5px] border-gray-200/50" />
              <div
                className="absolute inset-0 rounded-full ring-sweep animate-[spin_3.6s_linear_infinite]"
                aria-hidden
              />
              <div
                data-testid="loading-analysis-sphere"
                className="absolute inset-5 rounded-full bg-gradient-to-br from-moon-purple to-moon-pink animate-pulse shadow-lg"
              />
            </div>
          </div>

          {/* Dynamic text */}
          <div className="space-y-2 text-center min-h-[100px]">
            <AnimatePresence mode="popLayout">
              {ANALYSIS_STAGES.slice(0, activeStage + 1).map((stage, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: idx === activeStage ? 1 : 0.5, y: 0 }}
                  exit={{ opacity: 0.3 }}
                  transition={{ duration: 0.4 }}
                  className={`text-base leading-relaxed ${
                    idx === activeStage
                      ? "text-moon-text font-medium"
                      : "text-moon-text-muted"
                  }`}
                >
                  {stage.text}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>

          {/* Indeterminate bar + timer */}
          <div className="mt-6">
            <div
              data-testid="loading-analysis-progress-track"
              className="h-3 w-full rounded-full bg-white/60 overflow-hidden"
            >
              <div
                data-testid="loading-analysis-progress-indeterminate"
                className="h-full w-full moon-indeterminate-bar"
              />
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-moon-text-muted">
              <span>生成中...</span>
              <span
                data-testid="loading-analysis-timer"
                className="tabular-nums"
              >
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

