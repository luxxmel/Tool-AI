"use client";

import React, { useState, useMemo } from "react";
import { CATEGORIZED_ASSISTANTS, AssistantItem, ALL_ASSISTANTS_LIST } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";

interface AssistantsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAssistant: (item: AssistantItem) => void;
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
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredBot, setHoveredBot] = useState<AssistantItem | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  // Lọc trợ lý theo search & category cho flyout
  const filteredList = useMemo(() => {
    return ALL_ASSISTANTS_LIST.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCat;
      const matchSearch =
        item.name.toLowerCase().includes(query) ||
        (item.badge && item.badge.toLowerCase().includes(query)) ||
        (item.personality && item.personality.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

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
    setShowCatalogModal(false);
  };

  return (
    <>
      {/* Click outside backdrop for flyout */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:bg-transparent"
      />

      {/* Flyout Panel */}
      <div className="fixed top-16 left-4 right-4 sm:left-60 sm:right-auto z-50 w-auto sm:w-[410px] max-h-[calc(100vh-80px)] flex flex-col rounded-2xl bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-left-2 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 font-bold text-base">
              {language === "en" ? "Smart Assistants" : "Trợ Lý Thông Minh"}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-cyan-500/15 text-indigo-600 dark:text-cyan-300 border border-indigo-500/20 dark:border-cyan-500/30">
              {language === "en" ? "20 Personas" : "20 Tính cách"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCatalogModal(true)}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-cyan-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium transition-colors cursor-pointer flex items-center gap-1 border border-indigo-200/50 dark:border-indigo-800/40"
              title={language === "en" ? "Open library to view detailed persona cards" : "Mở thư viện xem danh thiếp và tính cách chi tiết"}
            >
              <span>{language === "en" ? "🎴 Library" : "🎴 Thư viện"}</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "en" ? "Search by name or persona (cat, math, tarot...)" : "Tìm theo tên hoặc tính cách (mèo, tử vi, toán...)"}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-[#171924] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
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

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0 text-[11px]">
          {[
            { id: "all", label: language === "en" ? "All (20)" : "Tất cả (20)" },
            { id: "study", label: language === "en" ? "Study (6)" : "Học tập (6)" },
            { id: "work", label: language === "en" ? "Work (4)" : "Làm việc (4)" },
            { id: "entertainment", label: language === "en" ? "Emotional (6)" : "Tâm lý (6)" },
            { id: "other", label: language === "en" ? "Utilities (4)" : "Tiện ích (4)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Assistant Grid Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
          {selectedCategory === "all" && !searchQuery ? (
            // Hiển thị phân nhóm rõ ràng khi không search
            Object.entries(CATEGORIZED_ASSISTANTS).map(([key, group]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                    <span>{group.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({group.items.length})
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setCatalogCategory(key);
                      setShowCatalogModal(true);
                    }}
                    className="text-[11px] text-indigo-500 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{language === "en" ? "View cards" : "Xem danh thiếp"}</span>
                    <span>↗</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {group.items.map((item) => (
                    <AssistantFlyoutCard
                      key={item.id}
                      item={item}
                      emoji={BOT_EMOJIS[item.id] || "🤖"}
                      onSelect={() => handlePick(item)}
                      onHover={(bot) => setHoveredBot(bot)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Hiển thị kết quả tìm kiếm hoặc danh sách lọc theo tab
            <div>
              {filteredList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy trợ lý phù hợp với từ khóa "{searchQuery}"
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredList.map((item) => (
                    <AssistantFlyoutCard
                      key={item.id}
                      item={item}
                      emoji={BOT_EMOJIS[item.id] || "🤖"}
                      onSelect={() => handlePick(item)}
                      onHover={(bot) => setHoveredBot(bot)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hover Persona Quick Preview Card (Fixed at bottom of flyout) */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
          {hoveredBot ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151722] border border-indigo-500/20 dark:border-cyan-500/20 text-left animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{BOT_EMOJIS[hoveredBot.id] || "🤖"}</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {hoveredBot.name}
                </span>
                {hoveredBot.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 dark:text-cyan-300 font-semibold border border-indigo-500/20">
                    {hoveredBot.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 italic mb-0.5">
                "{hoveredBot.tagline || hoveredBot.description}"
              </p>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                🎭 {hoveredBot.personality}
              </p>
            </div>
          ) : (
            <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#151722]/50 text-center">
              <p className="text-[11px] text-slate-400">
                Di chuột vào từng trợ lý để xem tính cách đặc trưng & câu châm ngôn
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Modal: Danh thiếp 20 Trợ lý AI */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0f1118] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
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
                onClick={() => setShowCatalogModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Filter Toolbar */}
            <div className="px-5 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#131520]/50 flex flex-col sm:flex-row items-center gap-3 justify-between shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
                {[
                  { id: "all", label: "Tất cả (20)" },
                  { id: "study", label: "Học tập (6)" },
                  { id: "work", label: "Làm việc (4)" },
                  { id: "entertainment", label: "Tâm lý (6)" },
                  { id: "other", label: "Tiện ích (4)" },
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
                  placeholder="Tìm kiếm trợ lý..."
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
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141622]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
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
      )}
    </>
  );
}

// Subcomponent: Thẻ Trợ Lý trong Flyout
function AssistantFlyoutCard({
  item,
  emoji,
  onSelect,
  onHover,
}: {
  item: AssistantItem;
  emoji: string;
  onSelect: () => void;
  onHover: (bot: AssistantItem) => void;
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(item)}
      className="flex flex-col items-center text-center group cursor-pointer p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#181a26] transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
    >
      <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 group-hover:border-cyan-400/80 group-hover:scale-105 transition-all shadow-xs mb-1.5 bg-slate-100 dark:bg-slate-800">
        <img
          src={item.avatar}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
          }}
        />
        {/* Personality Emoji Badge */}
        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] shadow-xs">
          {emoji}
        </span>
      </div>

      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-cyan-300 line-clamp-1 w-full">
        {item.name}
      </span>

      {item.badge && (
        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-cyan-400 line-clamp-1">
          {item.badge}
        </span>
      )}
    </button>
  );
}
