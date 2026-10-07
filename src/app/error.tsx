"use client";

import React, { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi ứng dụng (Client Error Boundary):", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tool_ai_auth_user");
        localStorage.removeItem("omni_ws_bg_type");
        localStorage.removeItem("omni_ws_bg_value");
        localStorage.removeItem("omni_ws_bg_preset_id");
        sessionStorage.clear();
        window.location.href = "/";
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-lg w-full bg-[#0e111a] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-5 text-2xl">
          ⚡
        </div>
        <h2 className="text-xl font-bold mb-2">Đang khởi tạo lại trang</h2>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          Đã phát hiện một thay đổi giao diện hoặc phiên làm việc mới.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 rounded-2xl text-left text-xs font-mono text-red-300 break-all max-h-48 overflow-y-auto">
            <p className="font-bold text-red-200 mb-1">{error.name || "Error"}: {error.message || String(error)}</p>
            {error.digest && <p className="text-slate-400 text-[11px]">Digest: {error.digest}</p>}
            {error.stack && (
              <pre className="mt-2 text-[10px] text-red-400/70 whitespace-pre-wrap font-mono">
                {error.stack.split("\n").slice(0, 5).join("\n")}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-95"
          >
            Thử lại ngay
          </button>
          <button
            onClick={handleClearCacheAndReload}
            className="px-5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-medium text-sm transition-all cursor-pointer active:scale-95"
          >
            Làm mới bộ nhớ đệm
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all cursor-pointer active:scale-95"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
