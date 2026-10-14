"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithOAuthUser } = useAuth();

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // UI flow states
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Bắt đầu đếm ngược gửi lại mã OTP (60s)
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Bước 1: Kiểm tra tính hợp lệ và gửi mã xác thực 6 chữ số qua Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ tất cả thông tin!");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setError("Tên đăng nhập chỉ được gồm 3-30 ký tự (chữ, số hoặc dấu gạch dưới), không dấu!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Địa chỉ email không đúng định dạng!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          username: cleanUsername,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể gửi mã xác nhận");
        return;
      }

      setStep("otp");
      startCountdown();
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setSuccessMsg(`Mã xác thực 6 chữ số đã được gửi tới email ${cleanEmail}. Vui lòng kiểm tra hộp thư (cả mục Spam/Rác nếu chưa thấy)!`);
    } catch (err) {
      console.error("Lỗi gửi OTP:", err);
      setError("Lỗi kết nối máy chủ khi gửi mã xác nhận");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setError("");
    setSuccessMsg("");

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể gửi lại mã");
        return;
      }

      startCountdown();
      if (data.devOtp) setDevOtp(data.devOtp);
      setSuccessMsg("Đã gửi lại mã xác thực mới vào email của bạn!");
    } catch {
      setError("Lỗi kết nối máy chủ khi gửi lại mã");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Bước 2: Hoàn tất đăng ký với mã OTP
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng ký không thành công");
        return;
      }

      // Đăng nhập luôn vào hệ thống
      loginWithOAuthUser(data.user);
      setSuccessMsg("🎉 Đăng ký tài khoản thành công! Đang chuyển hướng...");

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      setError("Lỗi hệ thống khi đăng ký tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#0c0e17]/90 backdrop-blur-2xl border border-indigo-950/80 shadow-2xl shadow-indigo-950/50 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white font-black mb-3 shadow-lg shadow-indigo-600/30 hover:scale-105 transition-transform">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
            </svg>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {step === "form" ? "Đăng Ký Tài Khoản" : "Xác Thực Email"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === "form"
              ? "Tạo tài khoản Biết Tuốt AI với bảo mật xác thực 2 lớp"
              : `Nhập mã 6 chữ số gửi đến ${email}`}
          </p>
        </div>

        {/* Thông báo lỗi / thành công */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <span className="shrink-0 text-sm">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <span className="shrink-0 text-sm">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Helper hiển thị OTP mô phỏng nếu chưa config SMTP server thực tế */}
        {devOtp && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
            <span>⚡ Mã xác nhận thử nghiệm: <strong>{devOtp}</strong></span>
            <button
              type="button"
              onClick={() => setOtp(devOtp)}
              className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 text-[10px] font-bold cursor-pointer transition-colors"
            >
              Điền nhanh
            </button>
          </div>
        )}

        {/* ─── BƯỚC 1: FORM ĐĂNG KÝ ─── */}
        {step === "form" ? (
          <form onSubmit={handleRequestOtp} className="space-y-3.5">
            {/* Tên đăng nhập */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tên đăng nhập <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: linh_hoang99"
                required
                className="w-full px-4 py-2.5 bg-[#131520] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Chỉ gồm chữ cái, số hoặc gạch dưới, không dấu
              </span>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Địa chỉ Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-2.5 bg-[#131520] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
                className="w-full px-4 py-2.5 bg-[#131520] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Xác nhận mật khẩu <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                className="w-full px-4 py-2.5 bg-[#131520] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 mt-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi mã xác thực...</span>
                </span>
              ) : (
                <span>Tiếp tục & Nhận mã qua Email ➔</span>
              )}
            </button>
          </form>
        ) : (
          /* ─── BƯỚC 2: NHẬP MÃ XÁC THỰC OTP ─── */
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Nhập mã xác thực 6 chữ số
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                }}
                placeholder="• • • • • •"
                maxLength={6}
                required
                autoFocus
                className="w-full px-4 py-3 bg-[#131520] border-2 border-indigo-500/50 focus:border-cyan-400 rounded-2xl text-center text-white text-2xl tracking-[0.5em] font-mono focus:outline-hidden shadow-inner transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </span>
              ) : (
                <span>Xác nhận & Hoàn tất Đăng ký 🎉</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Đổi email / thông tin
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isLoading}
                className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Footer chuyển sang Đăng nhập */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Đã có tài khoản? </span>
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
