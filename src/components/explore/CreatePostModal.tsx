"use client";

import React, { useState, useRef } from "react";
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categoryLabels: Record<ExplorePost["category"], string> = {
    prompt: language === "en" ? "AI Prompt" : "Prompt AI",
    art: language === "en" ? "AI Art" : "Nghệ thuật AI",
    code: language === "en" ? "Code & Programming" : "Lập trình & Code",
    assistant: language === "en" ? "Assistant Sharing" : "Chia sẻ Trợ lý",
    general: language === "en" ? "Discussion" : "Thảo luận",
  };

  // Đọc ảnh tải lên từ thư mục trên thiết bị (Folder)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError(language === "en" ? "Image size must be less than 10MB" : "Dung lượng ảnh tối đa 10MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setImagePreview(base64);
        setImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
          image: imageUrl.trim() || imagePreview || null,
          authorId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        onSubmitPost(data.post);
        setTitle("");
        setContent("");
        setImageUrl("");
        setImagePreview(null);
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
              rows={4}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
              required
            />
          </div>

          {/* HÌNH ÁNH MINH HỌA (TẢI TỪ FOLDER HOẶC LINK URL) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              🖼️ {language === "en" ? "Illustration Image (Optional)" : "Hình ảnh minh họa (Không bắt buộc)"}
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview || (imageUrl && (imageUrl.startsWith("data:") || imageUrl.startsWith("http"))) ? (
              /* Image Selected Preview Box */
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 group">
                <img
                  src={imagePreview || imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-800/90 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    📂 Đổi ảnh khác
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 bg-rose-600/90 text-white text-xs font-bold rounded-xl hover:bg-rose-500 transition-colors cursor-pointer"
                  >
                    🗑️ Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              /* Choose Image Options: Local Folder or Web URL */
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>📂</span>
                    <span>{language === "en" ? "Upload from device folder" : "Tải ảnh từ thư mục máy tính / điện thoại"}</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase bg-white dark:bg-[#111218] px-2 z-10 font-bold">
                    {language === "en" ? "OR LINK URL" : "HOẶC NHẬP LINK URL"}
                  </span>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span>⏳</span>
                  <span>{t("modal.submitting", "Đang lưu vào DB...")}</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>{t("modal.submit_post", "Đăng bài ngay")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
