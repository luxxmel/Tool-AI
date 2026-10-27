import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

// Nhóm danh mục thực tế dựa trên dữ liệu nhân vật truyện
const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "Cổ trang", label: "Cổ trang & Tiên hiệp" },
  { id: "Fantasy", label: "Huyền huyễn & Fantasy" },
  { id: "Bá đạo", label: "Tổng tài & Bá đạo" },
  { id: "Bạn trai", label: "Bạn trai & Lãng mạn" },
  { id: "Bạn gái", label: "Bạn gái & Đời thường" },
  { id: "Trường học", label: "Trường học & Thanh xuân" },
  { id: "Cyberpunk", label: "Cyberpunk & Khoa học" },
  { id: "Kinh dị", label: "Kinh dị & Ma đạo" },
  { id: "Idol", label: "Thần tượng & Showbiz" },
  { id: "Phiêu lưu", label: "Phiêu lưu & Hành động" },
  { id: "Tâm lý", label: "Tâm lý & Chữa lành" },
  { id: "Thể thao", label: "Thể thao & Nam thần" },
];

export default function CharactersDirectory() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChar, setSelectedChar] = useState<DirectoryCharacterItem | null>(null);

  const filteredCharacters = ALL_CHARACTERS.filter((char) => {
    let matchCat = selectedCat === "all";
    if (!matchCat) {
      if (selectedCat === "Cổ trang") matchCat = char.tag === "Cổ trang" || char.tag === "Nhập vai";
      else if (selectedCat === "Fantasy") matchCat = char.tag === "Fantasy";
      else if (selectedCat === "Bá đạo") matchCat = char.tag === "Bá đạo" || char.name.includes("Tổng Tài");
      else if (selectedCat === "Bạn trai") matchCat = char.tag === "Bạn trai" || char.tag === "Lãng mạn";
      else if (selectedCat === "Bạn gái") matchCat = char.tag === "Bạn gái" || char.tag === "Đời thường";
      else if (selectedCat === "Trường học") matchCat = char.tag === "Trường học" || char.tag === "Anime";
      else if (selectedCat === "Cyberpunk") matchCat = char.tag === "Cyberpunk";
      else if (selectedCat === "Kinh dị") matchCat = char.tag === "Kinh dị";
      else if (selectedCat === "Idol") matchCat = char.tag === "Idol";
      else if (selectedCat === "Phiêu lưu") matchCat = char.tag === "Phiêu lưu";
      else if (selectedCat === "Tâm lý") matchCat = char.tag === "Tâm lý";
      else if (selectedCat === "Thể thao") matchCat = char.tag === "Thể thao";
      else matchCat = char.tag === selectedCat;
    }

    const matchSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-full min-h-screen flex flex-col px-3 sm:px-6 lg:px-8 pb-16">
      {/* Top Search Input */}
      <div className="w-full mb-4">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhân vật, danh xưng hoặc kịch bản truyện..."
            className="w-full pl-11 pr-4 py-3 bg-[#111420]/80 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/60 transition-all shadow-inner"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs: Flex Wrap tự nhiên, không bị xén chữ, không thanh trượt */}
      <div className="w-full mb-6 flex flex-wrap items-center gap-2 sm:gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                isSelected
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/10 font-semibold"
                  : "bg-[#141624]/90 text-slate-400 border-slate-800/80 hover:text-white hover:border-slate-700 hover:bg-[#1c1f32]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Title & Count Header */}
      <div className="w-full flex items-center justify-between mb-4 px-0.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>✨</span>
            <span>
              {selectedCat === "all"
                ? "Tất cả nhân vật truyện"
                : `${CATEGORIES.find((c) => c.id === selectedCat)?.label || selectedCat}`}
            </span>
          </h2>
          <span className="text-[11px] font-semibold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50">
            {filteredCharacters.length} nhân vật
          </span>
        </div>
      </div>

      {/* Fluid Responsive Grid: Tự động xuống dòng khi màn hình co giãn, tỉ lệ poster 3:4.2 chuẩn tiểu thuyết */}
      {filteredCharacters.length === 0 ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center">
          <p className="text-slate-400 text-sm mb-2">Không tìm thấy nhân vật nào phù hợp.</p>
          <button
            onClick={() => {
              setSelectedCat("all");
              setSearchQuery("");
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            Xem lại tất cả nhân vật
          </button>
        </div>
      ) : (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-4.5">
          {filteredCharacters.map((char) => {
            const avatarSrc = char.avatar || "/characters/luc_can_phong.jpg";

            return (
              <div
                key={char.id}
                onClick={() => setSelectedChar(char)}
                className="group relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-[#121422] border border-slate-800/80 hover:border-cyan-500/80 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-end"
              >
                {/* Full Card Background Image */}
                <img
                  src={avatarSrc}
                  alt={char.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/characters/luc_can_phong.jpg";
                  }}
                />

                {/* Dark Gradient Overlay for optimal readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* Top Badge: Tag thể loại */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-xs">
                    {char.tag}
                  </span>
                </div>

                {/* Card Content Overlay at bottom */}
                <div className="relative z-10 p-3 text-white flex flex-col justify-end">
                  {/* Character Name */}
                  <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-md truncate mb-1 group-hover:text-cyan-300 transition-colors">
                    {char.name}
                  </h3>

                  {/* Character Description Quote Snippet */}
                  <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-2 leading-tight italic font-normal drop-shadow-sm mb-2 opacity-90">
                    {char.quote || char.description}
                  </p>

                  {/* Interaction count stats bottom row */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="font-mono text-slate-300">{char.interactions || "1.2K"}</span>
                    </div>

                    <span className="text-[10px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Trò chuyện →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Story Detail & Persona Onboarding Modal */}
      {selectedChar && (
        <CharacterDetailModal
          characterId={selectedChar.id}
          fallbackName={selectedChar.name}
          fallbackAvatar={selectedChar.avatar}
          isOpen={!!selectedChar}
          onClose={() => setSelectedChar(null)}
        />
      )}
    </div>
  );
}
