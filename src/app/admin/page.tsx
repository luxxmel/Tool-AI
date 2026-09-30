"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { CmsUser } from "@/data/userData";
import { ExplorePost, INITIAL_POSTS } from "@/data/postData";
import { useAuth } from "@/context/AuthContext";
import { usePopup } from "@/context/PopupContext";
import { TRENDING_CHARACTERS, CATEGORIZED_ASSISTANTS } from "@/data/aiData";

const USERS_STORAGE_KEY = "omni_cms_users_list";
const POSTS_STORAGE_KEY = "omni_explore_posts_list";

// ─── ANNOUNCEMENTS (mirrored from ExploreFeed.tsx) ───────────────────────────
const ANNOUNCEMENTS_DATA = [
  {
    id: 1,
    type: "new_feature" as const,
    emoji: "✨",
    tag: "Tính năng mới",
    title: "Ra mắt TTS Neural tiếng Việt chuẩn phim!",
    desc: "Giọng đọc AI Neural cực kỳ tự nhiên, hỗ trợ 3 giọng: Tổng tài, Nữ truyền cảm, Nữ ngọt ngào. Thử ngay trong khung chat!",
    cta: "Thử ngay →",
  },
  {
    id: 2,
    type: "event" as const,
    emoji: "🎉",
    tag: "Sự kiện tháng 10",
    title: "Thử thách Prompt AI — Giải thưởng 500K VND!",
    desc: "Tham gia cuộc thi tạo prompt sáng tạo nhất trong tháng 10. Bài tốt nhất được ghim trang chủ và nhận thưởng từ đội ngũ OmniAI.",
    cta: "Đăng bài dự thi →",
  },
  {
    id: 3,
    type: "tip" as const,
    emoji: "💡",
    tag: "Mẹo hay",
    title: "Dùng Magic Wand ✨ để nâng cấp prompt của bạn",
    desc: "Chức năng Magic Wand tự động cải thiện câu hỏi của bạn thành prompt chuyên nghiệp, giúp AI hiểu đúng ý hơn. Thử trong khung chat bây giờ!",
    cta: "Xem hướng dẫn →",
  },
];

// ─── Quick compose state type ─────────────────────────────────────────────────
interface ComposeForm {
  emoji: string;
  tag: string;
  title: string;
  desc: string;
  cta: string;
}

// ─── Credit search result type ────────────────────────────────────────────────
interface CreditUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  credits: number;
  _count?: { chats?: number };
}

