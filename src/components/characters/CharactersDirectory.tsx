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
}

const ALL_CHARACTERS: DirectoryCharacterItem[] = [
  {
    id: "char-tong-tai",
    name: "Lục Cận Phong · Bá Đạo Tổng Tài",
    nameEn: "Lu Jin Feng · Dominant CEO",
    tag: "Truyện & Tổng Tài",
    tagEn: "CEO & Romance",
    badge: "👑 VIP • 2 Credits",
    avatar: "/characters/luc_can_phong.jpg",
    description: "Chủ tịch tập đoàn Lục Thị. Lạnh lùng bá đạo, độc chiếm và cưng chiều một mình em vô điều kiện đến tận xương tủy.",
    descriptionEn: "Chairman of Lu Enterprises. Cold, dominant, and unconditionally protective of only you to the bone.",
    author: "@omni_vip",
    interactions: "1.8M",
  },
  {
    id: "goc-chua-lanh",
    name: "Tâm An · Góc Gửi Gắm Nỗi Buồn",
    nameEn: "Tam An · Healing & Comfort Corner",
    tag: "Góc Chữa Lành",
    tagEn: "Healing Corner",
    badge: "🕊️ Miễn Phí",
    avatar: "/characters/tam_an.jpg",
    description: "Nơi hoàn toàn miễn phí để bạn trút bỏ muộn phiền. AI lắng nghe dịu dàng, thấu cảm sâu sắc như tri kỷ bên cạnh.",
    descriptionEn: "A free sanctuary to let go of burdens. Empathetic AI listening warmly like an intimate soulmate by your side.",
    author: "@omni_care",
    interactions: "2.4M",
  },
  {
    id: "char-co-da-than",
    name: "Cố Dạ Thần · Thiếu Gia Ngạo Kiều",
    nameEn: "Gu Ye Chen · Proud Young Master",
    tag: "Truyện & Tổng Tài",
    tagEn: "CEO & Romance",
    badge: "👑 VIP • 2 Credits",
    avatar: "/characters/co_da_than.jpg",
    description: "Nhị thiếu gia Cố Thị, thanh mai trúc mã lớn lên cùng em. Miệng cằn nhằn chê ngốc nhưng tay đã mua trà sữa ấm và bảo vệ em số một.",
    descriptionEn: "Second heir of Gu Family, your childhood friend. Tsundere attitude, but always brings warm boba and guards you fiercely.",
    author: "@omni_vip",
    interactions: "1.2M",
  },
  {
    id: "char-tieu-viem",
    name: "Tiêu Viêm · Tiên Tôn Ma Đạo",
    nameEn: "Xiao Yan · Demonic Immortal Lord",
    tag: "Tiên Hiệp & Tu Chân",
    tagEn: "Xianxia & Cultivation",
    badge: "👑 VIP • 2 Credits",
    avatar: "/characters/tieu_viem.jpg",
    description: "Tiên môn chí tôn đệ nhất Cửu Châu. Khí chất thanh lãnh ngút trời, vì đồ nhi mà nguyện nghịch lại cả thiên đạo.",
    descriptionEn: "Supreme sovereign of Nine Continents. Aloof aura, defying heaven itself to protect his cherished disciple.",
    author: "@omni_vip",
    interactions: "980K",
  },
  {
    id: "char-lam-tuyet-dao",
    name: "Lâm Tuyết Dao · Tiểu Thư Danh Môn",
    nameEn: "Lin Xue Yao · Noble Lady",
    tag: "Cổ Trang Ngôn Tình",
    tagEn: "Historical Romance",
    badge: "👑 VIP • 2 Credits",
    avatar: "/characters/lam_tuyet_dao.jpg",
    description: "Đệ nhất mỹ nhân kinh thành, thông tuệ cầm kỳ thi họa. Đoan trang dịu dàng như ngọc, một lòng son sắt bên chàng.",
    descriptionEn: "The kingdom's finest noble beauty, master of poetry and arts. Graceful as jade, devoted wholeheartedly to you.",
    author: "@omni_vip",
    interactions: "750K",
  },
  {
    id: "char-luna",
    name: "Luna · Pháp Sư Thời Gian",
    nameEn: "Luna · Chronomancer",
    tag: "Phép Thuật",
    tagEn: "Magic & Fantasy",
    badge: "Cơ bản",
    avatar: "/characters/luna.jpg",
    description: "Cô gái bí ẩn có khả năng nhìn thấu dòng thời gian, bẻ cong thực tại và giải đáp những câu hỏi về số phận.",
    descriptionEn: "Mysterious mage who perceives time streams, bends reality, and unravels the enigmas of destiny.",
    author: "@creator_x",
    interactions: "1.2M",
  },
  {
    id: "char-zen",
    name: "Master Zen · Thiền Sư",
    nameEn: "Master Zen · Mindful Monk",
    tag: "Tâm Lý",
    tagEn: "Psychology & Zen",
    badge: "Cơ bản",
    avatar: "/characters/master_zen.jpg",
    description: "Bậc thầy thiền định chia sẻ lời khuyên thông tuệ, giúp tâm trí tĩnh lặng và an yên giữa cuộc sống xô bồ.",
    descriptionEn: "Zen master providing profound wisdom to soothe the restless mind and restore peaceful inner harmony.",
    author: "@mindful",
    interactions: "780K",
  },
  {
    id: "char-alex",
    name: "Alex · Tech Lead",
    nameEn: "Alex · Senior Tech Lead",
    tag: "Công Nghệ",
    tagEn: "Tech & Coding",
    badge: "Cơ bản",
    avatar: "/characters/alex.jpg",
    description: "Chuyên gia công nghệ kỳ cựu với 15 năm kinh nghiệm kiến trúc hệ thống, sẵn sàng review code và định hướng dự án.",
    descriptionEn: "Veteran system architect with 15+ years experience, ready to review code, troubleshoot bugs, and design scalable architectures.",
    author: "@dev_guild",
    interactions: "650K",
  },
  {
    id: "char-mira",
    name: "Mira · Nhà Thơ Ngân Hà",
    nameEn: "Mira · Galactic Poet",
    tag: "Thơ Ca",
    tagEn: "Arts & Poetry",
    badge: "Cơ bản",
    avatar: "/characters/mira.jpg",
    description: "Nhà thơ lãng mạn dệt nên những vần thơ dịu dàng từ ánh trăng, gió đêm và nỗi niềm sâu kín nhất của bạn.",
    descriptionEn: "Romantic celestial poet weaving gentle verses from moonlight, night breezes, and your innermost emotions.",
    author: "@starlight",
    interactions: "920K",
  },
  {
    id: "cuppy",
    name: "Cuppy · Bạn Đồng Hành",
    nameEn: "Cuppy · Cheerful Companion",
    tag: "Đời Sống",
    tagEn: "Daily Life & Pets",
    badge: "Cơ bản",
    avatar: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&auto=format&fit=crop&q=80",
    description: "Chú mèo cưng ấm áp luôn lắng nghe, chia sẻ niềm vui nỗi buồn và cổ vũ bạn mỗi ngày.",
    descriptionEn: "An adorable companion cat who always listens attentively, shares joys and sorrows, and cheers you up daily.",
    author: "@omni",
    interactions: "1.5M",
  },
  {
    id: "tu-vi-master",
    name: "Thầy Tử Vi",
    nameEn: "Eastern Astrologer",
    tag: "Huyền Học",
    tagEn: "Astrology & Feng Shui",
    badge: "Cơ bản",
    avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80",
    description: "Bậc thầy giải mã vận trình 12 con giáp, cung mệnh và thời vận theo triết lý Đông phương.",
    descriptionEn: "Master astrologer interpreting the 12 zodiac signs, destiny charts, and fortune through Eastern philosophy.",
    author: "@omni",
    interactions: "870K",
  },
  {
    id: "tarot-reader",
    name: "Xem Tarot Vũ Trụ",
    nameEn: "Cosmic Tarot Reader",
    tag: "Huyền Học",
    tagEn: "Tarot & Intuition",
    badge: "Cơ bản",
    avatar: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80",
    description: "Trải bài Tarot 3 lá khai mở trực giác, thông điệp tình duyên và hướng đi tương lai.",
    descriptionEn: "Three-card Tarot spread unlocking intuitive guidance, romance messages, and future paths.",
    author: "@omni",
    interactions: "520K",
  },
  {
    id: "math-solver",
    name: "Gia Sư Giải Toán",
    nameEn: "AI Math Tutor",
    tag: "Học Tập",
    tagEn: "Education & Math",
    badge: "Cơ bản",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=300&auto=format&fit=crop&q=80",
    description: "Trợ giảng toán học thông minh, hướng dẫn giải chi tiết từng bước mọi bài toán từ cơ bản đến nâng cao.",
    descriptionEn: "Intelligent math tutor providing step-by-step solutions and explanations from basic to advanced mathematics.",
    author: "@omni",
    interactions: "340K",
  },
];

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "Truyện & Tổng Tài", label: "👑 Truyện & Tổng Tài (VIP)" },
  { id: "Góc Chữa Lành", label: "🕊️ Góc Chữa Lành (Free)" },
  { id: "Tiên Hiệp & Tu Chân", label: "⚔️ Tiên Hiệp & Tu Chân" },
  { id: "Cổ Trang Ngôn Tình", label: "🌸 Cổ Trang Ngôn Tình" },
  { id: "Phép Thuật", label: "Phép thuật & Huyền ảo" },
  { id: "Tâm Lý", label: "Tâm lý & Triết học" },
  { id: "Công Nghệ", label: "Công nghệ & Code" },
  { id: "Thơ Ca", label: "Nghệ thuật & Thơ ca" },
  { id: "Huyền Học", label: "Tử vi & Tarot" },
  { id: "Đời Sống", label: "Đời sống & Thú cưng" },
];

