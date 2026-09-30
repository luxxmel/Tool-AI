"use client";

import React, { useState, useEffect } from "react";
import { usePopup } from "@/context/PopupContext";

interface ProjectDetailViewProps {
  projectId: string;
  onSelectConversation: (convId: string) => void;
  onNewChatInProject: (projectId: string, systemPrompt?: string) => void;
  onBack: () => void;
}

export default function ProjectDetailView({
  projectId,
  onSelectConversation,
  onNewChatInProject,
  onBack,
}: ProjectDetailViewProps) {
  const { showConfirm } = usePopup();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết dự án:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    const ok = await showConfirm("Bạn có chắc chắn muốn xóa đoạn chat này khỏi dự án không?", "Xác nhận xóa đoạn chat");
    if (!ok) return;

    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: "DELETE" });
      if (res.ok) {
        setProject((prev: any) =>
          prev
            ? {
                ...prev,
                conversations: prev.conversations.filter((c: any) => c.id !== convId),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Lỗi khi xóa đoạn chat:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Đang tải dự án...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full text-center py-20">
        <p className="text-sm text-slate-400">Không tìm thấy dự án</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[860px] mx-auto flex flex-col pb-16">
      {/* Project Banner Header */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#0c0e17]/90 backdrop-blur-xl border border-slate-200 dark:border-indigo-950/80 shadow-xl shadow-indigo-950/10 mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-2.5 rounded-2xl bg-indigo-50 dark:bg-[#151724] border border-indigo-100 dark:border-indigo-950/80 shadow-xs">
              {project.icon || "📁"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {project.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 uppercase">
                  Dự án
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {project.description || "Không gian làm việc riêng biệt cho chủ đề này"}
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium cursor-pointer"
          >
            ← Quay lại
          </button>
        </div>

        {/* Project Custom Instructions (System Prompt) */}
        {project.systemPrompt && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-[#131522] border border-indigo-200/60 dark:border-indigo-950/70 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-indigo-600 dark:text-cyan-400 block mb-1">
              🎯 Chỉ dẫn chuyên biệt cho AI trong dự án này:
            </span>
            <p className="italic leading-relaxed">{project.systemPrompt}</p>
          </div>
        )}

        {/* Action button */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tổng cộng: <strong>{project.conversations?.length || 0}</strong> đoạn chat
          </span>

          <button
            onClick={() => onNewChatInProject(project.id, project.systemPrompt)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>+</span>
            <span>Tạo đoạn chat mới trong dự án này</span>
          </button>
        </div>
      </div>

      {/* Conversations in this project */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>💬</span>
          <span>Các đoạn chat thuộc dự án</span>
        </h2>

        {!project.conversations || project.conversations.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white/70 dark:bg-[#0c0e17]/70 border border-slate-200 dark:border-indigo-950/60">
            <p className="text-xs text-slate-500 mb-3">
              Chưa có đoạn chat nào trong dự án này.
            </p>
            <button
              onClick={() => onNewChatInProject(project.id, project.systemPrompt)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow-xs hover:bg-indigo-500 transition-colors"
            >
              Bắt đầu đoạn chat đầu tiên →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {project.conversations.map((c: any) => (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className="p-4 rounded-2xl bg-white/90 dark:bg-[#0d0f18]/90 border border-slate-200/90 dark:border-indigo-950/60 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-base shrink-0">💬</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors truncate">
                      {c.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-indigo-500 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    Mở chat →
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    title="Xóa đoạn chat này"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