// ─── AccessDenied component ───────────────────────────────────────────────────
function AccessDenied({ userRole }: { userRole?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-7xl mb-6 select-none">🔐</div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        Khu vực chỉ dành cho Quản trị viên
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-2">
        Bạn không có quyền truy cập vào trang quản trị này.
      </p>
      {userRole && (
        <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-2 mb-6 font-mono">
          Vai trò hiện tại: <strong>{userRole}</strong>
        </p>
      )}
      <Link
        href="/"
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/30 transition-all"
      >
        ← Quay về Trang chủ
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminCmsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showAlert, showConfirm, showError } = usePopup();

  // Admin Tab: "users" | "admins" | "posts" | "credits" | "announcements" | "bots" | "support"
  const [adminTab, setAdminTab] = useState<"users" | "admins" | "posts" | "credits" | "announcements" | "bots" | "support">("users");

  // Users State
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states for user
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"member" | "vip" | "admin">("member");

  // Posts State
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>("all");
  const [postStatusFilter, setPostStatusFilter] = useState<string>("all");

  // Credits Tab State
  const [creditSearch, setCreditSearch] = useState("");
  const [creditResults, setCreditResults] = useState<CreditUser[]>([]);
  const [creditAmounts, setCreditAmounts] = useState<Record<string, number>>({});
  const [creditToast, setCreditToast] = useState<string | null>(null);
  const [isCreditLoading, setIsCreditLoading] = useState(false);

  // Announcements compose state
  const [compose, setCompose] = useState<ComposeForm>({
    emoji: "✨",
    tag: "Tính năng mới",
    title: "",
    desc: "",
    cta: "Tìm hiểu thêm →",
  });
  const [showComposedCode, setShowComposedCode] = useState(false);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [supportReplyText, setSupportReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const fetchSupportTickets = useCallback(async () => {
    if (!user) return;
    setIsLoadingTickets(true);
    try {
      const res = await fetch(`/api/support?adminId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn hỗ trợ:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  }, [user]);

  const handleReplySupport = async () => {
    if (!selectedTicketId || !supportReplyText.trim()) return;
    try {
      setIsSendingReply(true);
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedTicketId,
          message: supportReplyText.trim(),
          sender: "ASSISTANT",
        }),
      });
      if (res.ok) {
        setSupportReplyText("");
        fetchSupportTickets();
      }
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi hỗ trợ:", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải người dùng từ DB:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts?all=true");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải bài viết từ DB:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchSupportTickets();
  }, [fetchSupportTickets]);

  useEffect(() => {
    if (adminTab === "support") {
      fetchSupportTickets();
    }
  }, [adminTab, fetchSupportTickets]);

  // ── Credit toast helper ─────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setCreditToast(msg);
    setTimeout(() => setCreditToast(null), 3000);
  }, []);

  // ── Credit search ──────────────────────────────────────────────────────────
  const handleCreditSearch = async () => {
    if (!user) return;
    setIsCreditLoading(true);
    try {
      const res = await fetch(
        `/api/admin/credits?adminId=${user.id}&search=${encodeURIComponent(creditSearch)}`
      );
      if (res.ok) {
        const data = await res.json();
        setCreditResults(data.users ?? []);
      } else {
        showToast("❌ Lỗi khi tìm kiếm người dùng");
      }
    } catch (e) {
      console.error("Lỗi tìm kiếm credits:", e);
      showToast("❌ Không thể kết nối server");
    } finally {
      setIsCreditLoading(false);
    }
  };

  // ── Credit update ──────────────────────────────────────────────────────────
  const handleCreditUpdate = async (
    targetUserId: string,
    mode: "add" | "set"
  ) => {
    if (!user) return;
    const amount = creditAmounts[targetUserId] ?? 0;
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: user.id, targetUserId, amount, mode }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(
          mode === "add"
            ? `✅ Đã cộng ${amount} credits thành công!`
            : `✅ Đã đặt credits = ${amount}!`
        );
        // Refresh credits in list
        setCreditResults((prev) =>
          prev.map((u) =>
            u.id === targetUserId
              ? { ...u, credits: data.credits ?? u.credits }
              : u
          )
        );
      } else {
        const err = await res.json();
        showToast(`❌ ${err.error ?? "Lỗi cập nhật credits"}`);
      }
    } catch (e) {
      console.error("Lỗi cập nhật credits:", e);
      showToast("❌ Không thể kết nối server");
    }
  };

  // ── Role update via credits API ─────────────────────────────────────────────
  const handleRoleUpdate = async (targetUserId: string, role: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: user.id, targetUserId, role }),
      });
      if (res.ok) {
        showToast("✅ Cập nhật vai trò thành công!");
        setCreditResults((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role } : u))
        );
      } else {
        const err = await res.json();
        showToast(`❌ ${err.error ?? "Lỗi cập nhật vai trò"}`);
      }
    } catch (e) {
      console.error("Lỗi cập nhật vai trò:", e);
      showToast("❌ Không thể kết nối server");
    }
  };

  // ── User actions ────────────────────────────────────────────────────────────
  const handleToggleStatus = async (userId: string) => {
    const u = users.find((u) => u.id === userId);
    if (!u) return;
    const newStatus = u.status === "active" ? "banned" : "active";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: newStatus as "active" | "banned" } : u
      )
    );

    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái user:", e);
    }
  };

  const handleChangeRole = async (
    userId: string,
    newRole: "admin" | "vip" | "member"
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (e) {
      console.error("Lỗi cập nhật vai trò:", e);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const ok = await showConfirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}" khỏi hệ thống?`, "Xác nhận xóa người dùng");
    if (!ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await fetch(`/api/users/${userId}`, { method: "DELETE" });
    } catch (e) {
      console.error("Lỗi xóa người dùng:", e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showAlert("Vui lòng điền đầy đủ thông tin!", "Lưu ý", "warning");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [data.user, ...prev]);
        setNewUserName("");
        setNewUserUsername("");
        setNewUserEmail("");
        setNewUserRole("member");
        setIsAddModalOpen(false);
      } else {
        const errData = await res.json();
        showError(errData.error || "Không thể tạo người dùng mới");
      }
    } catch (err) {
      console.error("Lỗi thêm người dùng:", err);
      showError("Đã xảy ra lỗi khi tạo người dùng");
    }
  };

  // ── Post actions ─────────────────────────────────────────────────────────────
  const handleTogglePostStatus = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const newStatus = post.status === "published" ? "hidden" : "published";

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, status: newStatus as "published" | "hidden" }
          : p
      )
    );

    try {
      await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái bài viết:", e);
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const ok = await showConfirm(`Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${postTitle}"?`, "Xác nhận xóa bài viết");
    if (!ok) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    } catch (e) {
      console.error("Lỗi xóa bài viết:", e);
    }
  };

  // ── Phân loại Admin và Người dùng thường ──────────────────────────────────────
  const adminUsers = users.filter((u) => u.role.toLowerCase() === "admin");
  const nonAdminUsers = users.filter((u) => u.role.toLowerCase() !== "admin");

  // ── Filtered data ────────────────────────────────────────────────────────────
  // 1. Dành cho Tab Người dùng (Thành viên & VIP - không hiển thị Admin)
  const filteredMembers = nonAdminUsers.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchQuery && matchRole && matchStatus;
  });

  // 2. Dành cho Tab Quản trị viên (Chỉ hiển thị Admin)
  const filteredAdmins = adminUsers.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const filteredPosts = posts.filter((p) => {
    const matchQuery =
      p.title.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(postSearchQuery.toLowerCase());
    const matchCategory =
      postCategoryFilter === "all" || p.category === postCategoryFilter;
    const matchStatus =
      postStatusFilter === "all" || p.status === postStatusFilter;
    return matchQuery && matchCategory && matchStatus;
  });

  // ── Metrics ─────────────────────────────────────────────────────────────────
  // Metrics cho Người dùng thường & VIP
  const totalMembers = nonAdminUsers.length;
  const activeMembers = nonAdminUsers.filter((u) => u.status === "active").length;
  const vipMembers = nonAdminUsers.filter((u) => u.role === "vip").length;
  const bannedMembers = nonAdminUsers.filter((u) => u.status === "banned").length;

  // Metrics cho Quản trị viên
  const totalAdmins = adminUsers.length;
  const activeAdmins = adminUsers.filter((u) => u.status === "active").length;
  const bannedAdmins = adminUsers.filter((u) => u.status === "banned").length;

  const totalUsers = users.length;

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const hiddenPosts = posts.filter((p) => p.status === "hidden").length;
  const totalLikes = posts.reduce((acc, p) => acc + p.likes, 0);

  const totalCredits = creditResults.reduce((acc, u) => acc + (u.credits ?? 0), 0);

  // ── Bots data ────────────────────────────────────────────────────────────────
  const allAssistants = Object.values(CATEGORIZED_ASSISTANTS).flatMap(
    (cat) => cat.items
  );
  const allBots = [
    ...TRENDING_CHARACTERS.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      badge: c.tag,
      category: "character",
      description: c.description,
    })),
    ...allAssistants.map((a) => ({
      id: a.id,
      name: a.name,
      avatar: a.avatar,
      badge: a.badge ?? a.category,
      category: "assistant",
      description: a.description,
    })),
  ].filter(
    (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
  );

  const botsCharCount = allBots.filter((b) => b.category === "character").length;
  const botsAssistantCount = allBots.filter((b) => b.category === "assistant").length;

  // ── Compose code output ──────────────────────────────────────────────────────
  const composedCode = `{
  id: ${Date.now()},
  type: "new_feature" as const,
  emoji: "${compose.emoji}",
  tag: "${compose.tag}",
  tagColor: "from-violet-600 to-indigo-600",
  title: "${compose.title}",
  desc: "${compose.desc}",
  cta: "${compose.cta}",
  ctaHref: "#",
  bg: "from-violet-950/80 via-indigo-950/80 to-slate-950/90",
  accent: "border-violet-500/40",
  image: "",
},`;

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090a0f]">
        <div className="text-slate-400 text-sm animate-pulse">Đang xác thực...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role?.toUpperCase() !== "ADMIN") {
    return (
      <AccessDenied userRole={isAuthenticated && user ? user.role : undefined} />
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Toast Notification */}
      {creditToast && (
        <div className="fixed top-4 right-4 z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 shadow-xl text-sm font-semibold text-slate-800 dark:text-slate-100 animate-in slide-in-from-right fade-in duration-300">
          {creditToast}
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0c0d12] border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            title="Quay về Trang chủ"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-black shadow-md shadow-rose-600/30">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight hidden sm:inline">
              omni<span className="text-rose-500">.ai</span>
            </span>
          </Link>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          {/* Admin Tab Switcher — scrollable row */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-[calc(100vw-220px)] sm:max-w-none scrollbar-none">
            {(
              [
                { key: "users", label: "👥 Người dùng", count: totalMembers, color: "indigo" },
                { key: "admins", label: "🛡️ Quản trị viên", count: totalAdmins, color: "purple" },
                { key: "posts", label: "📝 Bài viết", count: totalPosts, color: "rose" },
                { key: "credits", label: "💰 Credits", count: null, color: "emerald" },
                { key: "announcements", label: "🔔 Thông báo", count: null, color: "amber" },
                { key: "support", label: "💬 Hỗ trợ", count: supportTickets.length, color: "cyan" },
                { key: "bots", label: "🤖 Nhân vật", count: allBots.length, color: "violet" },
              ] as const
            ).map(({ key, label, count, color }) => {
              const active = adminTab === key;
              const colorMap: Record<string, string> = {
                indigo: "text-indigo-600 dark:text-indigo-400",
                purple: "text-purple-600 dark:text-purple-400",
                rose: "text-rose-600 dark:text-rose-400",
                emerald: "text-emerald-600 dark:text-emerald-400",
                amber: "text-amber-600 dark:text-amber-400",
                violet: "text-violet-600 dark:text-violet-400",
              };
              return (
                <button
                  key={key}
                  onClick={() => setAdminTab(key)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    active
                      ? `bg-white dark:bg-slate-800 ${colorMap[color]} shadow-xs`
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                  {count !== null && (
                    <span className="ml-1 opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex items-center gap-1"
          >
            ← Về nhà
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer"
            title="Chuyển chế độ sáng/tối"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                "AD"
              )}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">
              {user.displayName || "Admin"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: USERS MANAGEMENT (THÀNH VIÊN & VIP - TÁCH BIỆT ADMIN)
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "users" && (
          <>
            {/* Sub-tab Switcher chuyển nhanh giữa Người dùng và Admin */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl w-fit border border-slate-300/60 dark:border-slate-800">
              <button
                onClick={() => setAdminTab("users")}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
              >
                <span>👥 Người dùng thường & VIP</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {totalMembers}
                </span>
              </button>

              <button
                onClick={() => setAdminTab("admins")}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <span>🛡️ Ban Quản Trị (Admin)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-mono font-bold">
                  {totalAdmins}
                </span>
              </button>
            </div>

            {/* Metric Cards dành riêng cho Người dùng */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tổng thành viên</span>
                  <span className="text-indigo-500 text-lg">👥</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {totalMembers}
                </div>
                <div className="text-xs text-emerald-500 font-medium mt-1">
                  Người dùng và khách hàng
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Đang hoạt động</span>
                  <span className="text-emerald-500 text-lg">🟢</span>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {activeMembers}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {Math.round((activeMembers / (totalMembers || 1)) * 100)}% thành viên khả dụng
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tài khoản VIP</span>
                  <span className="text-amber-500 text-lg">⭐</span>
                </div>
                <div className="text-3xl font-black text-amber-500 font-mono">
                  {vipMembers}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gói thành viên cao cấp
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tài khoản bị khóa</span>
                  <span className="text-rose-500 text-lg">🔒</span>
                </div>
                <div className="text-3xl font-black text-rose-500 font-mono">
                  {bannedMembers}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tạm ngưng hoạt động
                </div>
              </div>
            </div>

            {/* User Table Card */}
            <div className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>👥</span>
                    <span>Danh sách Người dùng (Thành viên & VIP)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quản lý thành viên, nâng cấp VIP, phân quyền hoặc khóa tài khoản vi phạm
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên, username, email..."
                      className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <svg
                      className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="vip">Thành viên VIP ⭐</option>
                    <option value="member">Thành viên thường</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="banned">Bị khóa</option>
                  </select>

                  <button
                    onClick={() => {
                      setNewUserRole("member");
                      setIsAddModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>➕</span>
                    <span>Thêm thành viên</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Người dùng</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Vai trò</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Ngày tham gia</th>
                      <th className="py-3 px-4">Lượt Prompt</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không tìm thấy người dùng nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {u.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  @{u.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                            {u.email}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={async (e) => {
                                const newRole = e.target.value as "admin" | "vip" | "member";
                                if (newRole === "admin") {
                                  const ok = await showConfirm(`Bạn có chắc chắn muốn nâng cấp "${u.name}" thành Quản trị viên (Admin)? Họ sẽ có toàn quyền can thiệp hệ thống.`, "Cảnh báo quyền Admin");
                                  if (ok) {
                                    handleChangeRole(u.id, newRole);
                                  }
                                } else {
                                  handleChangeRole(u.id, newRole);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                u.role === "vip"
                                  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <option value="member">Thành viên thường</option>
                              <option value="vip">Thành viên VIP ⭐</option>
                              <option value="admin">Thăng cấp Admin 🛡️</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                u.status === "active"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {u.joinedDate}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 font-medium">
                            {u.promptsCount}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(u.id)}
                                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                  u.status === "active"
                                    ? "bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600"
                                    : "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                                }`}
                                title={u.status === "active" ? "Khóa tài khoản này" : "Mở khóa tài khoản"}
                              >
                                {u.status === "active" ? "🔒 Khóa" : "🔓 Mở"}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Xóa tài khoản"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB MỚI: QUẢN TRỊ VIÊN (ADMINS ONLY - TÁCH RIÊNG HOÀN TOÀN)
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "admins" && (
          <>
            {/* Sub-tab Switcher chuyển nhanh giữa Người dùng và Admin */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl w-fit border border-slate-300/60 dark:border-slate-800">
              <button
                onClick={() => setAdminTab("users")}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <span>👥 Người dùng thường & VIP</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {totalMembers}
                </span>
              </button>

              <button
                onClick={() => setAdminTab("admins")}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs"
              >
                <span>🛡️ Ban Quản Trị (Admin)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-mono font-bold">
                  {totalAdmins}
                </span>
              </button>
            </div>

            {/* Banner cảnh báo bảo mật khu vực Admin */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-purple-200">
                    Khu Vực Phân Quyền Ban Quản Trị Hệ Thống (Admin Role)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tài khoản Quản trị viên có toàn quyền truy cập cơ sở dữ liệu, quản lý CMS, cấp phát Credits và khóa người dùng.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewUserRole("admin");
                  setIsAddModalOpen(true);
                }}
                className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>➕</span>
                <span>Thêm Quản trị viên</span>
              </button>
            </div>

            {/* Metric Cards dành riêng cho Quản trị viên */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tổng Quản trị viên</span>
                  <span className="text-purple-500 text-lg">🛡️</span>
                </div>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {totalAdmins}
                </div>
                <div className="text-xs text-purple-500/80 font-medium mt-1">
                  Đặc quyền can thiệp hệ thống
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Admin Đang hoạt động</span>
                  <span className="text-emerald-500 text-lg">🟢</span>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {activeAdmins}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tài khoản đang sẵn sàng
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Cấp phép quyền</span>
                  <span className="text-indigo-500 text-lg">⚡</span>
                </div>
                <div className="text-2xl font-black text-indigo-500 font-mono">
                  Root Admin
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Toàn quyền quản trị
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Admin bị khóa</span>
                  <span className="text-rose-500 text-lg">🔒</span>
                </div>
                <div className="text-3xl font-black text-rose-500 font-mono">
                  {bannedAdmins}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {bannedAdmins === 0 ? "Không có tài khoản bị vô hiệu" : "Đã vô hiệu hóa quyền"}
                </div>
              </div>
            </div>

            {/* Admin Table Card */}
            <div className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-purple-900/30 rounded-3xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Danh sách Quản trị viên (Admins)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Xem thông tin, điều chỉnh quyền hạn quản trị hoặc thu hồi quyền admin
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm admin..."
                      className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <svg
                      className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="banned">Bị khóa</option>
                  </select>

                  <button
                    onClick={() => {
                      setNewUserRole("admin");
                      setIsAddModalOpen(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>➕</span>
                    <span>Thêm Quản trị viên</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Quản trị viên</th>
                      <th className="py-3 px-4">Email Quản trị</th>
                      <th className="py-3 px-4">Cấp bậc</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Ngày cấp quyền</th>
                      <th className="py-3 px-4">Thao tác Prompt</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không tìm thấy Quản trị viên nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/50 bg-slate-100 dark:bg-slate-800 shrink-0"
                                />
                                <span className="absolute -bottom-1 -right-1 text-[10px]" title="Quản trị viên">
                                  🛡️
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {user?.id === u.id && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400 font-normal">
                                      (Bạn)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  @{u.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-purple-600 dark:text-purple-300 font-mono font-medium">
                            {u.email}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={async (e) => {
                                const newRole = e.target.value as "admin" | "vip" | "member";
                                if (newRole !== "admin") {
                                  const ok = await showConfirm(`Bạn có chắc chắn muốn hạ quyền Quản trị viên của "${u.name}" xuống "${newRole === "vip" ? "VIP" : "Thành viên thường"}"?`, "Hạ quyền Admin");
                                  if (ok) {
                                    handleChangeRole(u.id, newRole);
                                  }
                                } else {
                                  handleChangeRole(u.id, newRole);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40"
                            >
                              <option value="admin">Quản trị viên (Admin) 🛡️</option>
                              <option value="vip">Hạ xuống VIP ⭐</option>
                              <option value="member">Hạ xuống Thành viên</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                u.status === "active"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {u.joinedDate}
                          </td>

                          <td className="py-3 px-4 font-mono text-purple-600 dark:text-purple-400 font-bold">
                            {u.promptsCount}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(u.id)}
                                disabled={user?.id === u.id}
                                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                  u.status === "active"
                                    ? "bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600"
                                    : "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                                }`}
                                title={
                                  user?.id === u.id
                                    ? "Không thể tự khóa tài khoản của chính mình"
                                    : u.status === "active"
                                    ? "Khóa tài khoản admin này"
                                    : "Mở khóa tài khoản admin"
                                }
                              >
                                {u.status === "active" ? "🔒 Khóa" : "🔓 Mở"}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                disabled={user?.id === u.id}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={user?.id === u.id ? "Không thể tự xóa chính mình" : "Xóa tài khoản admin này"}
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: POSTS MODERATION
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "posts" && (
          <>
            {/* Post Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tổng bài đăng</span>
                  <span className="text-rose-500 text-lg">📝</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {totalPosts}
                </div>
                <div className="text-xs text-rose-500 font-medium mt-1">
                  Cộng đồng Khám phá
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Đang hiển thị</span>
                  <span className="text-emerald-500 text-lg">🟢</span>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {publishedPosts}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Công khai cho người dùng
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Bài viết đã ẩn</span>
                  <span className="text-amber-500 text-lg">🔒</span>
                </div>
                <div className="text-3xl font-black text-amber-500 font-mono">
                  {hiddenPosts}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đang kiểm duyệt / Tạm ẩn
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tổng lượt thích</span>
                  <span className="text-rose-500 text-lg">❤️</span>
                </div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {totalLikes}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tương tác toàn cộng đồng
                </div>
              </div>
            </div>

            {/* Post Moderation Table */}
            <div className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Kiểm duyệt Bài viết Cộng đồng (Khám phá)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quản lý, ẩn hoặc xóa các bài viết chia sẻ từ người dùng
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      placeholder="Tìm bài viết, tác giả..."
                      className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    <svg
                      className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <select
                    value={postCategoryFilter}
                    onChange={(e) => setPostCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="all">Tất cả chuyên mục</option>
                    <option value="prompt">Prompt AI</option>
                    <option value="art">Nghệ thuật AI</option>
                    <option value="code">Lập trình & Code</option>
                    <option value="assistant">Chia sẻ Trợ lý</option>
                    <option value="general">Thảo luận</option>
                  </select>

                  <select
                    value={postStatusFilter}
                    onChange={(e) => setPostStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="published">Đang hiển thị</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Bài viết</th>
                      <th className="py-3 px-4">Tác giả</th>
                      <th className="py-3 px-4">Chuyên mục</th>
                      <th className="py-3 px-4">Tương tác</th>
                      <th className="py-3 px-4">Ngày đăng</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Kiểm duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không tìm thấy bài viết nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post) => (
                        <tr
                          key={post.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 max-w-[280px]">
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {post.title}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {post.content}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                  {post.author.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  @{post.author.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {post.categoryLabel}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                            ❤️ {post.likes} • 💬 {post.commentsCount}
                          </td>

                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {post.createdAt}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                post.status === "published"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  post.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              {post.status === "published" ? "Công khai" : "Đã ẩn"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleTogglePostStatus(post.id)}
                                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                  post.status === "published"
                                    ? "bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600"
                                    : "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                                }`}
                                title={post.status === "published" ? "Tạm ẩn bài viết này khỏi Khám phá" : "Công khai lại bài viết"}
                              >
                                {post.status === "published" ? "👁️ Ẩn" : "🔓 Hiện"}
                              </button>

                              <button
                                onClick={() => handleDeletePost(post.id, post.title)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Xóa vĩnh viễn bài viết"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: CREDITS MANAGEMENT
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "credits" && (
          <>
            {/* Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tổng credits (kết quả tìm)</span>
                  <span className="text-emerald-500 text-lg">💰</span>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {totalCredits.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {creditResults.length} người dùng trong kết quả
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs sm:col-span-2 flex flex-col justify-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                  Tìm người dùng theo email hoặc tên:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={creditSearch}
                    onChange={(e) => setCreditSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreditSearch()}
                    placeholder="Email hoặc tên người dùng..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    onClick={handleCreditSearch}
                    disabled={isCreditLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    {isCreditLoading ? "⏳" : "🔍 Tìm"}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Table */}
            {creditResults.length > 0 && (
              <div className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800/80">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Kết quả tìm kiếm ({creditResults.length} người dùng)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Người dùng</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Credits</th>
                        <th className="py-3 px-4">Vai trò</th>
                        <th className="py-3 px-4">Cấp Credits</th>
                        <th className="py-3 px-4">Đổi vai trò</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {creditResults.map((cu) => (
                        <tr
                          key={cu.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Avatar + Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                {cu.avatar ? (
                                  <img src={cu.avatar} alt={cu.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                    {cu.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {cu.name}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                            {cu.email}
                          </td>

                          {/* Credits badge */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                              💰 {(cu.credits ?? 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                cu.role === "ADMIN"
                                  ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40"
                                  : cu.role === "VIP"
                                  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {cu.role}
                            </span>
                          </td>

                          {/* Credits actions */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                value={creditAmounts[cu.id] ?? ""}
                                onChange={(e) =>
                                  setCreditAmounts((prev) => ({
                                    ...prev,
                                    [cu.id]: Number(e.target.value),
                                  }))
                                }
                                placeholder="0"
                                className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                onClick={() => handleCreditUpdate(cu.id, "add")}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer active:scale-95"
                                title="Cộng thêm credits"
                              >
                                Cộng ➕
                              </button>
                              <button
                                onClick={() => handleCreditUpdate(cu.id, "set")}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer active:scale-95"
                                title="Đặt credits về con số này"
                              >
                                Đặt 📌
                              </button>
                            </div>
                          </td>

                          {/* Role change */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <select
                                defaultValue={cu.role}
                                onChange={(e) => {
                                  // Store selection via a ref-like approach on change then submit
                                  const sel = e.target;
                                  sel.dataset.pendingRole = e.target.value;
                                }}
                                id={`role-select-${cu.id}`}
                                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="USER">USER</option>
                                <option value="VIP">VIP</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                              <button
                                onClick={() => {
                                  const sel = document.getElementById(`role-select-${cu.id}`) as HTMLSelectElement;
                                  if (sel) handleRoleUpdate(cu.id, sel.value);
                                }}
                                className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer active:scale-95"
                              >
                                Cập nhật
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {creditResults.length === 0 && !isCreditLoading && creditSearch && (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">🔍</div>
                <p>Không tìm thấy người dùng nào khớp với &quot;{creditSearch}&quot;</p>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: ANNOUNCEMENTS
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "announcements" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Đang hiển thị</div>
                <div className="text-3xl font-black text-amber-500 font-mono">3</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">thông báo</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Loại</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 space-y-1">
                  <div>✨ new_feature</div>
                  <div>🎉 event</div>
                  <div>💡 tip</div>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Vị trí file</div>
                <code className="text-[10px] text-indigo-500 dark:text-indigo-400 break-all font-mono">
                  src/components/explore/ExploreFeed.tsx
                </code>
              </div>
            </div>

            {/* Info box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex gap-3">
              <span className="text-xl shrink-0">💡</span>
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">
                  Để chỉnh nội dung thông báo:
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-400">
                  Mở file{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300">
                    src/components/explore/ExploreFeed.tsx
                  </code>{" "}
                  → tìm{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300">
                    const ANNOUNCEMENTS
                  </code>{" "}
                  và chỉnh mảng dữ liệu trực tiếp.
                </p>
              </div>
            </div>

            {/* Current announcements preview */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                📋 Thông báo đang hiển thị (xem trước)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ANNOUNCEMENTS_DATA.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{ann.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {ann.tag}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              ann.type === "new_feature"
                                ? "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                                : ann.type === "event"
                                ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                : "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {ann.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
                      {ann.desc}
                    </p>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {ann.cta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Compose */}
            <div className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                ✍️ Soạn thông báo mới (tạo code sẵn)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={compose.emoji}
                    onChange={(e) => setCompose((p) => ({ ...p, emoji: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={compose.tag}
                    onChange={(e) => setCompose((p) => ({ ...p, tag: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={compose.title}
                    onChange={(e) => setCompose((p) => ({ ...p, title: e.target.value }))}
                    placeholder="VD: Ra mắt tính năng mới X..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={compose.desc}
                    onChange={(e) => setCompose((p) => ({ ...p, desc: e.target.value }))}
                    placeholder="Nội dung mô tả chi tiết..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                    Nút CTA
                  </label>
                  <input
                    type="text"
                    value={compose.cta}
                    onChange={(e) => setCompose((p) => ({ ...p, cta: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowComposedCode((v) => !v)}
                disabled={!compose.title || !compose.desc}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-sm shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
              >
                {showComposedCode ? "🙈 Ẩn code" : "📋 Tạo code để copy"}
              </button>

              {showComposedCode && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Copy đoạn code này và thêm vào mảng ANNOUNCEMENTS trong ExploreFeed.tsx:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 text-xs font-mono rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap border border-slate-700">
                    {composedCode}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: HỖ TRỢ KHÁCH HÀNG (SUPPORT TICKETS)
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "support" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💬</span>
                  <span>Trung Tâm Tiếp Nhận & Hỗ Trợ Khách Hàng</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý và phản hồi trực tiếp các yêu cầu hỗ trợ từ người dùng trong hệ thống
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSupportTickets}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>🔄 Tải lại danh sách</span>
              </button>
            </div>

            {isLoadingTickets ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tải các yêu cầu hỗ trợ...</span>
              </div>
            ) : supportTickets.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-[#111218] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-4xl block">📩</span>
                <p className="font-bold text-slate-700 dark:text-slate-300">Chưa có yêu cầu hỗ trợ nào</p>
                <p className="text-slate-500">Các tin nhắn phản hồi từ người dùng sẽ tự động xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[620px]">
                {/* Left Ticket List */}
                <div className="md:col-span-4 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl p-3 flex flex-col overflow-hidden">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1 mb-2">
                    Danh sách yêu cầu ({supportTickets.length})
                  </div>
                  <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                    {supportTickets.map((t) => {
                      const isSelected = selectedTicketId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-500 font-semibold"
                              : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={t.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(t.user?.email || "user")}`}
                              alt={t.user?.name || "User"}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <span className="text-xs font-bold truncate">
                              {t.user?.name || t.user?.email}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold ml-auto shrink-0">
                              {t.user?.role || "USER"}
                            </span>
                          </div>
                          <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {t.lastMessage}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-1">
                            {new Date(t.updatedAt).toLocaleString("vi-VN")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Chat Conversation View */}
                <div className="md:col-span-8 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between overflow-hidden">
                  {selectedTicketId ? (
                    (() => {
                      const activeTicket = supportTickets.find((t) => t.id === selectedTicketId);
                      if (!activeTicket) return null;

                      return (
                        <>
                          {/* Chat Header */}
                          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={activeTicket.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(activeTicket.user?.email || "user")}`}
                                alt="User"
                                className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                              />
                              <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {activeTicket.user?.name || activeTicket.user?.email}
                                </h3>
                                <p className="text-[10px] text-slate-500">{activeTicket.user?.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                              ID: {activeTicket.id.slice(0, 8)}
                            </span>
                          </div>

                          {/* Chat Messages */}
                          <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-2">
                            {activeTicket.messages.map((m: any) => {
                              const isAdminSender = m.sender === "ASSISTANT";
                              return (
                                <div
                                  key={m.id}
                                  className={`flex ${isAdminSender ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                                      isAdminSender
                                        ? "bg-indigo-600 text-white rounded-br-xs"
                                        : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-bl-xs"
                                    }`}
                                  >
                                    <div className="font-semibold text-[10px] opacity-75">
                                      {isAdminSender ? "🛡️ Ban Quản Trị (Admin)" : `👤 ${activeTicket.user?.name || "Người dùng"}`}
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                    <div className="text-[9px] opacity-60 text-right">
                                      {new Date(m.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Reply Input Form */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                            <input
                              type="text"
                              value={supportReplyText}
                              onChange={(e) => setSupportReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReplySupport();
                                }
                              }}
                              placeholder="Nhập câu trả lời của Admin để gửi cho người dùng..."
                              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
                            />
                            <button
                              type="button"
                              disabled={isSendingReply || !supportReplyText.trim()}
                              onClick={handleReplySupport}
                              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                              {isSendingReply ? "⏳ Đang gửi..." : "Gửi Phản Hồi ➔"}
                            </button>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-2">
                      <span className="text-3xl">👈</span>
                      <p>Vui lòng chọn một cuộc trò chuyện hỗ trợ từ danh sách bên trái để xem nội dung và phản hồi.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: BOTS / CHARACTERS
        ══════════════════════════════════════════════════════════════════════ */}
        {adminTab === "bots" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Tổng Bot / Nhân vật</div>
                <div className="text-3xl font-black text-violet-600 dark:text-violet-400 font-mono">{allBots.length}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bao gồm cả trợ lý và nhân vật</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Nhân vật (Characters)</div>
                <div className="text-3xl font-black text-rose-500 font-mono">{botsCharCount}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Roleplay & sáng tạo</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Trợ lý (Assistants)</div>
                <div className="text-3xl font-black text-indigo-500 font-mono">{botsAssistantCount}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Học tập, công việc & giải trí</div>
              </div>
            </div>

            {/* Bot Grid */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                🤖 Danh sách tất cả Bot & Nhân vật
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="bg-white dark:bg-[#111218] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Avatar */}
                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                      <img
                        src={bot.avatar}
                        alt={bot.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=6366f1&color=fff&size=200`;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            bot.category === "character"
                              ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                              : "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {bot.category === "character" ? "Nhân vật" : "Trợ lý"}
                        </span>
                        {bot.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[80px]">
                            {bot.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                        {bot.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Người Dùng Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="VD: nguyenvana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="VD: vana@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Vai trò
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(e.target.value as "member" | "vip" | "admin")
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="member">Thành viên thường</option>
                  <option value="vip">Thành viên VIP ⭐</option>
                  <option value="admin">Quản trị viên (Admin) 🛡️</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
