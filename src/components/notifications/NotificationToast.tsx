"use client";

import React, { useEffect, useState } from "react";

export default function NotificationToast() {
  const [toast, setToast] = useState<{ id: string | number; emoji: string; title: string; desc: string } | null>(null);

  useEffect(() => {
    let lastSeenId: string | null = null;
    if (typeof window !== "undefined") {
      lastSeenId = localStorage.getItem("last_seen_announcement_id");
    }

    const checkNewAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) return;
        const data = await res.json();
        const list = data.announcements;
        if (Array.isArray(list) && list.length > 0) {
          const newest = list[0];
          const newestId = String(newest.id);

          // Nếu phát hiện thông báo mới chưa từng xem
          if (lastSeenId && lastSeenId !== newestId) {
            setToast({
              id: newest.id,
              emoji: newest.emoji || "🔔",
              title: newest.title,
              desc: newest.desc || "",
            });
            localStorage.setItem("last_seen_announcement_id", newestId);
          } else if (!lastSeenId) {
            // Lần đầu vào web, lưu id để lần sau đăng mới sẽ hiện
            localStorage.setItem("last_seen_announcement_id", newestId);
          }
        }
      } catch (e) {
        // bỏ qua lỗi fetch ngầm
      }
    };

    // Kiểm tra ngay khi tải trang
    checkNewAnnouncement();

    // Kiểm tra định kỳ mỗi 15 giây xem Admin có vừa đăng thông báo mới không
    const interval = setInterval(checkNewAnnouncement, 15000);
    return () => clearInterval(interval);
  }, []);

  // Tự động ẩn thông báo sau 5 giây
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[9999] max-w-[320px] sm:max-w-xs w-full bg-white/95 dark:bg-[#12141f]/95 backdrop-blur-md border border-slate-200/90 dark:border-indigo-950/70 shadow-xl rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 animate-in slide-in-from-top-3 fade-in duration-200 transition-all">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-cyan-400 flex items-center justify-center text-base shrink-0">
        {toast.emoji}
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
            Thông báo mới
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer p-0.5 leading-none"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
          {toast.title}
        </h4>
        {toast.desc && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {toast.desc}
          </p>
        )}
      </div>
    </div>
  );
}
