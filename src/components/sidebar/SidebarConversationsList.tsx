"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

export interface ConversationSummary {
  id: string;
  title: string;
  botId: string;
  botName: string;
  botAvatar?: string;
  messagesCount: number;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  conversations: { id: string }[];
}

interface SidebarConversationsListProps {
  activeConversationId: string | null;
  activeProjectId?: string | null;
  onSelectConversation: (conversationId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onNewChat: () => void;
  onOpenCreateProject?: () => void;
  refreshTrigger?: number;
}

export default function SidebarConversationsList({
  activeConversationId,
  activeProjectId,
  onSelectConversation,
  onSelectProject,
  onNewChat,
  onOpenCreateProject,
  refreshTrigger,
}: SidebarConversationsListProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showConfirm } = usePopup();
  const activeUserId = user?.id || null;

  const [activeTab, setActiveTab] = useState<"chats" | "projects">("chats");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const fetchConversations = async () => {
    if (!user?.id) {
      setConversations([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/conversations?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách đoạn chat:", err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!user?.id) {
      setProjects([]);
      return;
    }
    try {
      const res = await fetch(`/api/projects?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách dự án:", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchProjects();
  }, [activeUserId, refreshTrigger]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await showConfirm("Bạn có chắc chắn muốn xóa đoạn chat này không?", "Xác nhận xóa đoạn chat");
    if (!ok) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error("Lỗi khi xóa cuộc trò chuyện:", err);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await showConfirm("Bạn có chắc chắn muốn xóa dự án này cùng toàn bộ kịch bản bên trong?", "Xác nhận xóa dự án");
    if (!ok) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (activeProjectId === id) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error("Lỗi khi xóa dự án:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 mt-2">
      {/* Segmented Tab: Đoạn chat vs Dự án */}
      <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 mb-2">
        <button
          type="button"
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === "chats"
              ? "bg-white dark:bg-[#1e2133] text-indigo-600 dark:text-cyan-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          {t("sidebar.chats")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === "projects"
              ? "bg-white dark:bg-[#1e2133] text-indigo-600 dark:text-cyan-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          {t("sidebar.projects")} ({(projects?.length || 0)})
        </button>
      </div>

      {/* Header action button */}
      <div className="flex items-center justify-between px-1 pb-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {activeTab === "chats" ? t("sidebar.recent") : t("sidebar.projects_list")}
        </span>

        {activeTab === "chats" ? (
          <button
            type="button"
            onClick={onNewChat}
            title={t("sidebar.new_chat")}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-bold"
          >
            <span>{t("sidebar.new")}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onOpenCreateProject) {
                onOpenCreateProject();
              } else {
                setIsCreateProjectOpen(true);
              }
            }}
            title={t("sidebar.create_project")}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-bold"
          >
            <span>{t("sidebar.create_project")}</span>
          </button>
        )}
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 max-h-[190px]">
        {activeTab === "chats" ? (
          /* CHATS LIST */
          isLoading && (conversations?.length || 0) === 0 ? (
            <div className="p-3 text-center text-[11px] text-slate-400">
              {t("sidebar.loading_chats")}
            </div>
          ) : (conversations?.length || 0) === 0 ? (
            <div className="p-3 text-center text-[11px] text-slate-400">
              {t("sidebar.no_conversations")}
            </div>
          ) : (
            (conversations || []).map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs shrink-0 opacity-70">💬</span>
                    <span className="truncate text-left">{conv.title}</span>
                  </div>

                  {hoveredId === conv.id && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      title={t("sidebar.delete_chat")}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 ml-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* PROJECTS LIST */
          (projects?.length || 0) === 0 ? (
            <div className="p-3 text-center text-[11px] text-slate-400">
              <p>{t("sidebar.no_projects")}</p>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreateProject) {
                    onOpenCreateProject();
                  } else {
                    setIsCreateProjectOpen(true);
                  }
                }}
                className="mt-1.5 text-indigo-500 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                {t("sidebar.create_first_project")}
              </button>
            </div>
          ) : (
            (projects || []).map((proj) => {
              const isActive = activeProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject?.(proj.id)}
                  onMouseEnter={() => setHoveredId(proj.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm shrink-0">{proj.icon || "📁"}</span>
                    <span className="truncate text-left font-medium">{proj.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {proj.conversations?.length || 0}
                    </span>

                    {hoveredId === proj.id && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProject(e, proj.id)}
                        title={t("sidebar.delete_project")}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Modal Tạo Dự Án Mới */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
          setActiveTab("projects");
          onSelectProject?.(newProj.id);
        }}
      />
    </div>
  );
}
