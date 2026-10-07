"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function LoginForm({ onSuccess, onClose }: LoginFormProps) {
  const { login, loginDemo, loginWithGoogle, loginWithFacebook, loginWithOAuthUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // 1. Tải Google Identity Services (GSI) script nếu có cấu hình clientId
  useEffect(() => {
    if (typeof window === "undefined" || !clientId) return;

    if (!window.google?.accounts?.oauth2) {
      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [clientId]);

  // 2. Lắng nghe thông điệp từ popup OAuth (Google, GitHub, Facebook)
  useEffect(() => {
    function handleOAuthMessage(event: MessageEvent) {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        loginWithOAuthUser(event.data.user);
        setIsLoading(false);
        onSuccess?.();
      } else if (event.data?.type === "OAUTH_AUTH_ERROR") {
        setError(event.data.error || "Đăng nhập OAuth thất bại");
        setIsLoading(false);
      }
    }

    window.addEventListener("message", handleOAuthMessage);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        bc = new BroadcastChannel("oauth_channel");
        bc.onmessage = (event) => {
          if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
            loginWithOAuthUser(event.data.user);
            setIsLoading(false);
            onSuccess?.();
          } else if (event.data?.type === "OAUTH_AUTH_ERROR") {
            setError(event.data.error || "Đăng nhập OAuth thất bại");
            setIsLoading(false);
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener("message", handleOAuthMessage);
      if (bc) bc.close();
    };
  }, [loginWithOAuthUser, onSuccess]);

  // 3. Xử lý Đăng nhập bằng Email hoặc Tên tài khoản
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email hoặc tên đăng nhập!");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const result = await login(email, password);
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Đăng nhập không thành công. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Đã xảy ra lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Đăng nhập nhanh Admin (Lịnh Hoàng - Vô hạn Credits)
  const handleAdminQuickLogin = () => {
    setError("");
    loginDemo();
    onSuccess?.();
  };

  // 5. Xử lý bấm nút Google
  // 5. Xử lý bấm nút Google qua OAuth Popup
  const handleGoogleClick = async () => {
    setError("");
    setIsLoading(true);
    const width = 560;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    try {
      const popup = window.open(
        "/api/auth/google",
        "google_oauth",
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (!popup) {
        window.location.href = "/api/auth/google";
      }
    } catch {
      window.location.href = "/api/auth/google";
    }
  };

  // 7. Xử lý bấm nút GitHub qua OAuth Popup
  const handleGithubClick = async () => {
    setError("");
    setIsLoading(true);
    const width = 560;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    try {
      const popup = window.open(
        "/api/auth/github",
        "github_oauth",
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (!popup) {
        window.location.href = "/api/auth/github";
      }
    } catch {
      window.location.href = "/api/auth/github";
    }
  };

  // 8. Xử lý bấm nút Facebook qua OAuth Popup
  const handleFacebookClick = async () => {
    setError("");
    setIsLoading(true);
    const width = 560;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    try {
      const popup = window.open(
        "/api/auth/facebook",
        "facebook_oauth",
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (!popup) {
        window.location.href = "/api/auth/facebook";
      }
    } catch {
      window.location.href = "/api/auth/facebook";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#0c0e17]/95 backdrop-blur-2xl border border-indigo-950/70 text-white shadow-2xl shadow-indigo-950/40 transition-all relative">
      {/* Nút đóng modal trực tiếp góc trên phải */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
          title="Đóng cửa sổ"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white font-black mb-3 shadow-lg shadow-indigo-600/30">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Đăng Nhập Tài Khoản
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Trải nghiệm đầy đủ tất cả trợ lý AI, tạo ảnh & kịch bản thông minh
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* --- FORM ĐĂNG NHẬP / ĐĂNG KÝ TỰ ĐỘNG --- */}
      <form onSubmit={handleEmailLogin} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              required
              className="w-full px-4 py-2.5 bg-[#131520] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mật khẩu
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-[#131520] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xử lý...</span>
            </span>
          ) : (
            <span>Đăng nhập / Vào ngay</span>
          )}
        </button>
      </form>

      {/* --- DÒNG PHÂN CÁCH --- */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <span className="relative px-3 bg-[#0c0e17] text-[10px] text-slate-500 uppercase font-semibold">
          Hoặc tiếp tục với
        </span>
      </div>

      {/* --- NÚT ĐĂNG NHẬP GOOGLE, GITHUB & FACEBOOK --- */}
      <div className="grid grid-cols-3 gap-2">
        {/* Nút Google */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          title="Đăng nhập bằng Google"
          className="w-full py-2 px-2 bg-[#151722] hover:bg-[#1d202e] border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="hidden sm:inline">Google</span>
        </button>

        {/* Nút GitHub */}
        <button
          type="button"
          onClick={handleGithubClick}
          disabled={isLoading}
          title="Đăng nhập bằng GitHub"
          className="w-full py-2 px-2 bg-[#151722] hover:bg-[#1d202e] border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="hidden sm:inline">GitHub</span>
        </button>

        {/* Nút Facebook */}
        <button
          type="button"
          onClick={handleFacebookClick}
          disabled={isLoading}
          title="Đăng nhập bằng Facebook"
          className="w-full py-2 px-2 bg-[#151722] hover:bg-[#1d202e] border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="hidden sm:inline">Facebook</span>
        </button>
      </div>
    </div>
  );
}
