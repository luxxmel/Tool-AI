"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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

  // Tính năng 1.1: Ghim (Pin) & Đổi tên (Rename)
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load danh sách ghim từ localStorage
  useEffect(() => {
    const uid = user?.id || user?.email || "guest";
    try {
      const storedPinned = localStorage.getItem(`omni_pinned_convs_${uid}`);
      if (storedPinned) {
        setPinnedIds(JSON.parse(storedPinned));
      }
    } catch {}
  }, [user]);

  // Focus khi mở chế độ đổi tên
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const uid = user?.id || user?.email || "guest";
    setPinnedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev];
      try {
        localStorage.setItem(`omni_pinned_convs_${uid}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleStartRename = (e: React.MouseEvent, conv: ConversationSummary) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || "");
  };

  const handleSaveRename = async (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }

    // 1. Cập nhật state local
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
    );
    setEditingId(null);

    // 2. Cập nhật localStorage
    const uid = user?.id || user?.email || activeUserId;
    if (uid) {
      try {
        const storageKey = `omni_recent_convs_${uid}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const updated = list.map((c: any) =>
              c && c.id === id ? { ...c, title: trimmed } : c
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
          }
        }
      } catch {}
    }

    // 3. Gửi PATCH lên server nếu là đoạn chat trong DB
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
    } catch (err) {
      console.warn("Lỗi đồng bộ đổi tên lên server:", err);
    }
  };

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

  // Gom nhóm thời gian thông minh: Đã ghim, Hôm nay, Hôm qua, 7 ngày trước, Cũ hơn
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfSevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

    const pinned: ConversationSummary[] = [];
    const today: ConversationSummary[] = [];
    const yesterday: ConversationSummary[] = [];
    const pastSevenDays: ConversationSummary[] = [];
    const older: ConversationSummary[] = [];

    filteredConversations.forEach((conv) => {
      if (pinnedIds.includes(conv.id)) {
        pinned.push(conv);
        return;
      }
      const time = new Date(conv.updatedAt).getTime();
      if (time >= startOfToday) {
        today.push(conv);
      } else if (time >= startOfYesterday) {
        yesterday.push(conv);
      } else if (time >= startOfSevenDaysAgo) {
        pastSevenDays.push(conv);
      } else {
        older.push(conv);
      }
    });

    return [
      { key: "pinned", label: "📌 Đã ghim", items: pinned },
      { key: "today", label: "Hôm nay", items: today },
      { key: "yesterday", label: "Hôm qua", items: yesterday },
      { key: "pastSevenDays", label: "7 ngày qua", items: pastSevenDays },
      { key: "older", label: "Cũ hơn", items: older },
    ].filter((g) => g.items.length > 0);
  }, [filteredConversations, pinnedIds]);

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

      const isPureMainChat = (item: any) => {
        if (!item) return false;
        if (!isMainChatBot(item.botId)) return false;
        const titleLower = (item.title || "").toLowerCase();
        if (
          titleLower.includes("tarot") ||
          titleLower.includes("tử vi") ||
          titleLower.includes("chiêm tinh") ||
          titleLower.includes("bát tự") ||
          titleLower.includes("thầy bói") ||
          titleLower.includes("bà bà")
        ) {
          return false;
        }
        return true;
      };

      const map = new Map<string, ConversationSummary>();
      [...serverConvs, ...localConvs].forEach((item: any) => {
        if (item && item.id && !deletedIds.has(item.id) && !item.projectId && isPureMainChat(item)) {
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
  }, [user, refreshTrigger]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await showConfirm("Bạn có chắc chắn muốn xóa đoạn chat này không?", "Xác nhận xóa đoạn chat");
    if (!ok) return;

    const uid = user?.id || user?.email || activeUserId;

    setConversations((prev) => prev.filter((c) => c.id !== id));
    setPinnedIds((prev) => prev.filter((p) => p !== id));

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
        localStorage.removeItem(`omni_chat_msgs_${id}`);

        const deletedKey = `omni_deleted_conv_ids_${uid}`;
        const deletedRaw = localStorage.getItem(deletedKey);
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedList.includes(id)) {
          deletedList.push(id);
          localStorage.setItem(deletedKey, JSON.stringify(deletedList.slice(-200)));
        }
      } catch (err) {
        console.warn("Lỗi khi xóa cache local của đoạn chat:", err);
      }
    }

    if (activeConversationId === id) {
      onNewChat();
    }

    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Lỗi khi xóa cuộc trò chuyện trên server:", err);
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
          className="w-full px-2.5 py-1.5 pl-7 text-[11px] rounded-xl bg-slate-100 dark:bg-[#121422] border border-slate-200 dark:border-indigo-950/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
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
        {/* ─── PHẦN 1: DỰ ÁN (PROJECTS) ─── */}
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
              filteredProjects.map((project) => {
                const isActive = activeProjectId === project.id;
                const isExpanded = expandedProjectIds[project.id];
                const convs = project.conversations || [];

                return (
                  <div key={project.id} className="space-y-0.5">
                    <div
                      onClick={() => onSelectProject?.(project.id)}
                      className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm shrink-0">{project.icon || "📁"}</span>
                        <span className="truncate text-left font-medium">{project.name}</span>
                        {convs.length > 0 && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({convs.length})
                          </span>
                        )}
                      </div>

                      {convs.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpandProject(e, project.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <span className="text-[9px]">{isExpanded ? "▲" : "▼"}</span>
                        </button>
                      )}
                    </div>

                    {isExpanded && convs.length > 0 && (
                      <div className="pl-6 pr-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-800 ml-3 my-0.5">
                        {convs.map((conv) => {
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

        {/* ─── PHẦN 2: CÁC ĐOẠN CHAT GẦN ĐÂY (PHÂN NHÓM & GHIM) ─── */}
        <div>
          <div className="flex items-center justify-between px-1.5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>💬</span>
              <span>Đoạn chat gần đây</span>
            </span>
          </div>

          <div className="space-y-2">
            {isLoading && filteredConversations.length === 0 ? (
              <div className="px-2 py-1.5 text-[11px] text-slate-500 italic">
                Đang tải đoạn chat...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-2 py-1.5 text-[11px] text-slate-500 italic">
                Chưa có đoạn chat nào
              </div>
            ) : (
              groupedConversations.map((group) => (
                <div key={group.key} className="space-y-0.5">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400/90 dark:text-slate-500 uppercase tracking-wider">
                    {group.label}
                  </div>

                  {group.items.map((conv) => {
                    const isActive = activeConversationId === conv.id;
                    const isPinned = pinnedIds.includes(conv.id);
                    const isEditing = editingId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          if (!isEditing) onSelectConversation(conv.id);
                        }}
                        onMouseEnter={() => setHoveredId(conv.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {isPinned && (
                            <span className="text-[10px] text-amber-500 shrink-0" title="Đã ghim">
                              📌
                            </span>
                          )}

                          {isEditing ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => handleSaveRename(conv.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(conv.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-1.5 py-0.5 text-xs rounded bg-white dark:bg-slate-900 border border-indigo-500 text-slate-900 dark:text-white focus:outline-hidden"
                            />
                          ) : (
                            <span
                              className="truncate text-left flex-1"
                              onDoubleClick={(e) => handleStartRename(e, conv)}
                              title="Double click để đổi tên"
                            >
                              {conv.title}
                            </span>
                          )}
                        </div>

                        {/* Action buttons khi hover */}
                        {!isEditing && hoveredId === conv.id && (
                          <div className="flex items-center gap-0.5 shrink-0 ml-1">
                            {/* Nút Ghim/Bỏ ghim */}
                            <button
                              type="button"
                              onClick={(e) => togglePin(e, conv.id)}
                              title={isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                              className={`p-1 rounded-md transition-colors ${
                                isPinned
                                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                              }`}
                            >
                              <span className="text-[11px]">{isPinned ? "📌" : "📍"}</span>
                            </button>

                            {/* Nút Đổi tên */}
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(e, conv)}
                              title="Đổi tên đoạn chat"
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            >
                              <span className="text-[11px]">✏️</span>
                            </button>

                            {/* Nút Xóa */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteConversation(e, conv.id)}
                              title={t("sidebar.delete_chat")}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
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
