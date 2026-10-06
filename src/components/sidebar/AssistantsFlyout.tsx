"use client";

import React, { useState, useMemo } from "react";
import { AssistantItem, ONLY_ASSISTANTS_LIST } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";

interface AssistantsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAssistant: (item: AssistantItem) => void;
  initialShowCatalog?: boolean;
}

const BOT_EMOJIS: Record<string, string> = {
  "ai-artist": "🎨",
  "goc-chua-lanh": "🕊️",
  cuppy: "🐾",
  "math-solver": "📐",
  "english-teacher": "🇬🇧",
  "exam-prep": "🎯",
  "doc-assistant": "🔬",
  "physics-solver": "⚡",
  "career-guide": "💼",
  "writing-assistant": "🖋️",
  "mindmap-creator": "🧠",
  "ai-detector": "🔍",
  "tu-vi-master": "☯️",
  "tarot-reader": "🔮",
  "cosmic-chart": "🌌",
  "love-astrology": "💖",
  numerology: "🔢",
  "health-advice": "🩺",
  "finance-advisor": "📈",
  "movie-assistant": "🎬",
  "book-assistant": "📚",
  "youtube-summarizer": "⚡",
};

export default function AssistantsFlyout({
  isOpen,
  onClose,
  onSelectAssistant,
}: AssistantsFlyoutProps) {
  const { language } = useLanguage();
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  // Lọc duy nhất 20 Trợ Lý AI Chuyên Nghiệp (Không bao gồm Nhân vật truyện/nhập vai)
  const catalogList = useMemo(() => {
    return ONLY_ASSISTANTS_LIST.filter((item) => {
      const matchCat =
        catalogCategory === "all" || item.category === catalogCategory;
      const query = catalogSearch.trim().toLowerCase();
      if (!query) return matchCat;
      return (
        item.name.toLowerCase().includes(query) ||
        (item.badge && item.badge.toLowerCase().includes(query)) ||
        (item.personality && item.personality.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.tagline && item.tagline.toLowerCase().includes(query))
      );
    });
  }, [catalogSearch, catalogCategory]);

  if (!isOpen) return null;

  const handlePick = (item: AssistantItem) => {
    onSelectAssistant(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-250">
      {/* Outer Cyber Glow Container */}
      <div className="w-full max-w-5xl h-[88vh] max-h-[88vh] bg-[#070913]/98 border border-indigo-500/30 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-indigo-950/50 to-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                🤖
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 flex items-center gap-2.5 tracking-tight">
                <span>{language === "en" ? "VIP AI Assistants Hub" : "Thư Viện 20 Trợ Lý AI Độc Bản"}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PRO AI 2.0
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {language === "en"
                  ? "Select specialized AI experts tailored to your workflow & study goals"
                  : "Mỗi trợ lý sở hữu một tính cách, phong cách xưng hô và chuyên môn riêng biệt"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/60 active:scale-95"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Filter Toolbar */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-indigo-500/15 bg-slate-900/70 backdrop-blur-md flex flex-col sm:flex-row items-center gap-3 justify-between shrink-0 relative z-10">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
            {[
              { id: "all", label: language === "en" ? "🌐 All (20)" : "🌐 Tất cả (20)" },
              { id: "study", label: language === "en" ? "🎓 Study (6)" : "🎓 Học tập (6)" },
              { id: "work", label: language === "en" ? "💼 Work (4)" : "💼 Làm việc (4)" },
              { id: "entertainment", label: language === "en" ? "🕊️ Psychology (6)" : "🕊️ Tâm lý (6)" },
              { id: "other", label: language === "en" ? "⚡ Utilities (4)" : "⚡ Tiện ích (4)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatalogCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 text-xs ${
                  catalogCategory === cat.id
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30 border border-cyan-400/40"
                    : "bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder={language === "en" ? "Search AI assistant..." : "Tìm kiếm trợ lý AI..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Modal Cards Grid (Fixed dynamic content height) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-max items-start relative z-10 custom-scrollbar">
          {catalogList.map((item) => (
            <div
              key={item.id}
              className="w-full h-auto min-h-[260px] p-5 rounded-2xl bg-gradient-to-b from-slate-900/95 via-[#0c0f1c]/95 to-[#070914]/98 border border-indigo-500/25 hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-0.5 relative overflow-hidden"
            >
              {/* Subtle Card Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all pointer-events-none" />

              <div className="flex flex-col gap-3">
                {/* Top Row: Avatar + Name + Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/40 group-hover:border-cyan-400 shrink-0 shadow-md transition-colors">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/characters/tam_an.jpg";
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-cyan-300 border border-indigo-400/40 flex items-center gap-1">
                          <span>{BOT_EMOJIS[item.id] || "✨"}</span>
                          <span>{item.badge}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Tagline Quote */}
                {item.tagline && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-indigo-950/40 border-l-2 border-indigo-400 text-xs italic text-indigo-200/90 font-medium">
                    "{item.tagline}"
                  </div>
                )}

                {/* Personality description */}
                {item.personality && (
                  <div className="text-xs text-slate-300 flex items-start gap-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-cyan-400 font-bold shrink-0">
                      🎭 Tính cách:
                    </span>
                    <span className="line-clamp-2 text-slate-300 font-medium">{item.personality}</span>
                  </div>
                )}

                {/* Suggested Prompts Sample */}
                {item.suggestedPrompts && item.suggestedPrompts.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      CÂU HỎI GỢI Ý:
                    </span>
                    <div className="text-xs text-cyan-200 bg-cyan-950/30 hover:bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-500/25 transition-colors line-clamp-1 font-medium cursor-pointer flex items-center gap-1.5">
                      <span>👉</span>
                      <span>{item.suggestedPrompts[0]}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Futuristic Action Button */}
              <button
                onClick={() => handlePick(item)}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:brightness-125 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
              >
                <span>Trò chuyện với {item.name}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
