"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface HomeFeaturesShowcaseProps {
  onSelectTab: (tab: string) => void;
}

export default function HomeFeaturesShowcase({ onSelectTab }: HomeFeaturesShowcaseProps) {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = React.useState<"all" | "work" | "healing">("all");

  const allFeatures = [
    {
      id: "images",
      category: "work",
      badge: "AI ART",
      title: language === "en" ? "8K Studio Photorealistic" : "Studio Tạo Ảnh 8K",
      subtitle: language === "en" ? "Flux Pro • DSLR Quality" : "Flux 1.1 Pro • Nhiếp ảnh DSLR",
      icon: "🎨",
      accent: "from-indigo-500/20 via-violet-500/10 to-transparent",
      glowColor: "group-hover:shadow-indigo-500/20 border-indigo-500/30 group-hover:border-indigo-500/60",
      tagBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "characters",
      category: "work",
      badge: "TRỢ LÝ CHUYÊN SÂU",
      title: language === "en" ? "AI Characters & Expert" : "Tổ Hợp Trợ Lý Chuyên Sâu",
      subtitle: language === "en" ? "Marketing • Code • Strategy" : "Marketing • Lập trình • Phân tích",
      icon: "💼",
      accent: "from-indigo-500/20 via-cyan-500/10 to-transparent",
      glowColor: "group-hover:shadow-indigo-500/20 border-indigo-500/30 group-hover:border-indigo-500/60",
      tagBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "tarot",
      category: "healing",
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
      category: "healing",
      badge: "ASMR 3D",
      title: language === "en" ? "Healing Soundscapes" : "Góc Chữa Lành & Tâm Sự",
      subtitle: language === "en" ? "Ambient Audio • Relief" : "Âm thanh 3D • Lắng nghe cảm xúc",
      icon: "🌿",
      accent: "from-cyan-500/20 via-teal-500/10 to-transparent",
      glowColor: "group-hover:shadow-cyan-500/20 border-cyan-500/30 group-hover:border-cyan-500/60",
      tagBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
  ];

  const filteredFeatures =
    activeCategory === "all"
      ? allFeatures
      : allFeatures.filter((f) => f.category === activeCategory);

  return (
    <section className="w-full my-6 sm:my-8">
      {/* Header bar with Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
            {language === "en" ? "EXCLUSIVE AI ECOSYSTEM" : "HỆ SINH THÁI TÍNH NĂNG ĐỘC QUYỀN"}
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("work")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === "work"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>💼</span>
            <span>Công việc & Trợ lý</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("healing")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === "healing"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>🔮</span>
            <span>Giải trí & Chữa lành</span>
          </button>
        </div>
      </div>

      {/* Grid of Sleek Cyber Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-in fade-in duration-200">
        {filteredFeatures.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className="p-4 rounded-2xl bg-gradient-to-b from-white/90 to-white/70 dark:from-[#15171e] dark:to-[#12141a] backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 shadow-xs group text-left flex flex-col justify-between relative overflow-hidden cursor-pointer h-36"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-6 -bottom-6 w-28 h-28 bg-gradient-to-br ${item.accent} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none opacity-60 group-hover:opacity-100`} />

            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-2xl group-hover:scale-115 transition-transform duration-300 drop-shadow-sm">
                {item.icon}
              </span>
              <span className={`text-[9px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-2xs ${item.tagBg}`}>
                {item.badge}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 mt-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>{item.title}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-indigo-500 dark:text-cyan-400">➔</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
