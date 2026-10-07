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

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#0e111a] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-5 text-2xl">
          ⚡
        </div>
        <h2 className="text-xl font-bold mb-2">Đang khởi tạo lại trang</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Đã phát hiện một thay đổi giao diện hoặc phiên làm việc mới. Vui lòng bấm thử lại để tiếp tục sử dụng Biết Tuốt AI.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-95"
          >
            Thử lại ngay
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
