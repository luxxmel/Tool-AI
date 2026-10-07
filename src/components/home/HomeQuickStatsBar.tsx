"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface HomeQuickStatsBarProps {
  onSelectTab: (tab: string) => void;
}

export default function HomeQuickStatsBar({ onSelectTab }: HomeQuickStatsBarProps) {
  const { language } = useLanguage();

  const stats = [
    {
      icon: "🤖",
      value: "50+",
      label: language === "en" ? "AI Models & Bots" : "Mô hình & Bot AI",
      bg: "bg-cyan-50/80 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/40 text-cyan-600 dark:text-cyan-400",
      link: "tools",
    },
    {
      icon: "⚡",
      value: "Flux 1.1 Pro",
      label: language === "en" ? "8K Ultra-realistic Studio" : "Studio Tạo Ảnh 8K",
      bg: "bg-purple-50/80 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400",
      link: "images",
    },
    {
      icon: "🔮",
      value: "Tarot 3D",
      label: language === "en" ? "Destiny Reading & Astromancy" : "Luận Giải Tử Vi - Huyền Học",
      bg: "bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400",
      link: "tarot",
    },
    {
      icon: "🌿",
      value: "3D ASMR",
      label: language === "en" ? "Soundscapes & Emotional AI" : "Âm Thanh & Chữa Lành",
      bg: "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400",
      link: "healing",
    },
  ];

  return (
    <div className="w-full my-8 grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelectTab(item.link)}
          className={`p-3.5 rounded-2xl ${item.bg} border hover:scale-[1.02] transition-all text-left group flex items-center gap-3 cursor-pointer shadow-xs hover:shadow-md`}
        >
          <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {item.value}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate font-medium">
              {item.label}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
