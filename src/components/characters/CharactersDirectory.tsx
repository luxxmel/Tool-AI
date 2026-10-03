"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CharacterItem } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";

export interface DirectoryCharacterItem extends CharacterItem {
  badge?: string;
  nameEn?: string;
  tagEn?: string;
  descriptionEn?: string;
  quote?: string;
}

const ALL_CHARACTERS: DirectoryCharacterItem[] = [
  {
    id: "char-luc-ngang-thien",
    name: "Lục Ngang Thiên",
    tag: "Nhập vai",
    avatar: "/characters/luc_can_phong.jpg",
    description: "Lục Ngang Thiên xoay nhẹ chiếc trâm ngọc trên tay, đôi mắt phượng hờ hững lướt qua người em...",
    quote: "Lục Ngang Thiên xoay nhẹ chiếc trâm ngọc trên tay, đôi mắt phượng hờ hững lướt qua...",
    author: "@omni_story",
    interactions: "612",
  },
  {
    id: "char-thac-bat-da",
    name: "Thác Bạt Dã",
    tag: "Fantasy",
    avatar: "/characters/thac_bat_da.jpg",
    description: "Bị trói chặt bằng xích sắt nặng nề trong lòng giam của chợ nô lệ, cả người đầy vết roi rỉ máu...",
    quote: "Bị trói chặt bằng xích sắt nặng nề trong lòng giam của chợ nô lệ, cả người đầy vết roi rỉ...",
    author: "@omni_story",
    interactions: "352",
  },
  {
    id: "char-bui-chi-dien",
    name: "Bùi Chi Diên",
    tag: "Lãng mạng",
    avatar: "/characters/bui_chi_dien.jpg",
    description: "Ngồi trên xe lăn bằng gỗ trầm hương, chiếc chăn mỏng đắp trên đôi chân gầy gò. Hắn khẽ ho...",
    quote: "Ngồi trên xe lăn bằng gỗ trầm hương, chiếc chăn mỏng đắp trên đôi chân gầy gò. Hắn...",
    author: "@omni_story",
    interactions: "153",
  },
  {
    id: "char-giang-da",
    name: "Giang Dã",
    tag: "Bạn trai",
    avatar: "/characters/co_da_than.jpg",
    description: "Tháo mũ bảo hiểm, hất mái tóc ướt đẫm mồ hôi, nhếch mép cười tựa người vào chiếc xe phân khối lớn...",
    quote: "Tháo mũ bảo hiểm, hất mái tóc ướt đẫm mồ hôi, nhếch mép cười tựa người vào chiếc...",
    author: "@omni_story",
    interactions: "585",
  },
  {
    id: "char-ma-ton-huyet-vo-nhai",
    name: "Ma Tôn Huyết Vô Nhai",
    tag: "Kinh dị",
    avatar: "/characters/tieu_viem.jpg",
    description: "Cười khẽ, vuốt ve một đóa bỉ ngạn rực đỏ * Nàng tỉnh rồi? Đừng sợ, xiềng xích này làm bằng...",
    quote: "Cười khẽ, vuốt ve một đóa bỉ ngạn rực đỏ * Nàng tỉnh rồi? Đừng sợ, xiềng xích này làm...",
    author: "@omni_story",
    interactions: "1.2K",
  },
  {
    id: "char-tham-da-han",
    name: "Thẩm Dạ Hàn",
    tag: "Đời thường",
    avatar: "/characters/tham_da_han.jpg",
    description: "Bản blog post và thiết kế visual em nộp chiều nay, tỷ lệ chuyển đổi dự kiến là bao nhiêu...",
    quote: "Bản blog post và thiết kế visual em nộp chiều nay, tỷ lệ chuyển đổi dự kiến là bao...",
    author: "@omni_story",
    interactions: "409",
  },
  {
    id: "char-mo-dung-ta",
    name: "Mộ Dung Tà",
    tag: "Anime",
    avatar: "/characters/mo_dung_ta.jpg",
    description: "Lười biếng dựa vào ghế trúc, vê vê cây kim châm cứu bằng bạc sáng loáng trên đầu ngón tay...",
    quote: "Lười biếng dựa vào ghế trúc, vê vê cây kim châm cứu bằng bạc sáng loáng trên đầu ngó...",
    author: "@omni_story",
    interactions: "99",
  },
  {
    id: "char-du-ma-hai",
    name: "Dư Mã Hải",
    tag: "Nhập vai",
    avatar: "/characters/du_ma_hai.jpg",
    description: "Vừa bước ra từ phòng thẩm vấn, trên vạt áo lụa đỏ sẫm vẫn còn vương vãi giọt máu tươi...",
    quote: "Vừa bước ra từ phòng thẩm vấn, trên vạt áo lụa đỏ sẫm vẫn còn vương vãi giọt máu...",
    author: "@omni_story",
    interactions: "83",
  },
  {
    id: "char-ho-nguyet-bach",
    name: "Hồ Nguyệt Bạch",
    tag: "Fantasy",
    avatar: "/characters/ho_nguyet_bach.jpg",
    description: "Nằm ươn trên chiếc thuyền gấm lót lông thú, vạt áo lụa đỏ trễ nãi lộ ra xương quai xanh...",
    quote: "Nằm ươn trên chiếc thuyền gấm lót lông thú, vạt áo lụa đỏ trễ nãi lộ ra xương quai xan...",
    author: "@omni_story",
    interactions: "189",
  },
  {
    id: "char-nha-an",
    name: "Nhã An",
    tag: "Bạn gái",
    avatar: "/characters/tam_an.jpg",
    description: "Nhã An lén lút lút vào phòng, dùng ngón tay chọc nhẹ vào eo bạn rồi cười khúc khích...",
    quote: "Nhã An lén lút lút vào phòng, dùng ngón tay chọc nhẹ vào eo bạn rồi cười khúc khích....",
    author: "@omni_story",
    interactions: "239",
  },
  {
    id: "char-chu-tue-nguyet",
    name: "Chu Tuệ Nguyệt",
    tag: "Anime",
    avatar: "/characters/chu_tue_nguyet.jpg",
    description: "Chu Tuệ Nguyệt nhẹ nhàng đặt cây đàn tỳ bà xuống bàn trà, ánh mắt dịu dàng quan sát...",
    quote: "Chu Tuệ Nguyệt nhẹ nhàng đặt cây đàn tỳ bà xuống bàn trà, ánh mắt dịu dàng quan...",
    author: "@omni_story",
    interactions: "76",
  },
  {
    id: "char-co-yen-thanh",
    name: "Cố Yến Thanh",
    tag: "Trường học",
    avatar: "/characters/co_yen_thanh.jpg",
    description: "Gửi một bức ảnh bị xước nhẹ ở tay. Hình như lúc nãy quay cảnh hành động anh vô tình...",
    quote: "Gửi một bức ảnh bị xước nhẹ ở tay Hình như lúc nãy quay cảnh hành động anh vô tính...",
    author: "@omni_story",
    interactions: "5.3K",
  },
];

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "Anime", label: "Anime" },
  { id: "K-pop", label: "K-pop" },
  { id: "Fantasy", label: "Fantasy" },
  { id: "Kinh dị", label: "Kinh dị" },
  { id: "Hài hước", label: "Hài hước" },
  { id: "Bạn trai", label: "Bạn trai" },
  { id: "Bạn gái", label: "Bạn gái" },
  { id: "Lãng mạng", label: "Lãng mạng" },
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

  const filteredCharacters = ALL_CHARACTERS.filter((char) => {
    const matchCat = selectedCat === "all" || char.tag === selectedCat;
    const matchSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-full max-w-full flex flex-col items-center px-2 sm:px-6">
      {/* Top Full-Width Search Input */}
      <div className="w-full mb-6">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhân vật hoặc kịch bản..."
            className="w-full pl-10 pr-4 py-3 bg-[#12131a] dark:bg-[#0e1017] border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-slate-700 transition-all shadow-inner"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2"
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

      {/* Category Pills Slider Bar */}
      <div className="w-full mb-8 overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === cat.id
                ? "bg-white text-black shadow-md font-semibold"
                : "bg-[#181a24] text-slate-400 hover:text-white hover:bg-[#202330]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Section 1: Nổi bật */}
      <div className="w-full mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Nổi bật</h2>
        </div>

        {/* Poster Card Grid: 6 columns per row on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredCharacters.map((char) => (
            <Link
              key={char.id}
              href={`/chat/${char.id}`}
              onClick={() => router.push(`/chat/${char.id}`)}
              className="group relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-[#141622] border border-slate-800/80 hover:border-slate-600 transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02] cursor-pointer flex flex-col justify-end"
            >
              {/* Full Card Background Image */}
              <img
                src={char.avatar}
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
              <div className="relative z-10 p-3 text-white flex flex-col justify-end">
                {/* Character Name */}
                <h3 className="text-sm font-bold text-white drop-shadow-md truncate mb-0.5">
                  {char.name}
                </h3>

                {/* Character Description Quote Snippet */}
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight italic font-normal drop-shadow-sm mb-2 opacity-90">
                  {char.quote || char.description}
                </p>

                {/* Interaction count stats bottom row */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-mono text-slate-300">{char.interactions}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 2: Thịnh hành */}
      <div className="w-full mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Thịnh hành</h2>
        </div>

        {/* Poster Card Grid: 6 columns per row on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredCharacters.slice(0, 6).map((char) => (
            <Link
              key={`trending-${char.id}`}
              href={`/chat/${char.id}`}
              onClick={() => router.push(`/chat/${char.id}`)}
              className="group relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-[#141622] border border-slate-800/80 hover:border-slate-600 transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02] cursor-pointer flex flex-col justify-end"
            >
              <img
                src={char.avatar}
                alt={char.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/characters/luc_can_phong.jpg";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10 p-3 text-white flex flex-col justify-end">
                <h3 className="text-sm font-bold text-white drop-shadow-md truncate mb-0.5">
                  {char.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight italic font-normal drop-shadow-sm mb-2 opacity-90">
                  {char.quote || char.description}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-mono text-slate-300">{char.interactions}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
