"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExplorePost } from "@/data/postData";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import Link from "next/link";

interface ExploreFeedProps {
  onOpenLoginModal: () => void;
}

// ─── DATA SỰ KIỆN & THÔNG BÁO (Admin chỉnh tại đây) ────────────────────────
const ANNOUNCEMENTS = [
  {
    id: 1,
    type: "new_feature" as const,
    emoji: "✨",
    tag: "Tính năng mới",
    tagEn: "New Feature",
    tagColor: "from-violet-600 to-indigo-600",
    title: "Ra mắt TTS Neural tiếng Việt chuẩn phim!",
    titleEn: "Cinema-Grade Neural TTS Voice is Live!",
    desc: "Giọng đọc AI Neural cực kỳ tự nhiên, hỗ trợ 3 giọng: Tổng tài, Nữ truyền cảm, Nữ ngọt ngào. Thử ngay trong khung chat!",
    descEn: "Ultra-natural AI Neural voice reader with 3 expressive tones. Try it out right in the chat room!",
    cta: "Thử ngay →",
    ctaEn: "Try Now →",
    ctaHref: "#",
    bg: "from-violet-950/80 via-indigo-950/80 to-slate-950/90",
    accent: "border-violet-500/40",
    image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    type: "event" as const,
    emoji: "🎉",
    tag: "Sự kiện tháng 10",
    tagEn: "October Event",
    tagColor: "from-rose-600 to-orange-500",
    title: "Thử thách Prompt AI — Giải thưởng 500K VND!",
    titleEn: "AI Prompt Contest — Win 500K VND Prizes!",
    desc: "Tham gia cuộc thi tạo prompt sáng tạo nhất trong tháng 10. Bài tốt nhất được ghim trang chủ và nhận thưởng từ đội ngũ OmniAI.",
    descEn: "Participate in the most creative AI prompt contest. Top submissions will be featured on homepage with rewards.",
    cta: "Đăng bài dự thi →",
    ctaEn: "Submit Entry →",
    ctaHref: "#",
    bg: "from-rose-950/80 via-orange-950/70 to-slate-950/90",
    accent: "border-rose-500/40",
    image: "https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    type: "tip" as const,
    emoji: "💡",
    tag: "Mẹo hay",
    tagEn: "Pro Tip",
    tagColor: "from-amber-500 to-yellow-500",
    title: "Dùng Magic Wand ✨ để nâng cấp prompt của bạn",
    titleEn: "Use Magic Wand ✨ to Supercharge Your Prompts",
    desc: "Chức năng Magic Wand tự động cải thiện câu hỏi của bạn thành prompt chuyên nghiệp, giúp AI hiểu đúng ý hơn. Thử trong khung chat bây giờ!",
    descEn: "Magic Wand automatically refines your query into a professional prompt for higher AI precision. Try it in chat now!",
    cta: "Xem hướng dẫn →",
    ctaEn: "Learn More →",
    ctaHref: "#",
    bg: "from-amber-950/70 via-yellow-950/60 to-slate-950/90",
    accent: "border-amber-500/40",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&auto=format&fit=crop&q=80",
  },
];

// ─── TOP CONTRIBUTORS TYPE ───────────────────────────────────────────────────
export interface ContributorItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  posts: number;
  likes: number;
  badge: string;
  role: string;
}

// ─── COMMUNITY RULES ─────────────────────────────────────────────────────────
const COMMUNITY_RULES_VI = [
  "Chia sẻ prompt & mẹo AI hữu ích",
  "Tôn trọng thành viên khác",
  "Không đăng nội dung vi phạm bản quyền",
  "Dán nhãn chuyên mục đúng chủ đề",
  "Báo cáo nội dung không phù hợp",
];

const COMMUNITY_RULES_EN = [
  "Share useful AI prompts & actionable tips",
  "Respect all community members",
  "Do not post copyrighted or prohibited content",
  "Tag posts with accurate categories",
  "Report inappropriate or harmful content",
];

