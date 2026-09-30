"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const activeUserId = user?.id || null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
        setName("");
        setDescription("");
        setSystemPrompt("");
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0c0e17] border border-indigo-950/80 rounded-3xl p-6 shadow-2xl shadow-indigo-950/40 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📁</span>
            <div>
              <h2 className="text-lg font-bold text-white">Tạo Dự Án Mới</h2>
              <p className="text-xs text-slate-400">
                Không gian làm việc riêng biệt để nhóm các đoạn chat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên dự án */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Tên dự án *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Kịch bản Manga, Dự án Web, Kế hoạch..."
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-[#131522] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Mô tả ngắn (Tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục đích của dự án này..."
              className="w-full px-4 py-2 bg-[#131522] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Chỉ dẫn AI cho dự án (System Prompt) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Chỉ dẫn riêng cho AI trong dự án này (Tùy chọn)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Luôn viết code theo chuẩn Clean Code TypeScript, hoặc luôn trả lời theo phong cách hài hước..."
              className="w-full px-4 py-2 bg-[#131522] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo dự án"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
