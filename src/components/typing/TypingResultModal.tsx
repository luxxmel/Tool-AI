"use client";

import React, { useEffect } from "react";

interface TypingResultModalProps {
  isOpen: boolean;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  totalChars: number;
  correctChars: number;
  timeSpent: number;
  bestWpm: number;
  isNewBest: boolean;
  onRestart: () => void;
}

export default function TypingResultModal({
  isOpen,
  wpm,
  cpm,
  accuracy,
  errors,
  totalChars,
  correctChars,
  timeSpent,
  bestWpm,
  isNewBest,
  onRestart,
}: TypingResultModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        onRestart();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onRestart]);

  if (!isOpen) return null;

  const getRank = () => {
    if (wpm >= 90) return { title: "Thần Tốc! 🚀", color: "text-purple-400" };
    if (wpm >= 65) return { title: "Xuất Sắc! 🌟", color: "text-emerald-400" };
    if (wpm >= 40) return { title: "Rất Tốt! 🎯", color: "text-sky-400" };
    return { title: "Cố Lên Nào! 💪", color: "text-amber-400" };
  };

  const rank = getRank();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <span className={`text-xl font-bold tracking-tight ${rank.color}`}>
            {rank.title}
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Kết Quả Bài Test
          </h2>
          {isNewBest && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-bounce">
              <span>🏆</span> Kỷ lục cá nhân mới!
            </div>
          )}
        </div>

        {/* Primary highlight stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Tốc độ (WPM)
            </span>
            <span className="text-5xl font-mono font-black text-amber-400 mt-2">
              {wpm}
            </span>
            <span className="text-xs text-slate-500 mt-1">từ / phút</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Chính xác
            </span>
            <span
              className={`text-5xl font-mono font-black mt-2 ${
                accuracy >= 95
                  ? "text-emerald-400"
                  : accuracy >= 80
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {accuracy}%
            </span>
            <span className="text-xs text-slate-500 mt-1">tỷ lệ ký tự đúng</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/60 mb-8 space-y-2.5 text-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span>Ký tự mỗi phút (CPM):</span>
            <span className="font-mono text-white font-semibold">{cpm}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Ký tự đúng / Tổng số:</span>
            <span className="font-mono text-white font-semibold">
              <span className="text-emerald-400">{correctChars}</span> / {totalChars}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Số lỗi đã mắc:</span>
            <span className="font-mono text-red-400 font-semibold">{errors}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Thời gian hoàn thành:</span>
            <span className="font-mono text-white font-semibold">{timeSpent} giây</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>Kỷ lục cao nhất của bạn:</span>
            <span className="font-mono text-amber-400 font-bold">{bestWpm} WPM</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition-all duration-200 shadow-xl shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Luyện tập lại (Nhấn Enter)
        </button>
      </div>
    </div>
  );
}
