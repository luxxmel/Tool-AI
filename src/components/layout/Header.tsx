"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import RechargeModal from "@/components/payment/RechargeModal";

interface HeaderProps {
  onOpenLoginModal?: () => void;
}

export default function Header({ onOpenLoginModal }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  return (
    <>
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Biết Tuốt AI <span className="text-amber-400 font-mono text-sm px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">PRO</span>
              </span>
              <span className="text-[11px] text-slate-400 block -mt-1">
                Nền tảng trí tuệ nhân tạo toàn năng
              </span>
            </div>
          </div>

          {/* User / Auth Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 py-1.5 px-3 rounded-2xl">
                {/* Credit Badge */}
                <button
                  onClick={() => setIsRechargeOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer bg-amber-500/10 px-2 py-1 rounded-xl border border-amber-500/20 hover:border-amber-500/40"
                  title="Bấm để nạp thêm Credits"
                >
                  <span>🪙</span>
                  <span>{user.role === "ADMIN" ? "∞ Vô hạn" : `${user.credits ?? 10} Credits`}</span>
                  {user.role !== "ADMIN" && (
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-black ml-0.5">
                      +Nạp
                    </span>
                  )}
                </button>

                <div className="h-4 w-[1px] bg-slate-800" />

                {/* Avatar & Name */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-200">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      ● Đã đăng nhập
                    </div>
                  </div>
                </div>

                <div className="h-4 w-[1px] bg-slate-800" />

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  title="Đăng xuất"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
    </>
  );
}
