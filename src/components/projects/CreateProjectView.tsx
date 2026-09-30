"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface CreateProjectViewProps {
  onProjectCreated: (project: any) => void;
  onCancel: () => void;
}

export default function CreateProjectView({
  onProjectCreated,
  onCancel,
}: CreateProjectViewProps) {
  const { user } = useAuth();
  const activeUserId = user?.id || null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vui lòng đăng nhập để tạo dự án");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên dự án");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          name: name.trim(),
          description: description.trim() || undefined,
          systemPrompt: systemPrompt.trim() || undefined,
          icon: "📁",
          color: "indigo",
        }),
      });

      if (res.ok) {
        const newProject = await res.json();
        onProjectCreated(newProject);
      } else {
        const data = await res.json();
        setError(data.error || "Không thể tạo dự án");
      }
    } catch (err) {
      console.error("Lỗi khi tạo dự án:", err);
      setError("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto py-8 sm:py-16 px-4 animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-xl border border-slate-200 dark:border-indigo-950/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/10 dark:shadow-indigo-950/30">
        {/* Header with Folder Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-[#151726] border border-indigo-100 dark:border-indigo-950/80 flex items-center justify-center text-3xl shadow-md shadow-indigo-500/10 mb-4">
            📁
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tạo dự án mới
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm">
            Nhập tên dự án để bắt đầu nhóm các cuộc trò chuyện và câu chuyện riêng biệt.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên dự án */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tên dự án *
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Kịch bản Manga, Dự án Web, Kế hoạch kinh doanh..."
                required
                autoFocus
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                📁
              </span>
            </div>
          </div>

          {/* Toggle Nâng cao (Mô tả & Chỉ dẫn AI) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showAdvanced ? "Ẩn tùy chọn nâng cao" : "+ Thêm mô tả & chỉ dẫn cho AI (Tùy chọn)"}</span>
              <span className="text-[10px]">{showAdvanced ? "▲" : "▼"}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Mô tả ngắn */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mục đích hoặc tóm tắt của dự án này..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Chỉ dẫn AI */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Chỉ dẫn riêng cho AI trong dự án (System Prompt)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Đóng vai biên kịch chuyên nghiệp, luôn đưa ra gợi ý kịch tính..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span>{isSubmitting ? "Đang tạo..." : "Tạo dự án & Bắt đầu"}</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
