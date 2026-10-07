"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import AssistantsFlyout from "./AssistantsFlyout";
import { AssistantItem } from "@/data/aiData";
import UserMenuPopup from "./UserMenuPopup";
import UserSettingsModal, { SettingsTab } from "@/components/user/UserSettingsModal";
import RechargeModal from "@/components/payment/RechargeModal";
import NotificationModal from "@/components/notifications/NotificationModal";
import SidebarConversationsList from "./SidebarConversationsList";

interface AppSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSelectAssistant: (assistant: AssistantItem) => void;
  onOpenLoginModal: () => void;
  activeConversationId?: string | null;
  activeProjectId?: string | null;
  onSelectConversation?: (id: string) => void;
  onSelectProject?: (id: string) => void;
  onNewChat?: () => void;
  onOpenCreateProject?: () => void;
  refreshTrigger?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AppSidebar({
  currentTab,
  onSelectTab,
  onSelectAssistant,
  onOpenLoginModal,
  activeConversationId = null,
  activeProjectId = null,
  onSelectConversation,
  onSelectProject,
  onNewChat,
  onOpenCreateProject,
  refreshTrigger,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [showCatalogInFlyout, setShowCatalogInFlyout] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("account");
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("omni_notifications_read") !== "true";
    }
    return true;
  });

  // Chỉ hiển thị các tính năng/tab Quản trị cho tài khoản Admin
  const isAdmin = Boolean(isAuthenticated && user && (user.role?.toLowerCase() === "admin"));

  const navItems = [
    {
      id: "home",
      label: t("nav.home"),
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "explore",
      label: t("nav.explore"),
      href: "/?tab=explore",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "images",
      label: t("nav.images"),
      href: "/?tab=images",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "characters",
      label: t("nav.characters"),
      href: "/?tab=characters",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "healing",
      label: t("nav.healing"),
      href: "/?tab=healing",
      badge: "Free",
      icon: (
        <svg className="w-5 h-5 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "assistants",
      label: t("nav.assistants"),
      hasSubmenu: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "stories",
      label: t("nav.stories"),
      href: "/?tab=stories",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "tools",
      label: t("nav.tools"),
      href: "/?tab=tools",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-[#07080d]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 z-50 flex items-center justify-between px-4 transition-colors">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-xs shadow-indigo-500/30">
            ▲
          </div>
          <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
            biettuot<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
            title="Thông báo hệ thống"
          >
            <span className="text-sm">🔔</span>
            {hasUnreadNotifications && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={theme === "dark" ? t("sidebar.light_mode") : t("sidebar.dark_mode")}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {isAuthenticated ? (
            <img src={user?.avatar} alt="User" className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700" />
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="text-xs bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold px-3 py-1 rounded-full shadow-xs shadow-indigo-500/30"
            >
              {t("sidebar.login")}
            </button>
          )}
        </div>
      </div>

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-[#090a10]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-indigo-950/50 flex flex-col justify-between p-3.5 transition-all duration-300 ${
          isMobileOpen
            ? "translate-x-0 shadow-2xl"
            : isCollapsed
            ? "-translate-x-full lg:-translate-x-full"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Logo & Theme Toggle */}
          <div className="flex items-center justify-between px-1.5 py-2.5 mb-2 gap-1.5 min-w-0">
            <Link href="/" className="flex items-center gap-1.5 group cursor-pointer min-w-0 shrink">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
                </svg>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                biettuot<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400">.ai</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              {/* Collapse button for desktop */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  title={t("sidebar.collapse")}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Notification Popup Trigger */}
              <button
                type="button"
                onClick={() => setIsNotificationOpen(true)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-xs transition-all cursor-pointer relative"
                title="Xem thông báo hệ thống"
              >
                <span className="text-xs">🔔</span>
                {hasUnreadNotifications && (
                  <>
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  </>
                )}
              </button>

              {/* Quick Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-xs transition-all cursor-pointer"
                title={theme === "dark" ? t("sidebar.light_mode") : t("sidebar.dark_mode")}
              >
                <span className="text-xs">{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              if (item.hasSubmenu) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-nav-id="assistants"
                    onClick={(e: any) => {
                      if (e?.detail === "catalog" || e?.target?.getAttribute?.("data-open-catalog") === "true") {
                        setShowCatalogInFlyout(true);
                        setIsFlyoutOpen(true);
                      } else {
                        setShowCatalogInFlyout(false);
                        setIsFlyoutOpen(!isFlyoutOpen);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive || isFlyoutOpen
                        ? "bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-300 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive || isFlyoutOpen ? "text-indigo-600 dark:text-cyan-400" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    <span className="text-slate-400 text-xs font-semibold">
                      {isFlyoutOpen ? "∨" : ">"}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href || "/"}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsFlyoutOpen(false);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-300 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-indigo-600 dark:text-cyan-400" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Admin CMS Link - Chỉ hiển thị cho Quản trị viên */}
            {isAdmin && (
              <Link
                href="/admin"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{t("nav.admin")}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Admin
                </span>
              </Link>
            )}

            {/* "+ Tạo đoạn chat mới" Action Button */}
            <div className="pt-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  if (onNewChat) {
                    onNewChat();
                  } else {
                    onSelectTab("home");
                  }
                  setIsMobileOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-98 group"
              >
                <span className="text-base leading-none font-black text-cyan-200 group-hover:scale-125 transition-transform">
                  +
                </span>
                <span>{language === "en" ? "New Chat" : "Tạo đoạn chat mới"}</span>
              </button>
            </div>
          </nav>

          {/* Conversations & Projects List (ChatGPT Style) */}
          {onSelectConversation && onNewChat && (
            <SidebarConversationsList
              activeConversationId={activeConversationId}
              activeProjectId={activeProjectId}
              onSelectConversation={(id) => {
                onSelectConversation(id);
                setIsMobileOpen(false);
              }}
              onSelectProject={(id) => {
                onSelectProject?.(id);
                setIsMobileOpen(false);
              }}
              onNewChat={() => {
                onNewChat();
                setIsMobileOpen(false);
              }}
              onOpenCreateProject={() => {
                onOpenCreateProject?.();
                setIsMobileOpen(false);
              }}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>

        {/* Bottom Section */}
        <div className="relative pt-3 border-t border-slate-200 dark:border-slate-800/80">
          {/* User Menu Popup */}
          {isAuthenticated && user && (
            <UserMenuPopup
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              onOpenSettings={(tab) => {
                setSettingsTab(tab);
                setIsSettingsOpen(true);
              }}
              onOpenRechargeModal={() => setIsRechargeOpen(true)}
              onOpenProfile={() => {
                onSelectTab("profile");
                setIsMobileOpen(false);
              }}
              onOpenNotifications={() => {
                setIsNotificationOpen(true);
                setIsMobileOpen(false);
              }}
            />
          )}

          {isAuthenticated && user ? (
            <div className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-[#13151f] border border-slate-200 dark:border-slate-800/80 transition-all shadow-xs">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="relative shrink-0 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-hidden"
                  title="Xem tùy chọn tài khoản"
                >
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName)}`;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#13151f] rounded-full"></span>
                </button>

                <div
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="min-w-0 flex-1 cursor-pointer"
                  title="Xem tùy chọn tài khoản"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate hover:text-indigo-400 transition-colors">
                      {user.displayName}
                    </span>
                    {user.role === "ADMIN" && (
                      <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 dark:text-amber-400 font-bold border border-amber-500/30 uppercase tracking-wider leading-none">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRechargeOpen(true);
                    }}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5 whitespace-nowrap hover:opacity-80 transition-opacity cursor-pointer text-left"
                    title="Bấm để nạp thêm Credits"
                  >
                    <span>🪙</span>
                    <span>{user.role === "ADMIN" ? (language === "en" ? "∞ Unlimited" : "∞ Vô hạn") : `${user.credits ?? 10} Credits`}</span>
                  </button>
                </div>

                {/* Actions: Theme/Wallpaper & Logout */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSettingsTab("appearance");
                      setIsSettingsOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                    title={language === "en" ? "Theme & background settings" : "Đổi hình nền & giao diện"}
                  >
                    <span className="text-xs">🎨</span>
                  </button>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title={language === "en" ? "Log out" : "Đăng xuất"}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{language === "en" ? "Sign in" : "Đăng nhập"}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title={theme === "dark" ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Flyout Submenu for Trợ lý */}
      <AssistantsFlyout
        isOpen={isFlyoutOpen}
        initialShowCatalog={showCatalogInFlyout}
        onClose={() => {
          setIsFlyoutOpen(false);
          setShowCatalogInFlyout(false);
        }}
        onSelectAssistant={onSelectAssistant}
      />

      {/* User Settings & Information Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />

      {/* System Announcements & Notifications Popup Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onMarkAllAsRead={() => {
          setHasUnreadNotifications(false);
          if (typeof window !== "undefined") {
            localStorage.setItem("omni_notifications_read", "true");
          }
        }}
      />
    </>
  );
}
