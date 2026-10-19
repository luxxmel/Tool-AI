"use client";

import React, { useState, useMemo } from "react";
import { AssistantItem, ONLY_ASSISTANTS_LIST } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
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

  const isDark = theme !== "light";

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-250 cursor-pointer ${
        isDark ? "bg-black/80" : "bg-slate-900/40 backdrop-blur-md"
      }`}
    >
      {/* Outer Cyber Glow Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl h-[88vh] max-h-[88vh] border rounded-3xl flex flex-col overflow-hidden relative cursor-default transition-colors duration-250 ${
          isDark
            ? "bg-[#070913]/98 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] text-slate-100"
            : "bg-white/95 border-indigo-100 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] text-slate-800"
        }`}
      >
        
        {/* Ambient Glows */}
        <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isDark ? "bg-indigo-600/20" : "bg-indigo-200/40"}`} />
        <div className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isDark ? "bg-cyan-500/20" : "bg-blue-200/40"}`} />

        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b backdrop-blur-md flex items-center justify-between shrink-0 relative z-10 transition-colors ${
          isDark
            ? "border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-indigo-950/50 to-slate-900/90"
            : "border-slate-200/80 bg-gradient-to-r from-slate-50/95 via-indigo-50/60 to-slate-50/95"
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center text-2xl ${isDark ? "bg-slate-950" : "bg-white"}`}>
                🤖
              </div>
            </div>
            <div>
              <h3 className={`text-lg sm:text-2xl font-black flex items-center gap-2.5 tracking-tight ${
                isDark
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600"
              }`}>
                <span>{language === "en" ? "VIP AI Assistants Hub" : "Thư Viện 20 Trợ Lý AI Độc Bản"}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  PRO AI 2.0
                </span>
              </h3>
              <p className={`text-xs mt-0.5 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "en"
                  ? "Select specialized AI experts tailored to your workflow & study goals"
                  : "Mỗi trợ lý sở hữu một tính cách, phong cách xưng hô và chuyên môn riêng biệt"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border active:scale-95 ${
              isDark
                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/60"
                : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border-slate-200"
            }`}
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Filter Toolbar */}
        <div className={`px-5 sm:px-6 py-3.5 border-b backdrop-blur-md flex flex-col sm:flex-row items-center gap-3 justify-between shrink-0 relative z-10 transition-colors ${
          isDark
            ? "border-indigo-500/15 bg-slate-900/70"
            : "border-slate-200/80 bg-slate-50/80"
        }`}>
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
                    ? isDark
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30 border border-cyan-400/40"
                      : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 border border-indigo-600"
                    : isDark
                    ? "bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
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
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border transition-all focus:outline-none ${
                isDark
                  ? "bg-slate-950/80 border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              }`}
            />
            <svg
              className={`w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-400"}`}
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
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-max items-start relative z-10 custom-scrollbar ${
          !isDark ? "bg-slate-50/60" : ""
        }`}>
          {catalogList.map((item) => (
            <div
              key={item.id}
              className={`w-full h-auto min-h-[260px] p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                isDark
                  ? "bg-gradient-to-b from-slate-900/95 via-[#0c0f1c]/95 to-[#070914]/98 border-indigo-500/25 hover:border-cyan-400/60 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-0.5"
                  : "bg-white border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5"
              }`}
            >
              {/* Subtle Card Glow Effect */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all pointer-events-none ${
                isDark
                  ? "bg-cyan-500/5 group-hover:bg-cyan-500/15"
                  : "bg-indigo-500/5 group-hover:bg-indigo-500/10"
              }`} />

              <div className="flex flex-col gap-3">
                {/* Top Row: Avatar + Name + Badge */}
                <div className="flex items-start gap-3.5">
                  <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 shrink-0 shadow-md transition-colors ${
                    isDark
                      ? "border-indigo-500/40 group-hover:border-cyan-400"
                      : "border-indigo-100 group-hover:border-indigo-400"
                  }`}>
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/characters/tam_an.jpg";
                      }}
                    />
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 animate-pulse ${
                      isDark ? "ring-slate-950" : "ring-white"
                    }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`font-extrabold text-base transition-colors tracking-tight ${
                        isDark ? "text-white group-hover:text-cyan-300" : "text-slate-900 group-hover:text-indigo-600"
                      }`}>
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isDark
                            ? "bg-indigo-950/80 text-cyan-300 border-indigo-400/40"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}>
                          <span>{BOT_EMOJIS[item.id] || "✨"}</span>
                          <span>{item.badge}</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-xs line-clamp-2 mt-1 font-medium leading-relaxed ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Tagline Quote */}
                {item.tagline && (
                  <div className={`px-3.5 py-2.5 rounded-xl border-l-2 text-xs italic font-medium ${
                    isDark
                      ? "bg-indigo-950/40 border-indigo-400 text-indigo-200/90"
                      : "bg-indigo-50/70 border-indigo-400 text-indigo-800"
                  }`}>
                    "{item.tagline}"
                  </div>
                )}

                {/* Personality description */}
                {item.personality && (
                  <div className={`text-xs flex items-start gap-1.5 p-2.5 rounded-xl border ${
                    isDark
                      ? "text-slate-300 bg-slate-950/50 border-slate-800/80"
                      : "text-slate-700 bg-slate-50 border-slate-200/80"
                  }`}>
                    <span className={`font-bold shrink-0 ${isDark ? "text-cyan-400" : "text-indigo-600"}`}>
                      🎭 Tính cách:
                    </span>
                    <span className={`line-clamp-2 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {item.personality}
                    </span>
                  </div>
                )}

                {/* Suggested Prompts Sample */}
                {item.suggestedPrompts && item.suggestedPrompts.length > 0 && (
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      CÂU HỎI GỢI Ý:
                    </span>
                    <div className={`text-xs p-2.5 rounded-xl border transition-colors line-clamp-1 font-medium cursor-pointer flex items-center gap-1.5 ${
                      isDark
                        ? "text-cyan-200 bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-500/25"
                        : "text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/60 border-indigo-200"
                    }`}>
                      <span>👉</span>
                      <span>{item.suggestedPrompts[0]}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Futuristic Action Button */}
              <button
                onClick={() => handlePick(item)}
                className={`w-full mt-4 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:brightness-125 text-white shadow-indigo-600/30"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-200"
                }`}
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
