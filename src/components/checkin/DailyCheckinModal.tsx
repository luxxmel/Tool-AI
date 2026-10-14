"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
  onCheckinSuccess?: (newCredits: number) => void;
}

interface DayReward {
  day: number;
  credits: number;
  label: string;
  badge?: string;
  isBigReward?: boolean;
  icon: string;
}

const SEVEN_DAYS_REWARDS: DayReward[] = [
  { day: 1, credits: 1, label: "Ngày 1", icon: "🪙", badge: "1 Xu Vàng" },
  { day: 2, credits: 2, label: "Ngày 2", icon: "🪙", badge: "2 Xu Vàng" },
  { day: 3, credits: 3, label: "Ngày 3", icon: "💰", badge: "Túi Tiền Nhỏ" },
  { day: 4, credits: 4, label: "Ngày 4", icon: "💰", badge: "Túi Tiền Vàng" },
  { day: 5, credits: 5, label: "Ngày 5", icon: "💎", badge: "Bảo Ngọc" },
  { day: 6, credits: 6, label: "Ngày 6", icon: "🪙", badge: "Đống Xu Vàng" },
  { day: 7, credits: 7, label: "Ngày 7", icon: "🏆", badge: "ĐẠI THƯỞNG VIP", isBigReward: true },
];

export default function DailyCheckinModal({
  isOpen,
  onClose,
  onOpenLoginModal,
  onCheckinSuccess,
}: DailyCheckinModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { showAlert } = usePopup();

  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCheckedToday, setIsCheckedToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [justClaimedReward, setJustClaimedReward] = useState<number | null>(null);

  // Sync state with localStorage & User
  useEffect(() => {
    if (!isOpen) return;

    if (!user) {
      setCurrentStreak(0);
      setIsCheckedToday(false);
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayKey = `biettuot_checkin_${user.id}_${todayStr}`;
    const streakKey = `biettuot_checkin_streak_${user.id}`;
    const lastDateKey = `biettuot_checkin_lastdate_${user.id}`;

    if (typeof window !== "undefined") {
      const checked = Boolean(localStorage.getItem(todayKey));
      setIsCheckedToday(checked);

      const savedStreak = Number(localStorage.getItem(streakKey) || 0);
      const lastDate = localStorage.getItem(lastDateKey);

      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (lastDate === todayStr) {
          // Hôm nay đã điểm danh
          setCurrentStreak(savedStreak || 1);
        } else if (lastDate === yesterdayStr) {
          // Hôm qua đã điểm danh, đang giữ chuỗi
          setCurrentStreak(savedStreak);
        } else {
          // Bị ngắt quãng chuỗi
          setCurrentStreak(0);
        }
      } else {
        setCurrentStreak(0);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Active day index in current 7-day cycle (1 to 7)
  const activeCycleDay = currentStreak === 0 ? 1 : ((currentStreak - 1) % 7) + 1;

  const handleClaim = async () => {
    if (!isAuthenticated || !user) {
      onClose();
      onOpenLoginModal?.();
      return;
    }

    if (isCheckedToday) {
      showAlert(
        `Bạn đã nhận quà hôm nay rồi (Chuỗi ${currentStreak} ngày)! Hãy quay lại vào ngày mai nhé 🎁`,
        "Đã nhận quà hôm nay",
        "info"
      );
      return;
    }

    try {
      setIsLoading(true);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayKey = `biettuot_checkin_${user.id}_${todayStr}`;
      const streakKey = `biettuot_checkin_streak_${user.id}`;
      const lastDateKey = `biettuot_checkin_lastdate_${user.id}`;

      const res = await fetch("/api/user/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, streak: currentStreak }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newStreakVal = Number(data.streak || currentStreak + 1);
        localStorage.setItem(todayKey, "true");
        localStorage.setItem(lastDateKey, todayStr);
        localStorage.setItem(streakKey, String(newStreakVal));

        setIsCheckedToday(true);
        setCurrentStreak(newStreakVal);
        setJustClaimedReward(data.rewardCredits);

        if (onCheckinSuccess) {
          onCheckinSuccess(data.newCredits);
        }

        showAlert(
          `🎉 ${data.message}\n🎁 Nhận ngay: +${data.rewardCredits} Credits.\n🪙 Số dư mới: ${data.newCredits} Credits.`,
          "Điểm danh thành công!",
          "success"
        );
      } else {
        showAlert(data.error || "Không thể điểm danh lúc này.", "Thông báo", "warning");
      }
    } catch {
      showAlert("Lỗi kết nối máy chủ khi điểm danh.", "Lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#171328] via-[#10101b] to-[#0a0a12] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-amber-500/20 via-rose-500/10 to-transparent blur-2xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center relative z-10 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2 shadow-xs">
            <span>✨</span>
            <span>Ưu đãi thành viên tích cực</span>
            <span>✨</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 tracking-tight drop-shadow-sm uppercase">
            QUÀ ĐIỂM DANH 7 NGÀY
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Điểm danh 7 ngày đầu để nhận thưởng tăng dần từ +1 đến +7 Credits. Từ ngày thứ 8 duy trì đều đặn +2 Credits mỗi ngày!
          </p>

          {/* Current Streak Indicator */}
          <div className="mt-3 inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl">
            <span className="text-xs text-slate-300">
              Chuỗi hiện tại: <strong className="text-amber-400 font-bold text-sm">{currentStreak} ngày</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-300">
              Hôm nay:{" "}
              {isCheckedToday ? (
                <span className="text-emerald-400 font-bold">✓ Đã nhận quà</span>
              ) : (
                <span className="text-amber-400 font-bold">Chưa điểm danh</span>
              )}
            </span>
          </div>
        </div>

        {/* 7-Days Reward Board Grid (6 days left + 1 big Day 7 on right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 relative z-10 mb-6">
          {/* Left: 6 Normal Days (2 columns x 3 rows) */}
          <div className="md:col-span-2 grid grid-cols-3 gap-2.5 sm:gap-3">
            {SEVEN_DAYS_REWARDS.slice(0, 6).map((item) => {
              // Status of each day in the 7-day cycle
              const isPastClaimed = isCheckedToday
                ? item.day <= activeCycleDay
                : item.day < activeCycleDay;
              const isToday = !isCheckedToday && item.day === activeCycleDay;

              return (
                <div
                  key={item.day}
                  className={`relative rounded-2xl p-3 flex flex-col items-center justify-between transition-all duration-300 border ${
                    isPastClaimed
                      ? "bg-[#181a26]/90 border-emerald-500/40 text-slate-300 shadow-inner"
                      : isToday
                      ? "bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-102 ring-2 ring-amber-400/50"
                      : "bg-[#141624]/60 border-white/5 text-slate-400 opacity-80"
                  }`}
                >
                  {/* Day Label Header */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold">
                    <span className={isToday ? "text-amber-300" : isPastClaimed ? "text-emerald-400" : "text-slate-400"}>
                      {item.label}
                    </span>
                    {isPastClaimed ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1 rounded font-bold">✓</span>
                    ) : isToday ? (
                      <span className="text-[9px] text-amber-300 bg-amber-500/30 px-1 rounded animate-pulse">Hôm nay</span>
                    ) : null}
                  </div>

                  {/* Visual Coin / Reward Icon */}
                  <div className="my-2 flex items-center justify-center transition-transform group-hover:scale-110">
                    {item.day === 1 && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-md shadow-amber-500/30 flex items-center justify-center ring-2 ring-amber-400/30">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-amber-950 font-black text-xs shadow-inner border border-yellow-200">
                          🪙
                        </div>
                      </div>
                    )}
                    {item.day === 2 && (
                      <div className="w-10 h-10 relative flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-md shadow-amber-500/30 flex items-center justify-center ring-1 ring-amber-400/40">
                          <span className="text-sm">🪙</span>
                        </div>
                        <span className="absolute -top-1 -right-1 text-xs">✨</span>
                      </div>
                    )}
                    {item.day === 3 && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600/30 via-amber-500/20 to-yellow-500/30 p-1 flex items-center justify-center border border-amber-500/40 shadow-md shadow-amber-500/20">
                        <span className="text-2xl filter drop-shadow">💰</span>
                      </div>
                    )}
                    {item.day === 4 && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/30 via-yellow-400/30 to-amber-600/30 p-1 flex items-center justify-center border border-amber-400/50 shadow-md shadow-amber-500/30">
                        <span className="text-2xl filter drop-shadow">💰</span>
                      </div>
                    )}
                    {item.day === 5 && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-indigo-500/30 p-1 flex items-center justify-center border border-cyan-400/50 shadow-md shadow-cyan-500/30">
                        <span className="text-2xl filter drop-shadow">💎</span>
                      </div>
                    )}
                    {item.day === 6 && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/40 via-yellow-300/30 to-rose-500/30 p-1 flex items-center justify-center border border-amber-300/60 shadow-lg shadow-amber-500/40">
                        <span className="text-2xl filter drop-shadow">🪙</span>
                      </div>
                    )}
                  </div>

                  {/* Reward Credits */}
                  <div className="text-center w-full pt-1 border-t border-white/5">
                    <span className="text-xs sm:text-sm font-extrabold text-amber-300">
                      +{item.credits}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Credits</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Day 7 Big Reward Card */}
          {(() => {
            const day7 = SEVEN_DAYS_REWARDS[6];
            const isDay7Claimed = isCheckedToday && activeCycleDay >= 7;
            const isDay7Today = !isCheckedToday && activeCycleDay === 7;

            return (
              <div
                className={`relative rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 border ${
                  isDay7Claimed
                    ? "bg-[#181a26]/90 border-emerald-500/40 shadow-inner"
                    : isDay7Today
                    ? "bg-gradient-to-b from-amber-500/30 via-rose-500/20 to-amber-950/50 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] ring-2 ring-amber-400"
                    : "bg-gradient-to-b from-[#1a152e] to-[#111122] border-amber-500/20"
                }`}
              >
                {/* Badge top */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    {day7.label}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                    {day7.badge}
                  </span>
                </div>

                {/* Big Reward Visual Container */}
                <div className="my-3 relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-amber-600/30 border border-amber-400/50 flex flex-col items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.25)] relative">
                    <span className="filter drop-shadow-md">🏆</span>
                    <span className="text-[10px] absolute -bottom-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black">
                      KHO BÁU
                    </span>
                  </div>
                  {isDay7Today && (
                    <div className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Reward info */}
                <div className="w-full">
                  <div className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                    +{day7.credits} CREDITS
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Kho báu ngày thứ 7 giá trị nhất!
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 relative z-10">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            <span>💡 Sau 7 ngày, hệ thống sẽ duy trì </span>
            <strong className="text-amber-400">+2 Credits</strong>
            <span> cố định cho mỗi ngày điểm danh liên tiếp.</span>
          </div>

          <button
            type="button"
            disabled={isCheckedToday || isLoading}
            onClick={handleClaim}
            className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
              isCheckedToday
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-amber-500/25 hover:scale-102 active:scale-98"
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Đang nhận quà...</span>
              </>
            ) : isCheckedToday ? (
              <>
                <span>✓</span>
                <span>Hôm Nay Đã Nhận Quà</span>
              </>
            ) : (
              <>
                <span>🎁</span>
                <span>Điểm Danh Nhận Thưởng Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
