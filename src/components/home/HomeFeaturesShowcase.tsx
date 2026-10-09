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
      accent: "from-rose-500/20 via-pink-500/10 to-transparent",
      glowColor: "group-hover:shadow-pink-500/20 border-pink-500/30 group-hover:border-pink-500/60",
      tagBg: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    },
    {
      id: "tarot",
      badge: "3D MYSTIC",
      title: language === "en" ? "Tarot & Astromancy" : "Bói Tarot & Tử Vi",
      subtitle: language === "en" ? "3D Cards • Horoscope" : "Bài 3D • Lá số Hoàng Đạo",
      icon: "🔮",
      accent: "from-purple-500/20 via-indigo-500/10 to-transparent",
      glowColor: "group-hover:shadow-purple-500/20 border-purple-500/30 group-hover:border-purple-500/60",
      tagBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    {
      id: "healing",
      badge: "ASMR 3D",
      title: language === "en" ? "Healing Soundscapes" : "Góc Chữa Lành",
      subtitle: language === "en" ? "Ambient Audio • Relief" : "Âm thanh 3D • Tâm sự AI",
      icon: "🌿",
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      glowColor: "group-hover:shadow-emerald-500/20 border-emerald-500/30 group-hover:border-emerald-500/60",
      tagBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "characters",
      badge: "ROLEPLAY",
      title: language === "en" ? "AI Characters" : "Trợ Lý & Nhân Vật AI",
      subtitle: language === "en" ? "Personality • Anime" : "Tổ hợp Bot • Roleplay 24/7",
      icon: "🎭",
      accent: "from-amber-500/20 via-orange-500/10 to-transparent",
      glowColor: "group-hover:shadow-amber-500/20 border-amber-500/30 group-hover:border-amber-500/60",
      tagBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
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

      {/* Grid of Sleek Cyber Cards: 2 cột trên mobile, 4 cột trên desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {features.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#11131c] border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 shadow-2xs hover:shadow-md group text-left flex flex-col justify-between relative overflow-hidden cursor-pointer h-28 sm:h-32"
          >
            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className={`text-[8px] sm:text-[9px] font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full border ${item.tagBg}`}>
                {item.badge}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 mt-auto">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1 line-clamp-1">
                <span>{item.title}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-500 dark:text-cyan-400">→</span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
