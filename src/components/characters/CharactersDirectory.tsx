"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CharacterItem, TRENDING_CHARACTERS } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";
import CharacterDetailModal from "@/components/characters/CharacterDetailModal";

export interface DirectoryCharacterItem extends CharacterItem {
  badge?: string;
  nameEn?: string;
  tagEn?: string;
  descriptionEn?: string;
  quote?: string;
}

const ALL_CHARACTERS: DirectoryCharacterItem[] = TRENDING_CHARACTERS.map((c) => ({
  ...c,
  quote: c.description,
}));

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "Anime", label: "Anime" },
  { id: "K-pop", label: "K-pop" },
  { id: "Idol", label: "Idol" },
  { id: "Cyberpunk", label: "Cyberpunk" },
  { id: "Cổ trang", label: "Cổ trang" },
  { id: "Fantasy", label: "Fantasy" },
  { id: "Kinh dị", label: "Kinh dị" },
  { id: "Hài hước", label: "Hài hước" },
  { id: "Bạn trai", label: "Bạn trai" },
  { id: "Bạn gái", label: "Bạn gái" },
  { id: "Lãng mạn", label: "Lãng mạn" },
  { id: "Bá đạo", label: "Bá đạo" },
  { id: "Thể thao", label: "Thể thao" },
  { id: "Tâm lý", label: "Tâm lý" },
  { id: "Phiêu lưu", label: "Phiêu lưu" },
  { id: "Tâm sự", label: "Tâm sự" },
  { id: "Học tập", label: "Học tập" },
  { id: "Tâm linh", label: "Tâm linh" },
  { id: "Nhập vai", label: "Nhập vai" },
  { id: "Trường học", label: "Trường học" },
  { id: "Đời thường", label: "Đời thường" },
];

export default function CharactersDirectory() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChar, setSelectedChar] = useState<DirectoryCharacterItem | null>(null);

  const filteredCharacters = ALL_CHARACTERS.filter((char) => {
    const matchCat = selectedCat === "all" || char.tag === selectedCat;
    const matchSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-full min-h-screen flex flex-col px-3 sm:px-6 lg:px-8 pb-16">
      {/* Top Search Input (Full width, hiện đại và thanh lịch) */}
      <div className="w-full mb-3.5">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhân vật, danh xưng hoặc kịch bản truyện..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#12131a] dark:bg-[#0e1017] border border-slate-800/90 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/60 transition-all shadow-inner"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
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

      {/* Category Pills Slider Bar (Thanh trượt danh mục phủ đầy đủ) */}
      <div className="w-full mb-4 overflow-x-auto pb-1.5 scrollbar-none flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === cat.id
                ? "bg-white text-black shadow-md font-semibold"
                : "bg-[#181a24] text-slate-400 hover:text-white hover:bg-[#202330]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Title & Count Header */}
      <div className="w-full flex items-center justify-between mb-3.5 px-0.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>✨</span>
            <span>{selectedCat === "all" ? "Tất cả nhân vật truyện" : `Nhân vật: ${selectedCat}`}</span>
          </h2>
          <span className="text-[11px] font-medium text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50">
            {filteredCharacters.length} nhân vật
          </span>
        </div>
      </div>

      {/* Fluid Responsive Grid: Full màn hình 100%, tự động co giãn thích ứng theo kích thước thiết bị & mức zoom */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3 sm:gap-4 lg:gap-5">
        {filteredCharacters.map((char) => {
          // Bổ sung cache buster ?v=3 để trình duyệt luôn tải ảnh 3D Cinematic mới nhất, không bị lưu cache anime cũ
          const freshAvatar = char.avatar
            ? `${char.avatar}${char.avatar.includes("?") ? "&" : "?"}v=3`
            : "/characters/luc_can_phong.jpg";

          return (
            <div
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className="group relative aspect-[3/3.8] rounded-2xl overflow-hidden bg-[#141622] border border-slate-800/80 hover:border-cyan-500/80 transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02] cursor-pointer flex flex-col justify-end"
            >
              {/* Full Card Background Image */}
              <img
                src={freshAvatar}
                alt={char.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/characters/luc_can_phong.jpg";
                }}
              />

              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

              {/* Card Content Overlay at bottom */}
              <div className="relative z-10 p-2.5 sm:p-3 text-white flex flex-col justify-end">
                {/* Character Name */}
                <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-md truncate mb-0.5 group-hover:text-cyan-300 transition-colors">
                  {char.name}
                </h3>

                {/* Character Description Quote Snippet */}
                <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 sm:line-clamp-2 leading-tight italic font-normal drop-shadow-sm mb-2 opacity-90">
                  {char.quote || char.description}
                </p>

                {/* Interaction count stats bottom row */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="font-mono text-slate-300">{char.interactions}</span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-cyan-300 font-medium border border-white/10">
                    {char.tag}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Character Story Detail & Persona Onboarding Modal */}
      {selectedChar && (
        <CharacterDetailModal
          characterId={selectedChar.id}
          fallbackName={selectedChar.name}
          fallbackAvatar={selectedChar.avatar ? `${selectedChar.avatar}${selectedChar.avatar.includes("?") ? "&" : "?"}v=3` : undefined}
          isOpen={!!selectedChar}
          onClose={() => setSelectedChar(null)}
        />
      )}
    </div>
  );
}