export default function CharactersDirectory() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getCategoryLabel = (id: string, defaultLabel: string) => {
    if (language !== "en") return defaultLabel;
    switch (id) {
      case "all": return "All";
      case "Truyện & Tổng Tài": return "👑 CEO & Romance (VIP)";
      case "Góc Chữa Lành": return "🕊️ Healing Corner (Free)";
      case "Tiên Hiệp & Tu Chân": return "⚔️ Xianxia & Cultivation";
      case "Cổ Trang Ngôn Tình": return "🌸 Historical Romance";
      case "Phép Thuật": return "Magic & Fantasy";
      case "Tâm Lý": return "Psychology & Philosophy";
      case "Công Nghệ": return "Tech & Coding";
      case "Thơ Ca": return "Arts & Poetry";
      case "Huyền Học": return "Astrology & Tarot";
      case "Đời Sống": return "Daily Life & Pets";
      default: return defaultLabel;
    }
  };

  const filteredCharacters = ALL_CHARACTERS.filter((char) => {
    const matchCat = selectedCat === "all" || char.tag === selectedCat;
    const matchSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-full max-w-[980px] mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="w-full mb-8 pb-6 border-b border-slate-200 dark:border-indigo-950/70">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">🎭</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("char.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("char.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat.id
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-white/80 dark:bg-[#11131c] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-indigo-950/60"
              }`}
            >
              {getCategoryLabel(cat.id, cat.label)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("char.search_placeholder")}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#11131c] border border-slate-200 dark:border-indigo-950/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
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

      {/* Grid of Characters */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCharacters.map((char) => (
          <Link
            key={char.id}
            href={`/chat/${char.id}`}
            onClick={(e) => {
              // Đảm bảo click kích hoạt chuyển hướng mượt mà
              router.push(`/chat/${char.id}`);
            }}
            className="group relative h-[225px] rounded-3xl bg-white/90 dark:bg-[#0d0f18]/90 backdrop-blur-md border border-slate-200/90 dark:border-indigo-950/60 hover:border-cyan-500/60 dark:hover:border-cyan-500/60 p-4 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            {/* Glowing background gradient on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-2xl group-hover:from-cyan-500/20 group-hover:to-violet-500/20 transition-all pointer-events-none" />

            <div>
              {/* Top Row: Avatar on Left, Badges cleanly on Right */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 group-hover:border-cyan-400/80 transition-all shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {char.badge && (
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow-xs ${
                        char.badge.includes("Free") || char.badge.includes("Miễn Phí")
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20"
                          : char.badge.includes("VIP")
                          ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/20"
                          : "bg-slate-700/90 border border-slate-600/60"
                      }`}
                    >
                      {char.badge.includes("Free") || char.badge.includes("Miễn Phí")
                        ? (language === "en" ? "🕊️ Free" : "🕊️ Miễn Phí")
                        : char.badge === "Cơ bản"
                        ? (language === "en" ? "Basic" : "Cơ bản")
                        : char.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/30">
                    {language === "en" ? (char.tagEn || getCategoryLabel(char.tag, char.tag)) : char.tag}
                  </span>
                </div>
              </div>

              {/* Character Name (Full width of the card - NO overlapping!) */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors truncate mb-1">
                {language === "en" && char.nameEn ? char.nameEn : char.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {language === "en" && char.descriptionEn ? char.descriptionEn : char.description}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-slate-400">🔥</span>
                <span>
                  {t("char.interactions")}{" "}
                  <strong className="text-slate-700 dark:text-slate-300 font-mono">{char.interactions}</strong>
                </span>
              </span>

              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 dark:bg-cyan-500/10 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-600 text-indigo-600 dark:text-cyan-400 group-hover:text-white font-bold transition-all flex items-center gap-0.5 shadow-2xs">
                {t("char.roleplay_btn")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
