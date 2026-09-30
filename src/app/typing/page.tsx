"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import TypingTest from "@/components/typing/TypingTest";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

function TypingContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang tải ứng dụng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Header onOpenLoginModal={() => setShowLoginModal(true)} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Quay lại Trang chủ AI
          </Link>
        </div>

        {/* Banner thông báo khi chưa đăng nhập */}
        {!isAuthenticated && (
          <div className="w-full max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👀</span>
              <span>
                <strong>Chế độ xem trước:</strong> Bạn có thể xem toàn bộ giao diện. Hãy đăng nhập để mở khóa bàn phím và tính điểm WPM!
              </span>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="shrink-0 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        <div className="w-full py-2 animate-in fade-in duration-300">
          {isAuthenticated && (
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Chào mừng bạn,{" "}
                <span className="text-amber-400">{user?.displayName}</span>! 👋
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Bàn phím đã sẵn sàng. Hãy bắt đầu gõ để tính giờ!
              </p>
            </div>
          )}

          <TypingTest
            isAuthenticated={isAuthenticated}
            username={user?.username}
            onRequireLogin={() => setShowLoginModal(true)}
          />
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-12 right-0 text-slate-400 hover:text-white p-2 text-sm font-semibold flex items-center gap-1 cursor-pointer"
            >
              ✕ Đóng
            </button>
            <LoginForm onSuccess={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-400">
        <p>TypeMaster AI • Next.js App Router • Tailwind CSS • TypeScript</p>
      </footer>
    </div>
  );
}

export default function TypingPage() {
  return (
    <AuthProvider>
      <TypingContent />
    </AuthProvider>
  );
}
