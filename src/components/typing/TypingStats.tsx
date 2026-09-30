"use client";

import React from "react";

interface TypingStatsProps {
  wpm: number;
  accuracy: number;
  cpm: number;
  timeLeft: number;
  errors: number;
  isActive: boolean;
}

export default function TypingStats({
  wpm,
  accuracy,
  cpm,
  timeLeft,
  errors,
  isActive,
}: TypingStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full max-w-3xl mx-auto mb-8">
      {/* Time Left */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm backdrop-blur-sm">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Thời gian
        </span>
        <span
          className={`text-2xl sm:text-3xl font-mono font-bold transition-colors ${
            timeLeft <= 5 && isActive
              ? "text-red-400 animate-pulse"
              : "text-amber-400"
          }`}
        >
          {timeLeft}s
        </span>
      </div>

      {/* WPM */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm backdrop-blur-sm">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          WPM
        </span>
        <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
          {wpm}
        </span>
      </div>

      {/* Accuracy */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm backdrop-blur-sm">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Chính xác
        </span>
        <span
          className={`text-2xl sm:text-3xl font-mono font-bold ${
            accuracy >= 95
              ? "text-emerald-400"
              : accuracy >= 80
              ? "text-amber-400"
              : "text-red-400"
          }`}
        >
          {accuracy}%
        </span>
      </div>

      {/* CPM */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm backdrop-blur-sm">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          CPM
        </span>
        <span className="text-2xl sm:text-3xl font-mono font-bold text-sky-400">
          {cpm}
        </span>
      </div>

      {/* Errors */}
      <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm backdrop-blur-sm">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Lỗi
        </span>
        <span
          className={`text-2xl sm:text-3xl font-mono font-bold ${
            errors > 0 ? "text-red-400" : "text-slate-400"
          }`}
        >
          {errors}
        </span>
      </div>
    </div>
  );
}
