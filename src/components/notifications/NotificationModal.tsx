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

export const SYSTEM_ANNOUNCEMENTS: AnnouncementItem[] = [];

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead?: () => void;
  announcements?: any[];
}

export default function NotificationModal({
  isOpen,
  onClose,
  onMarkAllAsRead,
  announcements: propAnnouncements,
}: NotificationModalProps) {
  const { language } = useLanguage();
  const [items, setItems] = React.useState<any[]>(propAnnouncements || []);

  React.useEffect(() => {
    if (propAnnouncements) {
      setItems(propAnnouncements);
      return;
    }

    // Tự động lấy danh sách thông báo mới nhất từ API hệ thống
    const fetchLiveAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const data = await res.json();
          if (data.announcements && Array.isArray(data.announcements)) {
            setItems(data.announcements);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải thông báo hệ thống:", err);
      }
    };

    if (isOpen) {
      fetchLiveAnnouncements();
    }
  }, [isOpen, propAnnouncements]);

  if (!isOpen) return null;

  const handleMarkReadAndClose = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    onClose();
  };

  const announcements = items;

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
          {announcements.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#181a28] flex items-center justify-center text-2xl mb-3 text-slate-400">
                📭
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === "en" ? "No announcements yet" : "Chưa có thông báo nào"}
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                {language === "en"
                  ? "Stay tuned! Any system updates or events will appear right here."
                  : "Các thông báo và sự kiện mới từ hệ thống sẽ xuất hiện tại đây khi được đăng tải."}
              </p>
            </div>
          ) : (
            announcements.map((item) => {
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
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={handleMarkReadAndClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {language === "en" ? "Got it" : "Đã xem hết"}
          </button>
        </div>
      </div>
    </div>
  );
}
