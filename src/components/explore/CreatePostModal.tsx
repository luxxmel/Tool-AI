"use client";

import React, { useState } from "react";
import { ExplorePost } from "@/data/postData";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: ExplorePost) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmitPost,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { showAlert, showError } = usePopup();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ExplorePost["category"]>("prompt");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categoryLabels: Record<ExplorePost["category"], string> = {
    prompt: language === "en" ? "AI Prompt" : "Prompt AI",
    art: language === "en" ? "AI Art" : "Nghệ thuật AI",
    code: language === "en" ? "Code & Programming" : "Lập trình & Code",
    assistant: language === "en" ? "Assistant Sharing" : "Chia sẻ Trợ lý",
    general: language === "en" ? "Discussion" : "Thảo luận",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showAlert(
        language === "en" ? "Please enter both title and content!" : "Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!",
        "Lưu ý",
        "warning"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          categoryLabel: categoryLabels[category],
          image: imageUrl.trim() || null,
          authorId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        onSubmitPost(data.post);
        setTitle("");
        setContent("");
        setImageUrl("");
        onClose();
      } else {
        showError(data.error || (language === "en" ? "Failed to publish post" : "Không thể đăng bài viết"));
      }
    } catch (err) {
      console.error("Lỗi khi đăng bài viết:", err);
      showError(language === "en" ? "Error connecting to server" : "Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("modal.create_post_title", "Đăng Bài Viết Khám Phá Mới")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              {t("modal.post_title_label", "Tiêu đề bài viết")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("modal.post_title_placeholder", "VD: Mẹo tạo ảnh AI Midjourney chân dung siêu thực...")}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              {t("modal.category_label", "Chuyên mục")}
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ExplorePost["category"])
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="prompt">{categoryLabels.prompt}</option>
              <option value="art">{categoryLabels.art}</option>
              <option value="code">{categoryLabels.code}</option>
              <option value="assistant">{categoryLabels.assistant}</option>
              <option value="general">{categoryLabels.general}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              {t("modal.content_label", "Nội dung bài đăng / Prompt")}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("modal.content_placeholder", "Chia sẻ công thức prompt, mẹo dùng AI, trải nghiệm hoặc câu chuyện của bạn...")}
              rows={5}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              {t("modal.image_url_label", "Link hình ảnh minh họa (Không bắt buộc)")}
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t("btn.cancel", "Hủy")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? t("modal.submitting", "Đang lưu vào DB...") : t("modal.submit_post", "Đăng bài ngay")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
