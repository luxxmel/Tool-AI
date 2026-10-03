"use client";

import React, { useState, useMemo } from "react";
import { AssistantItem, ALL_ASSISTANTS_LIST } from "@/data/aiData";
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
  "char-tong-tai": "👑",
  "char-co-da-than": "💎",
  "char-tieu-viem": "⚔️",
  "char-lam-tuyet-dao": "🌸",
  "char-luna": "⏳",
  "char-zen": "🍃",
  "char-alex": "💻",
  "char-mira": "🌌",
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

  // Lọc trợ lý cho Catalog Modal
  const catalogList = useMemo(() => {
    return ALL_ASSISTANTS_LIST.filter((item) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#0f1118] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 flex items-center gap-2">
              <span>🎴 Thư Viện 20 Trợ Lý AI Độc Bản</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mỗi trợ lý sở hữu một tính cách, phong cách xưng hô và chuyên môn riêng biệt
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Filter Toolbar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#131520]/50 flex flex-col sm:flex-row items-center gap-3 justify-between shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
            {[
              { id: "all", label: language === "en" ? "All (20)" : "Tất cả (20)" },
              { id: "study", label: language === "en" ? "Study (6)" : "Học tập (6)" },
              { id: "work", label: language === "en" ? "Work (4)" : "Làm việc (4)" },
              { id: "entertainment", label: language === "en" ? "Psychology (6)" : "Tâm lý (6)" },
              { id: "other", label: language === "en" ? "Utilities (4)" : "Tiện ích (4)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatalogCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  catalogCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder={language === "en" ? "Search assistants..." : "Tìm kiếm trợ lý..."}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
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

        {/* Modal Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalogList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#141622] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-cyan-500/60 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                {/* Top Row: Avatar + Name + Badge */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative w-13 h-13 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-sm">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/characters/tam_an.jpg";
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141622]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
                          <span>{BOT_EMOJIS[item.id] || "✨"}</span>
                          <span>{item.badge}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Tagline Quote */}
                {item.tagline && (
                  <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a1c2a] border border-slate-100 dark:border-slate-800/80 text-xs italic text-slate-600 dark:text-slate-300">
                    "{item.tagline}"
                  </div>
                )}

                {/* Personality description */}
                {item.personality && (
                  <div className="mb-3 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    <span className="text-indigo-500 dark:text-cyan-400 font-semibold shrink-0">
                      🎭 Tính cách:
                    </span>
                    <span className="line-clamp-2">{item.personality}</span>
                  </div>
                )}

                {/* Suggested Prompts Sample */}
                {item.suggestedPrompts && item.suggestedPrompts.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Câu hỏi gợi ý:
                    </span>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-1">
                      👉 {item.suggestedPrompts[0]}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePick(item)}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Trò chuyện với {item.name}</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
