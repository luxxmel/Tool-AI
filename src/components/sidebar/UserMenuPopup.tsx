"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { SettingsTab } from "@/components/user/UserSettingsModal";

interface UserMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab: SettingsTab) => void;
  onOpenRechargeModal?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
}

export default function UserMenuPopup({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenRechargeModal,
  onOpenProfile,
  onOpenNotifications,
}: UserMenuPopupProps) {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-2 w-72 bg-white/95 dark:bg-[#12141f]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* 1. Header Row (Avatar, Name, Subtitle, Arrow >) */}
      <button
        onClick={() => {
          if (onOpenProfile) {
            onOpenProfile();
          } else {
            onOpenSettings("account");
          }
          onClose();
        }}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName)}`;
                }}
              />
            ) : (
              <span className="text-sm font-black text-rose-600">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user.displayName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{user.role === "ADMIN" ? t("menu.admin", "Quản trị viên") : t("menu.member", "Thành viên")}</span>
              <span>•</span>
              <span className="text-amber-500 font-semibold">
                🪙 {user.role === "ADMIN" ? t("menu.infinite", "∞ Vô hạn") : (user.credits ?? 10)}
              </span>
            </div>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Divider */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 my-1"></div>

      {/* 2. Menu Items List */}
      <div className="px-1.5 py-1 space-y-0.5 text-xs">
        {/* Admin Special: Phát Credits cho người khác */}
        {user.role === "ADMIN" && (
          <button
            onClick={() => {
              onOpenSettings("admin_credits");
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold transition-all cursor-pointer shadow-xs mb-1"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">👑</span>
              <span>{t("menu.admin_credits", "Phát Credits cho User")}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-200 border border-amber-500/30">
              Admin
            </span>
          </button>
        )}

        {/* Thêm thành viên */}
        <button
          onClick={() => {
            onOpenSettings("invite");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>{t("menu.invite", "Thêm thành viên")}</span>
        </button>

        {/* Cài đặt không gian làm việc */}
        <button
          onClick={() => {
            onOpenSettings("workspace");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>{t("menu.workspace", "Cài đặt không gian làm việc")}</span>
        </button>

        {/* Giao diện & Hình nền */}
        <button
          onClick={() => {
            onOpenSettings("appearance");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <span className="text-sm">🎨</span>
          <span>{t("menu.appearance", "Giao diện & Hình nền")}</span>
        </button>

        {/* Cá nhân hóa AI */}
        <button
          onClick={() => {
            onOpenSettings("personalization");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t("menu.personalization", "Cá nhân hóa")}</span>
        </button>

        {/* Quản lý Credits */}
        <button
          onClick={() => {
            if (user.role === "ADMIN") {
              onOpenSettings("admin_credits");
            } else if (onOpenRechargeModal) {
              onOpenRechargeModal();
            } else {
              onOpenSettings("credits");
            }
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">🪙</span>
            <span>{user.role === "ADMIN" ? t("menu.credits", "Quản lý & Cấp Credits") : t("menu.recharge", "Nạp thêm Credits")}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            {user.role === "ADMIN" ? t("menu.infinite", "∞ Vô hạn") : (user.credits ?? 10)}
          </span>
        </button>

        {/* Thông báo hệ thống */}
        {onOpenNotifications && (
          <button
            onClick={() => {
              onOpenNotifications();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">🔔</span>
              <span>{language === "en" ? "Notifications" : "Thông báo hệ thống"}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Mới
            </span>
          </button>
        )}

        {/* Cài đặt */}
        <button
          onClick={() => {
            onOpenSettings("general");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{t("menu.settings", "Cài đặt")}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 my-1"></div>

      {/* 3. Bottom Items (Trợ giúp & Đăng xuất) */}
      <div className="px-1.5 py-1 space-y-0.5 text-xs">
        <button
          onClick={() => {
            onOpenSettings("help");
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t("menu.help", "Trợ giúp")}</span>
          </div>
          <svg
            className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all cursor-pointer font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{t("menu.logout", "Đăng xuất")}</span>
        </button>
      </div>
    </div>
  );
}
