"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FEATURED_ASSISTANTS, TRENDING_CHARACTERS } from "@/data/aiData";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: "feature" | "assistant" | "character" | "tool";
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onSelectTab }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Danh sách các tính năng và bot để tìm kiếm nhanh
  const allItems: SearchItem[] = [
    // Tính năng hệ thống
    {
      id: "card_scan",
      title: "Quét Card Visit & Tài Liệu",
      subtitle: "Bóc tách danh thiếp bằng Camera, xuất dữ liệu ra Excel, Google Sheets, vCard",
      icon: "📇",
      type: "feature",
      action: () => {
        onSelectTab("card_scan");
        onClose();
      },
    },
    {
      id: "tarot",
      title: "Thầy Bói Bà Bà (Bói Tarot)",
      subtitle: "Xem quẻ bài Tarot huyền bí, thấu thị nhân duyên & lời giải thiên cơ",
      icon: "🔮",
      type: "feature",
      action: () => {
        onSelectTab("tarot");
        onClose();
      },
    },
    {
      id: "images",
      title: "Studio Tạo Ảnh 8K",
      subtitle: "Sáng tạo ảnh nghệ thuật chân thực chuẩn DSLR bằng Flux 1.1 Pro",
      icon: "🎨",
      type: "feature",
      action: () => {
        onSelectTab("images");
        onClose();
      },
    },
    {
      id: "toan",
      title: "Giải Toán AI",
      subtitle: "Máy tính khoa học đa năng, nhận diện đề qua ảnh & hướng dẫn từng bước",
      icon: "📐",
      type: "feature",
      action: () => {
        onSelectTab("toan");
        onClose();
      },
    },
    {
      id: "english",
      title: "Học Tiếng Anh AI",
      subtitle: "Lộ trình ngữ pháp, giao tiếp, bài tập & phản xạ trực tiếp 24/7",
      icon: "🇬🇧",
      type: "feature",
      action: () => {
        onSelectTab("english");
        onClose();
      },
    },
    {
      id: "healing",
      title: "Góc Chữa Lành (Healing ASMR)",
      subtitle: "Âm thanh thiên nhiên 3D, thiền định và tâm sự giải tỏa âu lo",
      icon: "🌿",
      type: "feature",
      action: () => {
        onSelectTab("healing");
        onClose();
      },
    },
    {
      id: "tuvi",
      title: "Lá Số Tử Vi",
      subtitle: "An sao lập lá số tử vi trọn đời, giải đoán vận hạn và cung số",
      icon: "📜",
      type: "feature",
      action: () => {
        onSelectTab("tuvi");
        onClose();
      },
    },
    {
      id: "tools",
      title: "Studio Công Cụ AI (Viết kịch bản, SEO, Marketing)",
      subtitle: "Kịch bản TikTok triệu view, bài viết chuẩn SEO, Shopee Content",
      icon: "⚡",
      type: "tool",
      action: () => {
        onSelectTab("tools");
        onClose();
      },
    },
    // Trợ lý nổi bật
    ...FEATURED_ASSISTANTS.map((ast) => ({
      id: `ast_${ast.id}`,
      title: ast.name,
      subtitle: ast.description,
      icon: "🤖",
      type: "assistant" as const,
      action: () => {
        router.push(`/chat/${ast.id}`);
        onClose();
      },
    })),
    // Nhân vật xu hướng
    ...TRENDING_CHARACTERS.map((char) => ({
      id: `char_${char.id}`,
      title: char.name,
      subtitle: char.description,
      icon: "🎭",
      type: "character" as const,
      action: () => {
        router.push(`/chat/${char.id}`);
        onClose();
      },
    })),
  ];

  // Lọc theo từ khóa tìm kiếm
  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Điều hướng bằng bàn phím
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#11131c] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
          <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tìm tính năng, trợ lý AI, quét danh thiếp, bói toán... (hoặc gõ để lọc)"
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Không tìm thấy tính năng hay trợ lý nào phù hợp với &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-cyan-300 border border-indigo-500/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-transparent"
                  }`}
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold shrink-0">
                    {isSelected ? "↵ Bấm vào" : ""}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#0c0e17] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ để chuyển</span>
            <span>↵ để chọn</span>
            <span>ESC để đóng</span>
          </div>
          <span>Biết Tuốt AI Smart Search</span>
        </div>
      </div>
    </div>
  );
}
