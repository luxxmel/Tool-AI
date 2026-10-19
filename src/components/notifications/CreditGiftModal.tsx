"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface GiftData {
  id: string;
  amount: number;
  mode?: "add" | "set";
  newBalance: number;
  adminName?: string;
  timestamp?: number;
  message?: string;
}

export default function CreditGiftModal() {
  const { user, updateUserCredits } = useAuth();
  const [gift, setGift] = useState<GiftData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Hàm kiểm tra quà tặng từ server
  const checkGift = useCallback(async () => {
    if (!user || !user.id || user.id.startsWith("guest_") || user.id === "user-demo-123") {
      return;
    }

    try {
      const res = await fetch(`/api/user/credits?userId=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data && data.credits !== undefined) {
        // Cập nhật lại credits hiển thị trên giao diện nếu có thay đổi
        if (data.credits !== user.credits && user.role !== "ADMIN") {
          updateUserCredits(Number(data.credits));
        }

        // Kiểm tra xem có quà tặng mới chưa nhận không
        if (data.lastGiftNotification) {
          try {
            const parsedGift: GiftData = typeof data.lastGiftNotification === "string" 
              ? JSON.parse(data.lastGiftNotification) 
              : data.lastGiftNotification;

            if (parsedGift && parsedGift.amount) {
              const seenKey = `seen_gift_${parsedGift.id}`;
              const hasSeen = localStorage.getItem(seenKey);
              if (!hasSeen) {
                setGift(parsedGift);
                setIsOpen(true);
              }
            }
          } catch (e) {
            console.error("Lỗi parse lastGiftNotification:", e);
          }
        }
      }
    } catch (err) {
      // Bỏ qua lỗi ngầm khi mất mạng tạm thời
    }
  }, [user?.id, user?.credits, user?.role, updateUserCredits]);

  // Kiểm tra ngay khi vào web và định kỳ mỗi 6 giây để popup nhảy lên ngay khi Admin vừa bấm tặng
  useEffect(() => {
    if (!user || !user.id) return;
    checkGift();
    const interval = setInterval(checkGift, 6000);
    return () => clearInterval(interval);
  }, [user?.id, checkGift]);

  const handleClose = async () => {
    if (!gift || !user?.id) {
      setIsOpen(false);
      return;
    }

    // Đánh dấu đã xem trên client
    try {
      localStorage.setItem(`seen_gift_${gift.id}`, "true");
    } catch {}

    setIsOpen(false);

    // Báo server xóa cờ thông báo để không hiện lại
    try {
      await fetch("/api/user/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "clear_gift",
        }),
      });
    } catch {}
  };

  if (!isOpen || !gift) return null;

  const isSet = gift.mode === "set";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-white via-amber-50/40 to-white dark:from-[#181a26] dark:via-[#13141f] dark:to-[#0f1017] border border-amber-400/50 dark:border-amber-500/40 shadow-2xl shadow-amber-500/20 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-300"
      >
        {/* Vòng hào quang sáng phía sau */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/25 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Biểu tượng quà tặng với hiệu ứng nảy */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-xl shadow-amber-500/40 border border-yellow-200 animate-bounce">
          <span className="text-4xl drop-shadow-md">🎁</span>
        </div>

        {/* Tiêu đề popup */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1.5 flex items-center justify-center gap-2">
          <span>Chúc Mừng! Bạn Nhận Được Quà</span>
          <span className="animate-pulse">✨</span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
          {gift.message || "Bạn vừa nhận được Credit Token từ Quản trị viên hệ thống!"}
        </p>

        {/* Khung số lượng Credit Token được tặng */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 dark:from-amber-500/15 dark:via-yellow-400/20 dark:to-amber-500/15 border border-amber-400/40 dark:border-amber-400/30 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
            {isSet ? "Số Dư Hiện Tại" : "Số Lượng Quà Tặng"}
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {isSet ? gift.newBalance : `+${gift.amount}`}
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-amber-200">
              Credits Token 🪙
            </span>
          </div>
          {!isSet && gift.newBalance !== undefined && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Số dư mới sau khi nhận: <strong className="text-amber-600 dark:text-amber-300">{gift.newBalance} Credits</strong>
            </p>
          )}
        </div>

        {/* Nút hành động Nhận quà */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:opacity-95 text-white font-black text-sm shadow-lg shadow-amber-500/30 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <span>🎉 Tuyệt vời! Cảm ơn Quản trị viên</span>
        </button>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
          Credit dùng để trò chuyện AI không giới hạn, tạo ảnh nghệ thuật và xem vận mệnh.
        </p>
      </div>
    </div>
  );
}