// ─── CATEGORY MAP ─────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  prompt: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50",
  art: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
  code: "bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50",
  assistant: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
  general: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
};

export default function ExploreFeed({ onOpenLoginModal }: ExploreFeedProps) {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { showAlert, showConfirm, showError, showSuccess } = usePopup();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [topContributors, setTopContributors] = useState<ContributorItem[]>([]);
  const [isContributorsLoading, setIsContributorsLoading] = useState(true);

  // Trending questions state
  interface TrendingQuestion { text: string; count: number; }
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [trendingPeriod, setTrendingPeriod] = useState<"24h" | "7d">("24h");
  const [trendingEmpty, setTrendingEmpty] = useState(false);

  // Banner carousel state
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const categoryNavRef = useRef<HTMLDivElement | null>(null);

  // Auto-advance banner
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerIdx((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, []);

  const goBanner = (idx: number) => {
    setBannerIdx(idx);
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
      setBannerIdx((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 5000);
  };

  // Reaction configuration
  const REACTION_CONFIG: Record<
    string,
    { emoji: string; label: string; labelEn: string; color: string; bg: string }
  > = {
    like: { emoji: "👍", label: "Thích", labelEn: "Like", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
    love: { emoji: "❤️", label: "Yêu thích", labelEn: "Love", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" },
    fire: { emoji: "🔥", label: "Tuyệt vời", labelEn: "Fire", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
    haha: { emoji: "😄", label: "Thú vị", labelEn: "Haha", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30" },
    insight: { emoji: "💡", label: "Hữu ích", labelEn: "Insight", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
  };

  // Reactions state
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);

  // Comments state
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isCommentSubmitting, setIsCommentSubmitting] = useState<Record<string, boolean>>({});

  // Share Toast state
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Edit post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<string>("prompt");
  const [editImage, setEditImage] = useState<string>("");
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const url = user?.id ? `/api/posts?userId=${user.id}` : "/api/posts";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải bài viết:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch top contributors từ cơ sở dữ liệu thật
  const fetchTopContributors = async () => {
    try {
      setIsContributorsLoading(true);
      const res = await fetch("/api/contributors");
      if (res.ok) {
        const data = await res.json();
        if (data.contributors && Array.isArray(data.contributors)) {
          setTopContributors(data.contributors);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải top đóng góp:", err);
    } finally {
      setIsContributorsLoading(false);
    }
  };

  // Fetch câu hỏi hot nhất hôm nay
  const fetchTrendingQuestions = async () => {
    try {
      setIsTrendingLoading(true);
      const res = await fetch("/api/trending-questions");
      if (res.ok) {
        const data = await res.json();
        setTrendingQuestions(data.questions || []);
        setTrendingEmpty(data.isEmpty === true);
        setTrendingPeriod(data.period === "7d" ? "7d" : "24h");
      }
    } catch (err) {
      console.error("Lỗi khi tải câu hỏi hot:", err);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTopContributors();
    fetchTrendingQuestions();
  }, [user?.id]);

  const handleCreatePost = (newPost: ExplorePost) => {
    setPosts((prev) => [newPost, ...prev]);
    fetchTopContributors();
    setShareToast(language === "en" ? "Post published successfully!" : "Đã đăng bài viết mới thành công!");
    setTimeout(() => setShareToast(null), 2500);
  };

  // Bày tỏ cảm xúc (Reactions)
  const handleReaction = async (postId: string, type: string) => {
    if (!isAuthenticated || !user) {
      onOpenLoginModal();
      return;
    }
    setActiveReactionPicker(null);

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const currentReaction = p.userReaction;
        const isRemoving = currentReaction === type;
        const newUserReaction = isRemoving ? null : type;
        const diff = isRemoving ? -1 : currentReaction ? 0 : 1;
        const newLikes = Math.max(0, p.likes + diff);

        const newReactions = { ...(p.reactions || {}) };
        if (currentReaction && newReactions[currentReaction]) {
          newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
        }
        if (!isRemoving) {
          newReactions[type] = (newReactions[type] || 0) + 1;
        }

        return {
          ...p,
          likes: newLikes,
          userReaction: newUserReaction,
          reactions: newReactions,
        };
      })
    );

    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: data.totalLikes,
                  userReaction: data.userReaction,
                  reactions: data.reactions,
                }
              : p
          )
        );
        fetchTopContributors();
      }
    } catch (err) {
      console.error("Lỗi cập nhật cảm xúc:", err);
    }
  };

  // Bật/tắt khung bình luận
  const handleToggleComments = (postId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Gửi bình luận mới
  const handleAddComment = async (postId: string) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    if (!isAuthenticated || !user) {
      onOpenLoginModal();
      return;
    }

    try {
      setIsCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              commentsCount: data.commentsCount,
              comments: [...(p.comments || []), data.comment],
            };
          })
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        setShareToast(language === "en" ? "Comment added!" : "Đã gửi bình luận!");
        setTimeout(() => setShareToast(null), 2000);
      }
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
    } finally {
      setIsCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Xóa bình luận
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!user) return;
    const ok = await showConfirm(
      language === "en" ? "Are you sure you want to delete this comment?" : "Bạn có chắc chắn muốn xóa bình luận này?",
      "Xác nhận xóa"
    );
    if (!ok) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}&userId=${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              commentsCount: data.commentsCount,
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            };
          })
        );
      }
    } catch (err) {
      console.error("Lỗi xóa bình luận:", err);
    }
  };

  // Chia sẻ bài viết (Web Share hoặc Copy Link)
  const handleSharePost = async (post: ExplorePost) => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/?tab=explore#${post.id}` : "";
    const shareData = {
      title: post.title,
      text: `${post.title}\n\n${post.content.slice(0, 140)}...`,
      url: shareUrl,
    };

    if (navigator.share && typeof window !== "undefined" && window.innerWidth < 768) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl || `${post.title}\n${post.content}`);
      setShareToast(language === "en" ? "Link copied to clipboard!" : "Đã sao chép liên kết bài viết!");
      setTimeout(() => setShareToast(null), 2500);
    } catch (err) {
      console.error("Lỗi sao chép liên kết:", err);
    }
  };

  const handleCopyPrompt = (postId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      onOpenLoginModal();
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Chỉnh sửa bài viết
  const handleStartEdit = (post: ExplorePost) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category || "prompt");
    setEditImage(post.image || "");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory("prompt");
    setEditImage("");
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      showAlert(
        language === "en" ? "Title and content cannot be empty!" : "Tiêu đề và nội dung không được để trống!",
        "Lưu ý",
        "warning"
      );
      return;
    }
    const catObj = categories.find((c) => c.id === editCategory);
    try {
      setIsEditingSaving(true);
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: editTitle.trim(),
          content: editContent.trim(),
          category: editCategory,
          categoryLabel: catObj?.label || "Prompt AI",
          image: editImage.trim() || null,
        }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  title: editTitle.trim(),
                  content: editContent.trim(),
                  category: editCategory as any,
                  categoryLabel: catObj?.label || "Prompt AI",
                  image: editImage.trim() || undefined,
                }
              : p
          )
        );
        setEditingPostId(null);
        showSuccess(language === "en" ? "Post updated successfully!" : "Đã cập nhật bài viết thành công!");
      } else {
        const data = await res.json();
        showError(data.error || (language === "en" ? "Failed to update post" : "Không thể cập nhật bài viết"));
      }
    } catch (err) {
      console.error("Lỗi sửa bài viết:", err);
      showError("Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setIsEditingSaving(false);
    }
  };

  // Xóa bài viết
  const handleDeletePost = async (postId: string) => {
    const ok = await showConfirm(
      t("explore.delete_post_confirm", "Bạn có chắc chắn muốn xóa bài viết này không?"),
      "Xác nhận xóa bài viết"
    );
    if (!ok) return;
    try {
      const url = user?.id ? `/api/posts/${postId}?userId=${user.id}` : `/api/posts/${postId}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        fetchTopContributors();
        showSuccess(language === "en" ? "Post deleted!" : "Đã xóa bài viết thành công!");
      } else {
        const data = await res.json();
        showError(data.error || (language === "en" ? "Failed to delete post" : "Không thể xóa bài viết"));
      }
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
      showError("Đã xảy ra lỗi khi kết nối máy chủ");
    }
  };

  const categories = [
    { id: "all", label: t("explore.filter_all", "Tất cả"), emoji: "🌐" },
    { id: "prompt", label: t("explore.filter_prompt", "Prompt AI"), emoji: "✨" },
    { id: "art", label: t("explore.filter_art", "Nghệ thuật AI"), emoji: "🎨" },
    { id: "code", label: t("explore.filter_code", "Lập trình"), emoji: "💻" },
    { id: "assistant", label: t("explore.filter_assistant", "Trợ lý"), emoji: "🤖" },
    { id: "general", label: t("explore.filter_general", "Thảo luận"), emoji: "💬" },
  ];

  const visiblePosts = posts.filter((p) => p.status === "published");
  const filteredPosts = visiblePosts.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const announcement = ANNOUNCEMENTS[bannerIdx];
  const bannerTag = language === "en" ? announcement.tagEn : announcement.tag;
  const bannerTitle = language === "en" ? announcement.titleEn : announcement.title;
  const bannerDesc = language === "en" ? announcement.descEn : announcement.desc;
  const bannerCta = language === "en" ? announcement.ctaEn : announcement.cta;

  return (
    <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-6">

      {/* ── MAIN CONTENT: Feed + Sidebar ── */}
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: FEED ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Feed header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                🌍 {t("explore.title", "Cộng Đồng Khám Phá")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {visiblePosts.length} {t("explore.posts_count", "bài viết từ cộng đồng")}
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>✍️</span>
              <span>{t("explore.new_post", "Đăng bài mới")}</span>
            </button>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex items-center flex-1 min-w-0 group">
              {/* Nút cuộn Trái */}
              <button
                type="button"
                onClick={() => {
                  if (categoryNavRef.current) {
                    categoryNavRef.current.scrollBy({ left: -180, behavior: "smooth" });
                  }
                }}
                className="shrink-0 mr-1.5 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md border border-slate-700/60 active:scale-95 z-10"
                title="Cuộn sang trái"
              >
                ◀
              </button>

              {/* Danh sách các danh mục */}
              <div
                ref={categoryNavRef}
                className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 scroll-smooth"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      activeCategory === cat.id
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-102"
                        : "bg-white dark:bg-[#11131c] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-indigo-950/60 hover:border-indigo-500/50"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Nút cuộn Phải */}
              <button
                type="button"
                onClick={() => {
                  if (categoryNavRef.current) {
                    categoryNavRef.current.scrollBy({ left: 180, behavior: "smooth" });
                  }
                }}
                className="shrink-0 ml-1.5 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md border border-slate-700/60 active:scale-95 z-10"
                title="Cuộn sang phải"
              >
                ▶
              </button>
            </div>
            <div className="relative shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("explore.search_placeholder", "Tìm bài viết, prompt...")}
                className="w-full sm:w-52 pl-8 pr-3 py-1.5 bg-white dark:bg-[#11131c] border border-slate-200 dark:border-indigo-950/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">{t("common.loading", "Đang tải bài viết...")}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-14 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <span className="text-4xl">🔍</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3">{t("explore.no_results", "Không tìm thấy bài nào")}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">{t("explore.no_results_desc", "Hãy là người đầu tiên chia sẻ trong chuyên mục này!")}</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-md shadow-indigo-600/20"
              >
                {t("explore.post_first", "✍️ Đăng bài đầu tiên")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPosts.map((post) => {
                const isAuthorOrAdmin =
                  Boolean(user) &&
                  (user?.id === (post.author as any)?.id ||
                    user?.id === (post as any).authorId ||
                    user?.role === "ADMIN");
                const isEditingThis = editingPostId === post.id;

                return (
                  <article
                    key={post.id}
                    className="group bg-white/90 dark:bg-[#0d0f18]/90 backdrop-blur-md border border-slate-200/90 dark:border-indigo-950/60 rounded-3xl p-5 shadow-xs hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                  >
                    {/* Author row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/?tab=profile&userId=${(post.author as any)?.id || (post as any).authorId || ""}`}
                          className="flex items-center gap-3 group/author cursor-pointer"
                        >
                          <div className="relative">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group-hover/author:border-cyan-400 transition-colors"
                            />
                            {post.author.isVip && (
                              <span className="absolute -bottom-0.5 -right-0.5 text-[9px] bg-amber-400 rounded-full w-3.5 h-3.5 flex items-center justify-center">⭐</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/author:text-cyan-400 transition-colors">{post.author.name}</span>
                              {post.author.isVip && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">VIP</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">@{post.author.username} • {post.createdAt}</div>
                          </div>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Post category pill */}
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>
                          {post.categoryLabel}
                        </span>

                        {/* Author/Admin edit & delete actions */}
                        {isAuthorOrAdmin && !isEditingThis && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleStartEdit(post)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors text-xs cursor-pointer"
                              title={t("explore.edit_post", "Chỉnh sửa")}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors text-xs cursor-pointer"
                              title={t("explore.delete_post", "Xóa bài viết")}
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Editing mode or View mode */}
                    {isEditingThis ? (
                      <div className="space-y-3 mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-indigo-200 dark:border-indigo-900/60 animate-in fade-in">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {t("modal.post_title_label", "Tiêu đề bài viết")}
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {language === "en" ? "Category" : "Chuyên mục"}
                            </label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {categories
                                .filter((c) => c.id !== "all")
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.emoji} {c.label}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {language === "en" ? "Image URL (optional)" : "Link ảnh đính kèm (tùy chọn)"}
                            </label>
                            <input
                              type="text"
                              value={editImage}
                              onChange={(e) => setEditImage(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-2 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {t("modal.content_label", "Nội dung bài đăng / Prompt")}
                          </label>
                          <textarea
                            rows={5}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-y focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isEditingSaving}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            {t("btn.cancel", "Hủy")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(post.id)}
                            disabled={isEditingSaving}
                            className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {isEditingSaving ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t("btn.saving", "Đang lưu...")}</span>
                              </>
                            ) : (
                              <>
                                <span>✓</span>
                                <span>{t("btn.save", "Lưu thay đổi")}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Title */}
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {post.title}
                        </h2>

                        {/* Content */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3 font-normal line-clamp-4">
                          {post.content}
                        </p>
                      </>
                    )}

                    {/* Attached image */}
                    {post.image && (
                      <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[320px] bg-slate-100 dark:bg-slate-900">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Interaction bar & Comments drawer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 sm:gap-3 relative">
                          {/* REACTION BUTTON + FLOATING PICKER */}
                          <div
                            className="relative"
                            onMouseEnter={() => setActiveReactionPicker(post.id)}
                            onMouseLeave={() => setActiveReactionPicker(null)}
                          >
                            {/* Floating Reaction Toolbar */}
                            {activeReactionPicker === post.id && (
                              <div className="absolute -top-12 left-0 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#141624] border border-slate-200 dark:border-indigo-900/80 shadow-xl shadow-indigo-950/40 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
                                {Object.entries(REACTION_CONFIG).map(([k, cfg]) => (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => handleReaction(post.id, k)}
                                    className="p-1 hover:scale-135 transition-transform duration-150 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center text-lg active:scale-95"
                                    title={language === "en" ? cfg.labelEn : cfg.label}
                                  >
                                    {cfg.emoji}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Trigger Reaction Button */}
                            <button
                              type="button"
                              onClick={() => handleReaction(post.id, post.userReaction || "like")}
                              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                                post.userReaction
                                  ? `${REACTION_CONFIG[post.userReaction]?.bg || "bg-indigo-500/10 border-indigo-500/30"} ${
                                      REACTION_CONFIG[post.userReaction]?.color || "text-indigo-500"
                                    }`
                                  : "bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 border-transparent hover:border-indigo-500/30"
                              }`}
                            >
                              <span>{post.userReaction ? REACTION_CONFIG[post.userReaction]?.emoji : "👍"}</span>
                              <span>
                                {post.userReaction
                                  ? language === "en"
                                    ? REACTION_CONFIG[post.userReaction]?.labelEn
                                    : REACTION_CONFIG[post.userReaction]?.label
                                  : language === "en"
                                  ? "Like"
                                  : "Thích"}
                              </span>
                              <span className="font-mono text-[11px] ml-0.5 opacity-80">{post.likes}</span>
                            </button>
                          </div>

                          {/* COMMENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleToggleComments(post.id)}
                            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
                              openComments[post.id]
                                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-400 border-indigo-300 dark:border-indigo-800"
                                : "bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-transparent"
                            }`}
                          >
                            <span>💬</span>
                            <span>{post.commentsCount}</span>
                            <span className="hidden sm:inline">{language === "en" ? "Comments" : "Bình luận"}</span>
                          </button>

                          {/* SHARE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleSharePost(post)}
                            className="px-3 py-1.5 rounded-xl border border-transparent bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 font-semibold"
                            title={language === "en" ? "Share post" : "Chia sẻ bài viết"}
                          >
                            <span>🔗</span>
                            <span>{language === "en" ? "Share" : "Chia sẻ"}</span>
                          </button>
                        </div>

                        {/* COPY PROMPT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(post.id, post.content)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
                        >
                          <span>{copiedId === post.id ? "✓" : "📋"}</span>
                          <span>{copiedId === post.id ? (language === "en" ? "Copied" : "Đã sao chép!") : (language === "en" ? "Copy Prompt" : "Sao chép Prompt")}</span>
                        </button>
                      </div>

                      {/* COMMENTS DRAWER SECTION */}
                      {openComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/70 animate-in fade-in duration-200 space-y-3">
                          {/* Comments list */}
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                            {(!post.comments || post.comments.length === 0) ? (
                              <p className="text-xs text-slate-400 italic py-2 text-center">
                                {language === "en"
                                  ? "No comments yet. Be the first to share your thoughts!"
                                  : "Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ!"}
                              </p>
                            ) : (
                              post.comments.map((comment) => {
                                const isCommentAuthorOrAdmin =
                                  Boolean(user) &&
                                  (user?.id === comment.userId ||
                                    user?.id === (post as any).authorId ||
                                    user?.id === post.author?.id ||
                                    user?.role === "ADMIN");

                                return (
                                  <div
                                    key={comment.id}
                                    className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs"
                                  >
                                    <Link
                                      href={`/?tab=profile&userId=${comment.userId || ""}`}
                                      className="shrink-0 group/commenter"
                                    >
                                      <img
                                        src={comment.user.avatar}
                                        alt={comment.user.name}
                                        className="w-7 h-7 rounded-full object-cover mt-0.5 border border-slate-200 dark:border-slate-700 group-hover/commenter:border-cyan-400 transition-colors"
                                      />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <div className="flex items-center gap-1.5">
                                          <Link
                                            href={`/?tab=profile&userId=${comment.userId || ""}`}
                                            className="font-bold text-slate-900 dark:text-white truncate hover:text-cyan-400 transition-colors"
                                          >
                                            {comment.user.name}
                                          </Link>
                                          {comment.user.role === "VIP" && (
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">
                                              VIP
                                            </span>
                                          )}
                                          {comment.user.role === "ADMIN" && (
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold">
                                              ADMIN
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                                          {isCommentAuthorOrAdmin && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteComment(post.id, comment.id)}
                                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                                              title={language === "en" ? "Delete comment" : "Xóa bình luận"}
                                            >
                                              🗑️
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Add comment input */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                            <img
                              src={
                                user?.avatar ||
                                "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                              }
                              alt="You"
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder={
                                !isAuthenticated
                                  ? (language === "en" ? "Log in to join discussion..." : "Đăng nhập để tham gia bình luận...")
                                  : (language === "en" ? "Write a comment (Press Enter to post)..." : "Viết bình luận của bạn (Nhấn Enter để gửi)...")
                              }
                              className="flex-1 px-3 py-2 bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id)}
                              disabled={
                                isCommentSubmitting[post.id] ||
                                !(commentInputs[post.id] || "").trim()
                              }
                              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              {isCommentSubmitting[post.id] ? "..." : "Gửi ✈️"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Write Post CTA card */}
          <div className="bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t("explore.share_title", "📝 Chia sẻ với cộng đồng")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {t("explore.share_desc", "Đăng prompt hay, mẹo AI, tác phẩm nghệ thuật của bạn!")}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-indigo-600/25 active:scale-95"
            >
              {t("explore.post_btn", "✍️ Đăng bài ngay")}
            </button>
          </div>

          {/* Câu hỏi Hot nhất hôm nay */}
          <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                🔥 <span>{t("explore.hot_questions", "Câu hỏi hot hôm nay")}</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {trendingPeriod === "7d" ? t("explore.7days", "7 ngày") : t("explore.today", "Hôm nay")}
              </span>
            </div>

            {isTrendingLoading ? (
              <div className="flex flex-col gap-2 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm flex-shrink-0" />
                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="w-8 h-3 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                  </div>
                ))}
              </div>
            ) : trendingEmpty || trendingQuestions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-1">💬</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t("explore.no_questions", "Chưa có câu hỏi nào hôm nay")}
                </p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                  {t("explore.start_chat_hint", "Bắt đầu chat để xuất hiện tại đây!")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {trendingQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 w-4 flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 line-clamp-2 leading-relaxed">
                      {q.text}
                    </span>
                    <span className="text-[10px] text-orange-500 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {q.count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Contributors */}
          <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-4 shadow-xs">
            <div className="mb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                🏆 <span>{t("explore.top_contributors", "Top Đóng góp")}</span>
              </h3>
            </div>

            {isContributorsLoading && topContributors.length === 0 ? (
              <div className="flex flex-col gap-2.5 animate-pulse py-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-24" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800/60 rounded-sm w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topContributors.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-1">✍️</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t("explore.no_contributors", "Chưa có ai đóng góp bài viết")}
                </p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                  {t("explore.be_first", "Hãy là người đầu tiên đăng bài!")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topContributors.map((c, i) => (
                  <Link
                    key={c.id || c.username}
                    href={`/?tab=profile&userId=${c.id || ""}`}
                    className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    title={language === "en" ? `View ${c.name}'s profile` : `Xem trang cá nhân của ${c.name}`}
                  >
                    <span
                      className={`text-xs font-black w-4 text-center ${
                        i === 0
                          ? "text-amber-500 font-black text-sm"
                          : i === 1
                          ? "text-slate-400 font-bold"
                          : i === 2
                          ? "text-amber-700 dark:text-amber-600 font-bold"
                          : "text-slate-400 font-normal"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          c.username
                        )}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {c.posts} {language === "en" ? "posts" : "bài"} • {c.badge}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Community Rules */}
          <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              📋 <span>{t("explore.community_rules", "Quy tắc cộng đồng")}</span>
            </h3>
            <ul className="flex flex-col gap-1.5">
              {(language === "en" ? COMMUNITY_RULES_EN : COMMUNITY_RULES_VI).map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Floating post button (mobile) */}
      <button
        onClick={handleOpenCreateModal}
        className="fixed bottom-6 right-6 lg:hidden z-30 w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-xl shadow-indigo-600/40 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-pointer active:scale-95"
        title={t("explore.new_post", "Đăng bài mới")}
      >
        ✍️
      </button>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitPost={handleCreatePost}
      />

      {/* Floating Action Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/20 dark:border-slate-800">
          <span className="text-base">✨</span>
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
}
