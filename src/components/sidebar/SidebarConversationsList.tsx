"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

import { isMainChatBot } from "@/lib/characterUtils";

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
  conversations: { id: string; title?: string }[];
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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});

  const toggleExpandProject = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    setExpandedProjectIds((prev) => ({
      ...prev,
      [projId]: !prev[projId],
    }));
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [projects, searchQuery]);

  const fetchConversations = async () => {
    const uid = user?.id || user?.email;
    if (!uid) {
      setConversations([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      let serverConvs: ConversationSummary[] = [];
      const res = await fetch(`/api/conversations?userId=${encodeURIComponent(uid)}&excludeCharacters=true`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) serverConvs = data;
      }

      // Đọc bản lưu dự phòng từ localStorage
      let localConvs: ConversationSummary[] = [];
      try {
        const stored = localStorage.getItem(`omni_recent_convs_${uid}`);
        if (stored) {
          localConvs = JSON.parse(stored);
        }
      } catch {}

      // Đọc danh sách các ID người dùng đã xóa
      let deletedIds = new Set<string>();
      try {
        const deletedRaw = localStorage.getItem(`omni_deleted_conv_ids_${uid}`);
        if (deletedRaw) {
          const parsed = JSON.parse(deletedRaw);
          if (Array.isArray(parsed)) {
            deletedIds = new Set(parsed);
          }
        }
      } catch {}

      // Hợp nhất serverConvs và localConvs không bị lặp ID, CHỈ GIỮ LẠI đoạn chat của khung chat bình thường (Biết Tuốt AI)
      const map = new Map<string, ConversationSummary>();
      [...serverConvs, ...localConvs].forEach((item: any) => {
        if (item && item.id && !deletedIds.has(item.id) && !item.projectId && isMainChatBot(item.botId)) {
          const existing = map.get(item.id);
          if (!existing || new Date(item.updatedAt) > new Date(existing.updatedAt)) {
            map.set(item.id, item);
          }
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setConversations(merged);

      try {
        localStorage.setItem(`omni_recent_convs_${uid}`, JSON.stringify(merged));
      } catch {}
    } catch (err) {
      console.error("Lỗi tải danh sách đoạn chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    const uid = user?.id || user?.email;
    if (!uid) {
      setProjects([]);
      return;
    }
    try {
      const res = await fetch(`/api/projects?userId=${encodeURIComponent(uid)}`);
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

    const uid = user?.id || user?.email || activeUserId;

    // 1. Cập nhật ngay lập tức UI local state
    setConversations((prev) => prev.filter((c) => c.id !== id));

    // 2. Xóa triệt để khỏi localStorage để reload trang không bao giờ bị hiện lại
    if (uid) {
      try {
        const storageKey = `omni_recent_convs_${uid}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const updated = list.filter((c: any) => c && c.id !== id);
            localStorage.setItem(storageKey, JSON.stringify(updated));
          }
        }
        // Xóa các tin nhắn cache của đoạn chat này nếu có
        localStorage.removeItem(`omni_chat_msgs_${id}`);

        // Lưu vào danh sách các ID đã xóa để fetchConversations không hồi sinh lại
        const deletedKey = `omni_deleted_conv_ids_${uid}`;
        const deletedRaw = localStorage.getItem(deletedKey);
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedList.includes(id)) {
          deletedList.push(id);
          localStorage.setItem(deletedKey, JSON.stringify(deletedList.slice(-200)));
        }

        // Nếu là đoạn chat Tarot / Chiêm tinh / Tử vi / Bát tự đặc thù thì dọn dẹp thêm
        if (id.startsWith("tarot-")) {
          const tHistory = localStorage.getItem(`omni_tarot_history_${uid}`);
          if (tHistory) {
            const parsed = JSON.parse(tHistory);
            if (Array.isArray(parsed)) {
              localStorage.setItem(`omni_tarot_history_${uid}`, JSON.stringify(parsed.filter((item: any) => item.id !== id)));
            }
          }
        }
      } catch (err) {
        console.warn("Lỗi khi xóa cache local của đoạn chat:", err);
      }
    }

    if (activeConversationId === id) {
      onNewChat();
    }

    // 3. Gửi yêu cầu xóa lên Server Database (nếu đoạn chat đã lưu trong DB)
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Lỗi khi xóa cuộc trò chuyện trên server:", err);
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
    <div className="flex flex-col pt-2 border-t border-slate-200/80 dark:border-slate-800/80 mt-2 shrink-0">
      {/* Search Input Bar (ChatGPT style) */}
      <div className="relative mb-2 px-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm đoạn chat hoặc dự án..."
          className="w-full px-2.5 py-1.5 pl-7 text-[11px] rounded-xl bg-slate-100 dark:bg-[#121422] border border-slate-200 dark:border-indigo-950/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
          🔍
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Content: Projects Section (Top) + Recent Chats (Bottom) */}
      <div className="space-y-3.5 pr-1">
        
        {/* ─── PHẦN 1: DỰ ÁN (PROJECTS - ChatGPT style) ─── */}
        <div>
          <div className="flex items-center justify-between px-1.5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📁</span>
              <span>Dự án</span>
            </span>
            <button
              type="button"
              onClick={() => {
                if (onOpenCreateProject) {
                  onOpenCreateProject();
                } else {
                  setIsCreateProjectOpen(true);
                }
              }}
              title="Tạo dự án mới"
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 text-xs font-bold p-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <span>+</span>
              <span className="text-[10px]">Tạo mới</span>
            </button>
          </div>

          <div className="space-y-0.5">
            {filteredProjects.length === 0 ? (
              <div className="px-2 py-1.5 text-[11px] text-slate-500 italic">
                Chưa có dự án nào
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isActive = activeProjectId === proj.id;
                const isExpanded = expandedProjectIds[proj.id] || isActive;
                const projConvs = Array.isArray(proj.conversations) ? proj.conversations : [];

                return (
                  <div key={proj.id} className="space-y-0.5">
                    <div
                      onClick={() => onSelectProject?.(proj.id)}
                      onMouseEnter={() => setHoveredId(proj.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs shrink-0 text-slate-400">📁</span>
                        <span className="truncate text-left font-medium">{proj.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {projConvs.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleExpandProject(e, proj.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title={isExpanded ? "Thu gọn" : "Xem các đoạn chat"}
                          >
                            <svg
                              className={`w-3 h-3 transform transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}

                        {hoveredId === proj.id && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProject(e, proj.id)}
                            title="Xóa dự án"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Danh sách các đoạn chat con thuộc thư mục dự án (Tree indent giống ChatGPT) */}
                    {isExpanded && projConvs.length > 0 && (
                      <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 border-l-2 border-indigo-200/60 dark:border-slate-800 ml-3">
                        {projConvs.map((conv) => {
                          const isConvActive = activeConversationId === conv.id;
                          return (
                            <div
                              key={conv.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectConversation(conv.id);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                                isConvActive
                                  ? "bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-cyan-300 font-semibold"
                                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              <span className="truncate text-left flex-1">
                                {conv.title || "Đoạn chat dự án"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── PHẦN 2: CÁC ĐOẠN CHAT GẦN ĐÂY (RECENT CHATS) ─── */}
        <div>
          <div className="flex items-center justify-between px-1.5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>💬</span>
              <span>Đoạn chat gần đây</span>
            </span>
          </div>

          <div className="space-y-0.5">
            {isLoading && filteredConversations.length === 0 ? (
              <div className="px-2 py-1.5 text-[11px] text-slate-500 italic">
                Đang tải đoạn chat...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-2 py-1.5 text-[11px] text-slate-500 italic">
                Chưa có đoạn chat nào
              </div>
            ) : (
              filteredConversations.map((conv) => {
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
            )}
          </div>
        </div>

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
