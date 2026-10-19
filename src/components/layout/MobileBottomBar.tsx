"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface MobileBottomBarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenNewChat: () => void;
  onOpenLoginModal?: () => void;
}

export default function MobileBottomBar({
  currentTab,
  onSelectTab,
  onOpenNewChat,
  onOpenLoginModal,
}: MobileBottomBarProps) {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const navItems = [
    {
      id: "home",
      label: language === "en" ? "Home" : "Trang chủ",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "explore",
      label: language === "en" ? "Explore" : "Khám phá",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "chat_action",
      label: language === "en" ? "Chat AI" : "Chat AI",
      isAction: true,
      icon: (
        <div className="w-11 h-11 -mt-5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 border-2 border-white dark:border-[#0c0e17] active:scale-95 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      ),
    },
    {
      id: "images",
      label: language === "en" ? "Images" : "Tạo ảnh",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: language === "en" ? "Profile" : "Cá nhân",
      icon: isAuthenticated && user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.displayName || "User"}
          className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.displayName || "user")}`;
          }}
        />
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090b14]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-indigo-950/70 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={onOpenNewChat}
                className="flex flex-col items-center justify-center cursor-pointer group"
                title={item.label}
              >
                {item.icon}
                <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "profile" && !isAuthenticated) {
                  onOpenLoginModal?.();
                  return;
                }
                onSelectTab(item.id);
              }}
              className={`flex-1 py-1 flex flex-col items-center justify-center transition-colors cursor-pointer active:scale-95 ${
                isActive
                  ? "text-indigo-600 dark:text-cyan-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-cyan-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
