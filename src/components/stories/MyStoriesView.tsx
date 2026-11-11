"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import StoryWriterView from "./StoryWriterView";
import { compressImage } from "@/lib/imageUtils";

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
}

export interface PublishedStoryItem {
  id: string;
  title: string;
  authorDisplayName: string;
  authorAvatar?: string;
  authorId: string;
  synopsis: string;
  content: string; // Có thể chứa JSON mảng các chương hoặc text ngăn cách bởi [PHAN_MOI: tiêu đề]
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

// Hàm bóc tách nội dung truyện thành danh sách Chương / Phần
function parseStoryChapters(rawContent: string): StoryChapter[] {
  if (!rawContent) return [{ id: "c-1", title: "Phần 1", content: "" }];

  // Thử kiểm tra định dạng JSON
  try {
    if (rawContent.trim().startsWith("[") && rawContent.trim().endsWith("]")) {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].content !== undefined) {
        return parsed.map((c, idx) => ({
          id: c.id || `c-${idx + 1}`,
          title: c.title || `Phần ${idx + 1}`,
          content: c.content || "",
        }));
      }
    }
  } catch {}

  // Kiểm tra tag ngăn cách [PHAN_MOI: ...]
  if (rawContent.includes("[PHAN_MOI:")) {
    const parts = rawContent.split(/\[PHAN_MOI:\s*([^\]]+)\]/g);
    // parts[0] là trước tag đầu tiên, sau đó luân phiên title, content
    const chapters: StoryChapter[] = [];
    if (parts[0]?.trim()) {
      chapters.push({ id: "c-1", title: "Mở đầu", content: parts[0].trim() });
    }
    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i]?.trim() || `Phần ${chapters.length + 1}`;
      const content = parts[i + 1]?.trim() || "";
      chapters.push({ id: `c-${chapters.length + 1}`, title, content });
    }
    if (chapters.length > 0) return chapters;
  }

  // Mặc định trả về 1 chương duy nhất
  return [{ id: "c-1", title: "Toàn bộ tác phẩm", content: rawContent }];
}

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

  // Đọc truyện toàn màn hình (Modal Reader theo từng chương / phần)
  const [readingStory, setReadingStory] = useState<PublishedStoryItem | null>(null);
  const [readingChapters, setReadingChapters] = useState<StoryChapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  // Modal Đăng truyện mới theo từng chương / phần
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubAuthor, setPubAuthor] = useState(user?.displayName || "");
  const [pubSynopsis, setPubSynopsis] = useState("");
  const [pubCover, setPubCover] = useState("");
  const [pubCategory, setPubCategory] = useState("tieuthuyet");
  const [pubAgeRating, setPubAgeRating] = useState("ALL");
  const [chapters, setChapters] = useState<StoryChapter[]>([
    { id: "chap-1", title: "Phần 1: Khởi đầu", content: "" },
  ]);
  const [activeChapterEditIdx, setActiveChapterEditIdx] = useState(0);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // File Inputs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  // Xử lý mở đọc truyện & bóc tách từng chương
  const handleOpenReadStory = async (story: PublishedStoryItem) => {
    const chaps = parseStoryChapters(story.content);
    setReadingStory(story);
    setReadingChapters(chaps);
    setCurrentChapterIndex(0);

    try {
      const res = await fetch(`/api/stories/${story.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.story) {
          setStories((prev) =>
            prev.map((s) => (s.id === story.id ? { ...s, views: data.story.views } : s))
          );
        }
      }
    } catch (e) {
      console.error("Lỗi cập nhật lượt đọc:", e);
    }
  };

  // Upload Ảnh Bìa từ file máy tính/điện thoại
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP)!");
      return;
    }

    try {
      setIsUploadingImage(true);
      // Nén ảnh chất lượng cao để tiết kiệm băng thông và tối ưu tốc độ đọc
      const base64Data = await compressImage(file, 1200, 0.85);
      setPubCover(base64Data);
    } catch (err) {
      console.error("Lỗi nén ảnh:", err);
      showAlert("Không thể xử lý ảnh này. Vui lòng thử ảnh khác!");
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Chèn hình ảnh trực tiếp vào nội dung chương hiện tại
  const handleInsertInlineImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const base64Data = await compressImage(file, 1000, 0.82);
      // Chèn markdown image vào cuối hoặc vị trí con trỏ của chương đang soạn
      setChapters((prev) =>
        prev.map((chap, idx) => {
          if (idx === activeChapterEditIdx) {
            const separator = chap.content.trim() ? "\n\n" : "";
            return {
              ...chap,
              content: chap.content + `${separator}![Ảnh minh họa](${base64Data})\n\n`,
            };
          }
          return chap;
        })
      );
    } catch (err) {
      console.error("Lỗi chèn ảnh minh họa:", err);
      showAlert("Không thể chèn ảnh này. Vui lòng thử lại!");
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Quản lý Chương / Phần (Thêm, Xóa, Đổi tên)
  const handleAddChapter = () => {
    const newIdx = chapters.length + 1;
    setChapters((prev) => [
      ...prev,
      { id: `chap-${Date.now()}`, title: `Phần ${newIdx}`, content: "" },
    ]);
    setActiveChapterEditIdx(chapters.length);
  };

  const handleRemoveChapter = (indexToRemove: number) => {
    if (chapters.length <= 1) {
      showAlert("Tác phẩm phải có tối thiểu 1 chương/phần!");
      return;
    }
    setChapters((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeChapterEditIdx >= chapters.length - 1) {
      setActiveChapterEditIdx(Math.max(0, chapters.length - 2));
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

    // Kiểm tra xem các chương có nội dung không
    const hasContent = chapters.some((c) => c.content.trim().length > 0);
    if (!pubTitle.trim() || !pubAuthor.trim() || !hasContent) {
      setPublishMessage({
        type: "error",
        text: "Vui lòng điền đầy đủ Tiêu đề, Tên tác giả và nội dung ít nhất một chương/phần!",
      });
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

    // Đóng gói mảng các chương thành JSON
    const serializedContent = JSON.stringify(chapters);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: pubTitle.trim(),
          authorDisplayName: pubAuthor.trim(),
          synopsis: pubSynopsis.trim() || pubTitle.trim(),
          content: serializedContent,
          coverImage: pubCover || null,
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
        if (typeof data.credits === "number") {
          updateUserCredits(data.credits);
        }
        setPublishMessage({
          type: "error",
          text: data.message || "Tác phẩm chưa qua khâu kiểm duyệt tự động. Đã hoàn trả 5 Credits vào tài khoản của bạn!",
        });
        loadMyStories();
      } else if (data.success) {
        if (typeof data.credits === "number") {
          updateUserCredits(data.credits);
        }
        setPublishMessage({
          type: "success",
          text: data.message || "Xuất bản truyện thành công! Tác phẩm của bạn đã lên sàn đọc công cộng.",
        });
        setTimeout(() => {
          setIsPublishModalOpen(false);
          setPubTitle("");
          setPubSynopsis("");
          setPubCover("");
          setChapters([{ id: "chap-1", title: "Phần 1: Khởi đầu", content: "" }]);
          setActiveChapterEditIdx(0);
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

  // Render nội dung chương kèm ảnh minh họa
  const renderChapterContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(!\[.*?\]\(.*?\))/g);
    return parts.map((part, idx) => {
      const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        return (
          <div key={idx} className="my-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto">
            <img src={imgMatch[2]} alt={imgMatch[1] || "Ảnh minh họa"} className="w-full h-auto object-cover" />
          </div>
        );
      }
      return (
        <span key={idx} className="whitespace-pre-line">
          {part}
        </span>
      );
    });
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
              Đọc tác phẩm chia từng chương/phần, tải ảnh bìa trực tiếp (Phí 5🪙 - Hoàn trả 100% nếu không qua kiểm duyệt)
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
                    {/* Bìa truyện */}
                    {story.coverImage && (
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
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

      {/* ── MODAL ĐỌC TRUYỆN CHUYÊN NGHIỆP TỪNG CHƯƠNG/PHẦN (READER) ── */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl h-[92vh] bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header đọc truyện */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#121318]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {CATEGORIES.find((c) => c.id === readingStory.category)?.label}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {readingStory.ageRating}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {readingStory.title}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Tác giả: <strong className="text-slate-700 dark:text-slate-300">{readingStory.authorDisplayName}</strong> • {readingChapters.length} phần/chương
                </p>
              </div>

              {/* Tùy chỉnh font size & thả tim */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFontSize("normal")}
                    className={`px-2 py-1 rounded-md transition-colors ${fontSize === "normal" ? "bg-white dark:bg-[#1a1c24] font-bold shadow-2xs" : "text-slate-500"}`}
                    title="Cỡ chữ vừa"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("large")}
                    className={`px-2 py-1 rounded-md transition-colors ${fontSize === "large" ? "bg-white dark:bg-[#1a1c24] font-bold shadow-2xs" : "text-slate-500"}`}
                    title="Cỡ chữ to"
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("xlarge")}
                    className={`px-2 py-1 rounded-md transition-colors ${fontSize === "xlarge" ? "bg-white dark:bg-[#1a1c24] font-bold shadow-2xs" : "text-slate-500"}`}
                    title="Cỡ chữ rất to"
                  >
                    A++
                  </button>
                </div>

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

            {/* Thanh chọn Chương / Mục Lục nếu truyện có nhiều phần */}
            {readingChapters.length > 1 && (
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-[#121318]/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">📑 Chọn phần:</span>
                {readingChapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => setCurrentChapterIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      currentChapterIndex === idx
                        ? "bg-indigo-600 text-white shadow-2xs font-bold"
                        : "bg-white dark:bg-[#1a1c24] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    {chap.title}
                  </button>
                ))}
              </div>
            )}

            {/* Nội dung truyện (Typography êm mắt) */}
            <div
              className={`flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 text-slate-800 dark:text-slate-200 leading-relaxed font-serif ${
                fontSize === "xlarge"
                  ? "text-lg sm:text-xl leading-loose"
                  : fontSize === "large"
                  ? "text-base sm:text-lg leading-relaxed"
                  : "text-sm sm:text-base leading-relaxed"
              }`}
            >
              {/* Bìa truyện chỉ hiển thị ở phần 1 */}
              {currentChapterIndex === 0 && readingStory.coverImage && (
                <div className="w-full max-h-72 rounded-2xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800 shadow-md">
                  <img src={readingStory.coverImage} alt={readingStory.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Tên chương hiện tại */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                  {readingChapters[currentChapterIndex]?.title || "Nội dung"}
                </h3>
              </div>

              {/* Đoạn văn bản */}
              <div className="pt-2">
                {renderChapterContent(readingChapters[currentChapterIndex]?.content || "")}
              </div>
            </div>

            {/* Footer điều hướng Chương Trước / Chương Tiếp theo */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-50 dark:bg-[#121318]">
              <button
                type="button"
                disabled={currentChapterIndex === 0}
                onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 cursor-pointer flex items-center gap-1"
              >
                <span>←</span>
                <span>Phần trước</span>
              </button>

              <span className="font-sans font-semibold text-slate-500">
                Phần {currentChapterIndex + 1} / {readingChapters.length}
              </span>

              <button
                type="button"
                disabled={currentChapterIndex >= readingChapters.length - 1}
                onClick={() => setCurrentChapterIndex((prev) => Math.min(readingChapters.length - 1, prev + 1))}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 disabled:opacity-40 text-white font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Phần tiếp</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ĐĂNG TRUYỆN MỚI HỖ TRỢ TÁCH PHẦN & TẢI ẢNH FILE ── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[94vh] bg-white dark:bg-[#15171e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚀</span>
                  <span>Xuất Bản Tác Phẩm (Hỗ trợ Tách Chương & Upload Ảnh)</span>
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

              {/* Upload Ảnh Bìa Truyện từ File */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ảnh bìa truyện (Tải file từ máy tính / điện thoại)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={handleUploadCoverImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🖼️</span>
                    <span>{isUploadingImage ? "Đang xử lý ảnh..." : pubCover ? "Đổi ảnh bìa khác" : "Chọn file ảnh bìa"}</span>
                  </button>

                  {pubCover && (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={pubCover} alt="Bìa truyện preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPubCover("")}
                        className="text-xs text-rose-500 hover:underline cursor-pointer"
                      >
                        Xóa bìa
                      </button>
                    </div>
                  )}
                </div>
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

              {/* ── QUẢN LÝ CHƯƠNG / PHẦN TRUYỆN ── */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>📑</span>
                      <span>Nội dung truyện theo từng Phần / Chương</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Tác giả có thể tách thành nhiều phần để độc giả dễ đọc và theo dõi
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddChapter}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Thêm phần mới
                  </button>
                </div>

                {/* Danh sách tabs các phần đang soạn */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
                  {chapters.map((chap, idx) => (
                    <div
                      key={chap.id}
                      onClick={() => setActiveChapterEditIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2 whitespace-nowrap transition-colors border ${
                        activeChapterEditIdx === idx
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold"
                          : "bg-slate-100 dark:bg-[#121318] text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      <span>{chap.title || `Phần ${idx + 1}`}</span>
                      {chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveChapter(idx);
                          }}
                          className="hover:text-rose-300 text-[10px] p-0.5"
                          title="Xóa phần này"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Soạn thảo chương đang chọn */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101217] border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <input
                      type="text"
                      value={chapters[activeChapterEditIdx]?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChapters((prev) =>
                          prev.map((c, i) => (i === activeChapterEditIdx ? { ...c, title: val } : c))
                        );
                      }}
                      placeholder={`Tiêu đề phần ${activeChapterEditIdx + 1} (VD: Phần ${activeChapterEditIdx + 1}: Chạm trán)`}
                      className="flex-1 p-2 rounded-xl bg-white dark:bg-[#15171e] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />

                    {/* Nút Chèn ảnh minh họa vào nội dung */}
                    <div>
                      <input
                        type="file"
                        ref={inlineImageInputRef}
                        onChange={handleInsertInlineImage}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => inlineImageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#15171e] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>📷</span>
                        <span>Chèn ảnh vào phần này</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    required
                    rows={9}
                    value={chapters[activeChapterEditIdx]?.content || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChapters((prev) =>
                        prev.map((c, i) => (i === activeChapterEditIdx ? { ...c, content: val } : c))
                      );
                    }}
                    placeholder={`Viết nội dung cho ${chapters[activeChapterEditIdx]?.title || `Phần ${activeChapterEditIdx + 1}`} tại đây...`}
                    className="w-full p-3 rounded-xl bg-white dark:bg-[#15171e] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-serif leading-relaxed"
                  />
                </div>
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
