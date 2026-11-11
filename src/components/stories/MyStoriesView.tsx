"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import StoryWriterView from "./StoryWriterView";

export interface PublishedStoryItem {
  id: string;
  title: string;
  authorDisplayName: string;
  authorAvatar?: string;
  authorId: string;
  synopsis: string;
  content: string;
  coverImage?: string;
  category: string;
  ageRating: string;
  status: string;
  rejectionReason?: string;
  views: number;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

type Tab = "community" | "my_published" | "writer";

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "tieuthuyet", label: "Tiểu Thuyết" },
  { id: "tinhcam", label: "Tình Cảm & Ngôn Tình" },
  { id: "trinhtham", label: "Trinh Thám & Ly Kỳ" },
  { id: "kiemhiep", label: "Tiên Hiệp & Kỳ Ảo" },
  { id: "kinhdi", label: "Kinh Dị & Tâm Linh" },
  { id: "khac", label: "Tản Văn & Khác" },
];

const AGE_RATINGS = [
  { id: "all", label: "Mọi lứa tuổi" },
  { id: "ALL", label: "All (Phổ thông)" },
  { id: "13+", label: "13+ (Thiếu niên)" },
  { id: "16+", label: "16+ (Trưởng thành)" },
  { id: "18+", label: "18+ (Cảnh báo tâm lý/bạo lực)" },
];

