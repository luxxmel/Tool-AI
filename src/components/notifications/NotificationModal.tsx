"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

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

export interface AuthorNotificationItem {
  id: string;
  title: string;
  content: string;
  type: "APPROVED" | "REJECTED" | "REWARD";
  isRead: boolean;
  createdAt: string;
}

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
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"system" | "personal">("personal");
  const [items, setItems] = useState<any[]>(propAnnouncements || []);
  const [personalNotifs, setPersonalNotifs] = useState<AuthorNotificationItem[]>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);

  useEffect(() => {
    if (propAnnouncements) {
      setItems(propAnnouncements);
      return;
    }

    // Tự động lấy danh sách thông báo hệ thống mới nhất
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

  // Lấy danh sách thông báo cá nhân (Tiền về ví, duyệt rút tiền, duyệt truyện, v.v.)
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user) {
      setActiveTab("system");
      return;
    }

    const fetchPersonalNotifications = async () => {
      try {
        setIsLoadingPersonal(true);
        const res = await fetch(`/api/stories/notifications?userId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.notifications)) {
            setPersonalNotifs(data.notifications);
            if (data.notifications.length > 0) {
              setActiveTab("personal");
            } else {
              setActiveTab("system");
            }
          }
        }
      } catch (e) {
        console.error("Lỗi tải thông báo cá nhân:", e);
      } finally {
        setIsLoadingPersonal(false);
      }
    };

    fetchPersonalNotifications();
  }, [isOpen, isAuthenticated, user]);

  if (!isOpen) return null;

  const handleMarkReadAndClose = async () => {
    if (user?.id && personalNotifs.some(n => !n.isRead)) {
      try {
        await fetch("/api/stories/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch {}
    }
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    onClose();
  };

  const announcements = items;
  const unreadPersonalCount = personalNotifs.filter(n => !n.isRead).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#12141f] border border-slate-200 dark:border-indigo-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/40 animate-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-cyan-400 flex items-center justify-center text-lg shadow-inner">
              🔔
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === "en" ? "Notifications Center" : "Hộp Thư Thông Báo"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === "en" ? "Stay updated with your earnings and platform news" : "Cập nhật biến động số dư, duyệt rút tiền & tin hệ thống"}
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

        {/* Tab Switcher: Cá nhân (Rút tiền, Tác giả) vs Hệ thống (Chung) */}
        {isAuthenticated && user && (
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#181a27] border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "personal"
                  ? "bg-white dark:bg-[#202334] text-indigo-600 dark:text-cyan-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>👤 Cá nhân</span>
              {unreadPersonalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
                  {unreadPersonalCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "system"
                  ? "bg-white dark:bg-[#202334] text-indigo-600 dark:text-cyan-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🌐 Hệ thống ({announcements.length})</span>
            </button>
          </div>
        )}

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {activeTab === "personal" ? (
            /* TAB THÔNG BÁO CÁ NHÂN */
            isLoadingPersonal ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <span className="inline-block animate-spin mr-1.5">⏳</span> Đang kiểm tra thông báo...
              </div>
            ) : personalNotifs.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#181a28] flex items-center justify-center text-2xl mb-3 text-slate-400">
                  📭
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chưa có thông báo cá nhân nào
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Biến động số dư, tiền về ngân hàng khi rút hoặc tin duyệt tác phẩm sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              personalNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2 ${
                    item.type === "REWARD"
                      ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30"
                      : item.type === "REJECTED"
                      ? "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30"
                      : "bg-indigo-500/10 dark:bg-indigo-950/20 border-indigo-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {item.type === "REWARD" ? "💰" : item.type === "REJECTED" ? "⚠️" : "🎉"}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.type === "REWARD"
                          ? "bg-emerald-500 text-white"
                          : item.type === "REJECTED"
                          ? "bg-rose-500 text-white"
                          : "bg-indigo-600 text-white"
                      }`}>
                        {item.type === "REWARD" ? "Tiền về ví / Thưởng" : item.type === "REJECTED" ? "Từ chối" : "Duyệt thành công"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : (
            /* TAB THÔNG BÁO HỆ THỐNG */
            announcements.length === 0 ? (
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
            )
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
