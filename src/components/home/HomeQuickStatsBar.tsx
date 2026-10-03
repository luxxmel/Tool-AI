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
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
      link: "tools",
    },
    {
      icon: "⚡",
      value: "Flux 1.1 Pro",
      label: language === "en" ? "8K Ultra-realistic Studio" : "Studio Tạo Ảnh 8K",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300",
      link: "images",
    },
    {
      icon: "🔮",
      value: "Tarot 3D",
      label: language === "en" ? "Destiny Reading & Astromancy" : "Luận Giải Tử Vi - Huyền Học",
      color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-300",
      link: "tarot",
    },
    {
      icon: "🌿",
      value: "3D ASMR",
      label: language === "en" ? "Soundscapes & Emotional AI" : "Âm Thanh & Chữa Lành",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
      link: "healing",
    },
  ];

  return (
    <div className="w-full my-8 grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelectTab(item.link)}
          className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} backdrop-blur-md border border-slate-800/80 hover:border-slate-700 hover:scale-[1.02] transition-all text-left group flex items-center gap-3 cursor-pointer shadow-md`}
        >
          <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {item.value}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {item.label}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