export default function MyStoriesView() {
  const { user, updateUserCredits } = useAuth();
  const { t, language } = useLanguage();
  const { showAlert } = usePopup();

  const [activeTab, setActiveTab] = useState<Tab>("community");
  const [stories, setStories] = useState<PublishedStoryItem[]>([]);
  const [myStories, setMyStories] = useState<PublishedStoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");

  // Đọc truyện toàn màn hình (Modal Reader)
  const [readingStory, setReadingStory] = useState<PublishedStoryItem | null>(null);

  // Modal Đăng truyện mới
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubAuthor, setPubAuthor] = useState(user?.displayName || "");
  const [pubSynopsis, setPubSynopsis] = useState("");
  const [pubContent, setPubContent] = useState("");
  const [pubCover, setPubCover] = useState("");
  const [pubCategory, setPubCategory] = useState("tieuthuyet");
  const [pubAgeRating, setPubAgeRating] = useState("ALL");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tải danh sách truyện cộng đồng
  const loadCommunityStories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedAge !== "all") params.append("ageRating", selectedAge);
      if (user?.id) params.append("userId", user.id);

      const res = await fetch(`/api/stories?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
      }
    } catch (e) {
      console.error("Lỗi khi tải truyện cộng đồng:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách truyện của tôi
  const loadMyStories = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/stories?filter=my&userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyStories(data.stories || []);
      }
    } catch (e) {
      console.error("Lỗi khi tải truyện của tôi:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "community") {
      loadCommunityStories();
    } else if (activeTab === "my_published") {
      loadMyStories();
    }
  }, [activeTab, selectedCategory, selectedAge, user]);

  // Xử lý đọc truyện & tăng view
  const handleOpenReadStory = async (story: PublishedStoryItem) => {
    setReadingStory(story);
    try {
      const res = await fetch(`/api/stories/${story.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.story) {
          // Cập nhật lại số view hiển thị
          setStories((prev) =>
            prev.map((s) => (s.id === story.id ? { ...s, views: data.story.views } : s))
          );
        }
      }
    } catch (e) {
      console.error("Lỗi cập nhật lượt đọc:", e);
    }
  };

  // Thả tim truyện
  const handleLikeStory = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showAlert("Vui lòng đăng nhập để thả tim cho tác phẩm!");
      return;
    }

    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setStories((prev) =>
          prev.map((s) => {
            if (s.id === storyId) {
              return {
                ...s,
                isLiked: data.isLiked,
                likes: data.isLiked ? s.likes + 1 : Math.max(0, s.likes - 1),
              };
            }
            return s;
          })
        );
        if (readingStory && readingStory.id === storyId) {
          setReadingStory((prev) =>
            prev
              ? {
                  ...prev,
                  isLiked: data.isLiked,
                  likes: data.isLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
                }
              : null
          );
        }
      }
    } catch (e) {
      console.error("Lỗi like truyện:", e);
    }
  };

  // Xử lý Đăng truyện mới
  const handleSubmitPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showAlert("Vui lòng đăng nhập để xuất bản truyện!");
      return;
    }

    if (!pubTitle.trim() || !pubContent.trim() || !pubAuthor.trim()) {
      setPublishMessage({ type: "error", text: "Vui lòng điền đầy đủ Tiêu đề, Tên tác giả và Nội dung truyện!" });
      return;
    }

    if ((user.credits ?? 0) < 5 && user.role !== "ADMIN") {
      setPublishMessage({
        type: "error",
        text: "Bạn cần có tối thiểu 5 Credits để gửi duyệt & đăng truyện. Vui lòng nạp thêm!",
      });
      return;
    }

    setIsPublishing(true);
    setPublishMessage(null);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: pubTitle.trim(),
          authorDisplayName: pubAuthor.trim(),
          synopsis: pubSynopsis.trim() || pubTitle.trim(),
          content: pubContent.trim(),
          coverImage: pubCover.trim() || null,
          category: pubCategory,
          ageRating: pubAgeRating,
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 403) {
        setPublishMessage({ type: "error", text: data.error || "Không thể đăng truyện vào lúc này!" });
        return;
      }

      if (data.status === "REJECTED") {
        // AI không duyệt nhưng đã hoàn lại 100% 5 credits
        if (typeof data.credits === "number") {
          updateUserCredits(data.credits);
        }
        setPublishMessage({
          type: "error",
          text: data.message || "Tác phẩm chưa qua khâu kiểm duyệt tự động. Đã hoàn trả 5 Credits vào tài khoản của bạn!",
        });
        loadMyStories();
      } else if (data.success) {
        // Duyệt thành công
        if (typeof data.credits === "number") {
          updateUserCredits(data.credits);
        }
        setPublishMessage({
          type: "success",
          text: data.message || "Xuất bản truyện thành công! Tác phẩm của bạn đã lên sàn đọc công cộng.",
        });
        // Reset form sau 2 giây
        setTimeout(() => {
          setIsPublishModalOpen(false);
          setPubTitle("");
          setPubSynopsis("");
          setPubContent("");
          setPubCover("");
          setPublishMessage(null);
          setActiveTab("community");
          loadCommunityStories();
        }, 1500);
      }
    } catch (e) {
      console.error("Lỗi khi đăng truyện:", e);
      setPublishMessage({ type: "error", text: "Có lỗi xảy ra trong quá trình kiểm duyệt. Vui lòng thử lại!" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col px-2 sm:px-4">
      {/* ── HEADER BĂNG RÔN CHUẨN MINIMALIST ── */}
      <div className="w-full mb-6 pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold border border-indigo-500/20">
            📖
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kho Truyện & Sáng Tác Cộng Đồng
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đọc tác phẩm độc quyền, xuất bản truyện của riêng bạn (Phí 5🪙 - Hoàn trả 100% nếu không qua kiểm duyệt)
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>🚀</span>
            <span>Đăng Truyện Mới (5🪙)</span>
          </button>
        </div>
      </div>

      {/* ── TABS ĐIỀU HƯỚNG ── */}
      <div className="flex items-center justify-between gap-3 mb-6 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#15171e] border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "community"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>🌐</span>
            <span>Thư Viện Cộng Đồng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my_published")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "my_published"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>👤</span>
            <span>Truyện Của Tôi</span>
            {myStories.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white font-mono">
                {myStories.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("writer")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "writer"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>✨</span>
            <span>Xưởng Viết AI</span>
          </button>
        </div>

        {activeTab === "community" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Lọc độ tuổi:</span>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="p-1.5 px-2 rounded-lg bg-white dark:bg-[#15171e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none"
            >
              {AGE_RATINGS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── NỘI DUNG TỪNG TAB ── */}
      {activeTab === "writer" ? (
        <div className="flex-1 min-h-[600px]">
          <StoryWriterView onBack={() => setActiveTab("community")} />
        </div>
      ) : activeTab === "my_published" ? (
        /* ── QUẢN LÝ TRUYỆN CỦA TÔI ── */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <span>🎁</span>
                <span>Chính sách thưởng Tác giả Biết Tuốt</span>
              </h4>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                • Đạt 100 lượt đọc: Nhận ngay <strong>+2 Credits</strong> • Đạt 500 lượt đọc: Nhận thêm <strong>+5 Credits</strong> tự động vào ví!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              + Đăng thêm truyện
            </button>
          </div>

          {myStories.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <span className="text-4xl">📝</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
                Bạn chưa đăng tác phẩm nào
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Chia sẻ câu chuyện, tiểu thuyết hoặc bài viết của bạn với hàng ngàn độc giả trên Biết Tuốt AI.
              </p>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Đăng bài đầu tiên ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {myStories.map((story) => (
                <div
                  key={story.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          story.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {story.status === "APPROVED" ? "✓ ĐÃ XUẤT BẢN" : "✕ TỪ CHỐI DUYỆT (ĐÃ HOÀN 5🪙)"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(story.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {story.synopsis}
                    </p>

                    {story.status === "REJECTED" && story.rejectionReason && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                        <strong>Lý do từ chối:</strong> {story.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>👁️ {story.views} lượt đọc</span>
                      <span>❤️ {story.likes} tim</span>
                    </div>
                    {story.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleOpenReadStory(story)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Đọc thử ➔
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── THƯ VIỆN TRUYỆN CỘNG ĐỒNG ── */
        <div className="space-y-6">
          {/* Categories Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-slate-100 dark:bg-[#15171e] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">Đang tải thư viện truyện cộng đồng...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <span className="text-4xl">📚</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
                Chưa có tác phẩm nào trong thể loại này
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Hãy là người đầu tiên xuất bản tác phẩm của bạn để cộng đồng cùng thưởng thức!
              </p>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Đăng truyện đầu tiên (5🪙)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleOpenReadStory(story)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#15171e] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Bìa truyện nếu có */}
                    {story.coverImage && (
                      <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Metadata tags */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {CATEGORIES.find((c) => c.id === story.category)?.label || "Truyện"}
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          story.ageRating === "18+"
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            : story.ageRating === "16+"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {story.ageRating}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {story.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {story.synopsis}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                      ✍️ {story.authorDisplayName}
                    </span>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>👁️ {story.views}</span>
                      <button
                        type="button"
                        onClick={(e) => handleLikeStory(story.id, e)}
                        className={`flex items-center gap-1 cursor-pointer transition-colors ${
                          story.isLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"
                        }`}
                      >
                        <span>{story.isLiked ? "❤️" : "🤍"}</span>
                        <span>{story.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL ĐỌC TRUYỆN TOÀN MÀN HÌNH (READER) ── */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header đọc truyện */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {CATEGORIES.find((c) => c.id === readingStory.category)?.label}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Độ tuổi: {readingStory.ageRating}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {readingStory.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tác giả: <strong className="text-slate-700 dark:text-slate-300">{readingStory.authorDisplayName}</strong> • Ngày đăng: {new Date(readingStory.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleLikeStory(readingStory.id, e)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    readingStory.isLiked
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{readingStory.isLiked ? "❤️" : "🤍"}</span>
                  <span>{readingStory.likes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReadingStory(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Nội dung truyện (Typography êm mắt) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
              {readingStory.coverImage && (
                <div className="w-full max-h-72 rounded-2xl overflow-hidden mb-6">
                  <img src={readingStory.coverImage} alt={readingStory.title} className="w-full h-full object-cover" />
                </div>
              )}
              {readingStory.content}
            </div>

            {/* Footer chân trang */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-50 dark:bg-[#121318]">
              <span>Tác phẩm được bảo hộ trên nền tảng Biết Tuốt AI</span>
              <button
                type="button"
                onClick={() => setReadingStory(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ĐĂNG TRUYỆN MỚI (KIỂM DUYỆT 5 CREDITS) ── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚀</span>
                  <span>Xuất Bản Tác Phẩm Lên Website</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phí xuất bản: <strong>5 Credits</strong> • Hệ thống tự động kiểm duyệt & <strong>hoàn lại 100% (5🪙)</strong> nếu không được duyệt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPublish} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {publishMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    publishMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <span>{publishMessage.type === "success" ? "✓" : "⚠️"}</span>
                  <div className="flex-1">{publishMessage.text}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tên tác phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    placeholder="VD: Bí Ẩn Thành Phố Mù Sương"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tên tác giả / Bút danh *
                  </label>
                  <input
                    type="text"
                    required
                    value={pubAuthor}
                    onChange={(e) => setPubAuthor(e.target.value)}
                    placeholder="VD: Hoàng Linh / Ẩn Danh"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Thể loại
                  </label>
                  <select
                    value={pubCategory}
                    onChange={(e) => setPubCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gắn mác độ tuổi *
                  </label>
                  <select
                    value={pubAgeRating}
                    onChange={(e) => setPubAgeRating(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {AGE_RATINGS.filter((a) => a.id !== "all").map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Link hình ảnh bìa truyện (Tùy chọn)
                </label>
                <input
                  type="url"
                  value={pubCover}
                  onChange={(e) => setPubCover(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tóm tắt ngắn (Synopsis)
                </label>
                <textarea
                  rows={2}
                  value={pubSynopsis}
                  onChange={(e) => setPubSynopsis(e.target.value)}
                  placeholder="Giới thiệu lôi cuốn 2-3 câu về cốt truyện để thu hút người đọc..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Toàn bộ nội dung truyện *
                </label>
                <textarea
                  required
                  rows={9}
                  value={pubContent}
                  onChange={(e) => setPubContent(e.target.value)}
                  placeholder="Dán hoặc viết nội dung tác phẩm của bạn tại đây..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-serif leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <p>• <strong>Kiểm duyệt tự động:</strong> AI sẽ kiểm tra nội dung khiêu dâm, bạo lực cực đoan hoặc vi phạm pháp luật.</p>
                <p>• <strong>Bảo vệ quyền lợi:</strong> Nếu tác phẩm không được duyệt, <strong>5 Credits sẽ được hoàn trả 100%</strong> ngay lập tức vào ví của bạn!</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>{isPublishing ? "⏳ Đang kiểm duyệt & đăng..." : "🚀 Gửi duyệt & Đăng (5🪙)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
