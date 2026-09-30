"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export interface AnnouncementItem {
  id: number;
  type: "new_feature" | "event" | "tip";
  emoji: string;
  tag: string;
  tagEn?: string;
  tagColor?: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  cta?: string;
  ctaEn?: string;
  ctaHref?: string;
  bg?: string;
  accent?: string;
  image?: string;
}

export const SYSTEM_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 1,
    type: "new_feature",
    emoji: "✨",
    tag: "Tính năng mới",
    tagEn: "New Feature",
    tagColor: "from-violet-600 to-indigo-600",
    title: "Ra mắt TTS Neural tiếng Việt chuẩn phim!",
    titleEn: "Cinema-Grade Neural TTS Voice is Live!",
    desc: "Giọng đọc AI Neural cực kỳ tự nhiên, hỗ trợ 3 giọng: Tổng tài, Nữ truyền cảm, Nữ ngọt ngào. Thử ngay trong khung chat!",
    descEn: "Ultra-natural AI Neural voice reader with 3 expressive tones. Try it out right in the chat room!",
    cta: "Thử ngay →",
    ctaEn: "Try Now →",
    ctaHref: "#",
    bg: "from-violet-950/80 via-indigo-950/80 to-slate-950/90",
    accent: "border-violet-500/40",
    image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    type: "event",
    emoji: "🎉",
    tag: "Sự kiện tháng 10",
    tagEn: "October Event",
    tagColor: "from-rose-600 to-orange-500",
    title: "Thử thách Prompt AI — Giải thưởng 500K VND!",
    titleEn: "AI Prompt Contest — Win 500K VND Prizes!",
    desc: "Tham gia cuộc thi tạo prompt sáng tạo nhất trong tháng 10. Bài tốt nhất được ghim trang chủ và nhận thưởng từ đội ngũ OmniAI.",
    descEn: "Participate in the most creative AI prompt contest. Top submissions will be featured on homepage with rewards.",
    cta: "Đăng bài dự thi →",
    ctaEn: "Submit Entry →",
    ctaHref: "#",
    bg: "from-rose-950/80 via-orange-950/70 to-slate-950/90",
    accent: "border-rose-500/40",
    image: "https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    type: "tip",
    emoji: "💡",
    tag: "Mẹo hay",
    tagEn: "Pro Tip",
    tagColor: "from-amber-500 to-yellow-500",
    title: "Dùng Magic Wand ✨ để nâng cấp prompt của bạn",
    titleEn: "Use Magic Wand ✨ to Supercharge Your Prompts",
    desc: "Chức năng Magic Wand tự động cải thiện câu hỏi của bạn thành prompt chuyên nghiệp, giúp AI hiểu đúng ý hơn. Thử trong khung chat bây giờ!",
    descEn: "Magic Wand automatically refines your query into a professional prompt for higher AI precision. Try it in chat now!",
    cta: "Xem hướng dẫn →",
    ctaEn: "Learn More →",
    ctaHref: "#",
    bg: "from-amber-950/70 via-yellow-950/60 to-slate-950/90",
    accent: "border-amber-500/40",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&auto=format&fit=crop&q=80",
  },
];

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements?: AnnouncementItem[];
}

export default function NotificationModal({
  isOpen,
  onClose,
  announcements = SYSTEM_ANNOUNCEMENTS,
}: NotificationModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#12141f] border border-slate-200 dark:border-indigo-900/60 rounded-3xl p-6 shadow-2xl shadow-indigo-950/40 animate-in zoom-in-95 duration-200 space-y-4 max-h-[88vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-cyan-400 flex items-center justify-center text-lg shadow-inner">
              🔔
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === "en" ? "System Notifications" : "Thông báo hệ thống"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {announcements.length} {language === "en" ? "updates & announcements" : "thông báo & sự kiện mới"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* List of Announcements */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
          {announcements.map((item) => {
            const tag = language === "en" ? item.tagEn || item.tag : item.tag;
            const title = language === "en" ? item.titleEn || item.title : item.title;
            const desc = language === "en" ? item.descEn || item.desc : item.desc;
            const cta = language === "en" ? item.ctaEn || item.cta : item.cta;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#181a27] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20">
                      {tag}
                    </span>
                  </div>
                  {item.type === "new_feature" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      NEW
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                    {title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {desc}
                  </p>
                </div>

                {cta && (
                  <div className="pt-1 flex justify-end">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer">
                      {cta}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {language === "en" ? "Got it" : "Đã xem hết"}
          </button>
        </div>
      </div>
    </div>
  );
}
