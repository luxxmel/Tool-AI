"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface HomeFeaturesShowcaseProps {
  onSelectTab: (tab: string) => void;
}

export default function HomeFeaturesShowcase({ onSelectTab }: HomeFeaturesShowcaseProps) {
  const { language } = useLanguage();

  const features = [
    {
      id: "images",
      badge: "AI ART",
      title: language === "en" ? "8K Studio Photorealistic" : "Studio Tạo Ảnh 8K",
      subtitle: language === "en" ? "Flux Pro • DSLR Quality" : "Flux 1.1 Pro • Nhiếp ảnh DSLR",
      icon: "🎨",
      accent: "from-indigo-500/20 via-violet-500/10 to-transparent",
      glowColor: "group-hover:shadow-indigo-500/20 border-indigo-500/30 group-hover:border-indigo-500/60",
      tagBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "tarot",
      badge: "3D MYSTIC",
      title: language === "en" ? "Tarot & Astromancy" : "Bói Tarot & Tử Vi",
      subtitle: language === "en" ? "3D Cards • Horoscope" : "Bài 3D • Lá số Hoàng Đạo",
      icon: "🔮",
      accent: "from-violet-500/20 via-indigo-500/10 to-transparent",
      glowColor: "group-hover:shadow-violet-500/20 border-violet-500/30 group-hover:border-violet-500/60",
      tagBg: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
    {
      id: "healing",
      badge: "ASMR 3D",
      title: language === "en" ? "Healing Soundscapes" : "Góc Chữa Lành",
      subtitle: language === "en" ? "Ambient Audio • Relief" : "Âm thanh 3D • Tâm sự AI",
      icon: "🌿",
      accent: "from-cyan-500/20 via-teal-500/10 to-transparent",
      glowColor: "group-hover:shadow-cyan-500/20 border-cyan-500/30 group-hover:border-cyan-500/60",
      tagBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "characters",
      badge: "ROLEPLAY",
      title: language === "en" ? "AI Characters" : "Trợ Lý & Nhân Vật AI",
      subtitle: language === "en" ? "Personality • Anime" : "Tổ hợp Bot • Roleplay 24/7",
      icon: "🎭",
      accent: "from-indigo-500/20 via-cyan-500/10 to-transparent",
      glowColor: "group-hover:shadow-indigo-500/20 border-indigo-500/30 group-hover:border-indigo-500/60",
      tagBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
  ];

  return (
    <section className="w-full my-8">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
            {language === "en" ? "EXCLUSIVE AI ECOSYSTEM" : "HỆ SINH THÁI TÍNH NĂNG ĐỘC QUYỀN"}
          </h2>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          Omni Engines v3.5
        </span>
      </div>

      {/* Grid of Sleek Cyber Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className="p-4 rounded-2xl bg-white dark:bg-[#11131c] border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md group text-left flex flex-col justify-between relative overflow-hidden cursor-pointer h-32"
          >
            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${item.tagBg}`}>
                {item.badge}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 mt-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                <span>{item.title}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-500 dark:text-cyan-400">→</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
