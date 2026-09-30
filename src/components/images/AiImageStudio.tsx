"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  styleLabel?: string;
  aspectRatio: string;
  referenceImage?: string | null;
  createdAt: string;
}

const STYLES = [
  { id: "realistic", label: "Chân thực / Thực tế", labelEn: "Photorealistic", icon: "📷" },
  { id: "cyberpunk", label: "Cyberpunk Neon", labelEn: "Cyberpunk Neon", icon: "🌃" },
  { id: "anime", label: "Anime & Manga", labelEn: "Anime & Manga", icon: "🌸" },
  { id: "cinematic", label: "3D Cinematic", labelEn: "3D Cinematic", icon: "🎬" },
  { id: "oil", label: "Sơn dầu cổ điển", labelEn: "Classic Oil Painting", icon: "🎨" },
  { id: "fantasy", label: "Huyền ảo Fantasy", labelEn: "Fantasy & Mythic", icon: "✨" },
];

const PROMPT_SUGGESTIONS = [
  "Kho xưởng công nghiệp bốc dỡ hàng hóa nhộn nhịp, xe nâng và pallet, ảnh chụp chân thực 8k",
  "Chân dung doanh nhân lịch lãm trong văn phòng hiện đại, ánh sáng tự nhiên studio 8k",
  "Biệt thự sân vườn phong cách tối giản hiện đại, hồ bơi trong xanh vào buổi chiều tà",
  "Tách cà phê espresso bốc khói trên bàn gỗ sồi bên cửa sổ ngày mưa, chi tiết sắc nét",
];

const PROMPT_SUGGESTIONS_EN = [
  "Industrial warehouse loading bay with forklifts and cargo pallets, photorealistic 8k photo",
  "Professional portrait of a sleek business executive in modern office, studio lighting",
  "Modern minimalist villa with courtyard swimming pool during golden hour sunset",
  "Steaming cup of espresso on oak table next to rainy window, hyper detailed",
];

const REFERENCE_SUGGESTIONS = [
  "🌸 Biến thành nhân vật anime tóc vàng",
  "🌃 Phong cách Cyberpunk Neon với áo giáp",
  "🎨 Vẽ lại thành tranh sơn dầu cổ điển",
  "🎬 Chuyển thành tượng điêu khắc 3D siêu thực",
];

const REFERENCE_SUGGESTIONS_EN = [
  "🌸 Transform into blonde anime character",
  "🌃 Cyberpunk neon style with battle armor",
  "🎨 Recreate as classic fine art oil painting",
  "🎬 Convert into hyper-realistic 3D sculpture",
];

interface AiImageStudioProps {
  onOpenLoginModal?: () => void;
}

export default function AiImageStudio({ onOpenLoginModal }: AiImageStudioProps = {}) {
  const { user, updateUserCredits } = useAuth();
  const { language, t } = useLanguage();
  const { showAlert, showConfirm } = usePopup();
  const activeUserId = user?.id || null;

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] = useState<string>("");
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeModalImage, setActiveModalImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Tải ảnh từ localStorage khi mount (loại bỏ ảnh mẫu cũ và chỉ giữ tối đa 4 ảnh gần nhất)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("omni_ai_gallery");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const userOnly = parsed
            .filter((item: any) => item && typeof item.id === "string" && !item.id.startsWith("img-sample-"))
            .slice(0, 4);
          setGallery(userOnly);
          localStorage.setItem("omni_ai_gallery", JSON.stringify(userOnly));
          return;
        }
      }
      setGallery([]);
    } catch (e) {
      console.error("Lỗi khi đọc gallery từ localStorage:", e);
      setGallery([]);
    }
  }, []);

  // 2. Lưu gallery vào localStorage khi có thay đổi (chỉ lưu tối đa 4 tấm gần nhất của người dùng)
  const saveGallery = (newGallery: GeneratedImage[]) => {
    const trimmed = newGallery
      .filter((item) => item && !item.id.startsWith("img-sample-"))
      .slice(0, 4);
    setGallery(trimmed);
    try {
      localStorage.setItem("omni_ai_gallery", JSON.stringify(trimmed));
    } catch (e) {
      console.error("Lỗi khi lưu gallery:", e);
    }
  };

  // 3. Xử lý tải ảnh tham chiếu (nhỏ gọn)
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showAlert("Vui lòng chọn file hình ảnh (PNG, JPG, WEBP...)", "Lưu ý", "warning");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showAlert("Dung lượng ảnh tối đa là 8MB", "Lưu ý", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setReferenceImage(base64);
      setReferenceImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // 4. Xử lý tạo hình ảnh AI với cơ chế tải trước (Preload) cực kỳ mượt mà
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    if (!user) {
      onOpenLoginModal?.();
      return;
    }

    if (user.role !== "ADMIN" && user.credits <= 0) {
      setGenerationError("Tài khoản của bạn đã hết Credits. Vui lòng nạp thêm để tiếp tục tạo ảnh!");
      return;
    }

    setIsGenerating(true);
    setGeneratingStage(language === "en" ? "Generating, please wait..." : "Đang tạo, vui lòng chờ...");

    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          aspectRatio,
          referenceImage: referenceImage || undefined,
          userId: user.id,
        }),
      });

      if (res.status === 401) {
        onOpenLoginModal?.();
        setIsGenerating(false);
        setGeneratingStage("");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo hình ảnh");
      }

      setGeneratingStage(language === "en" ? "Generating, please wait..." : "Đang tạo, vui lòng chờ...");

      // Preload ảnh vào bộ nhớ đệm của trình duyệt trước khi hiển thị để không bao giờ bị giật / nháy trắng
      await new Promise<void>((resolve) => {
        const testImg = new window.Image();
        testImg.onload = () => resolve();
        testImg.onerror = () => resolve();
        testImg.src = data.url;
        setTimeout(resolve, 7000); // Không chờ quá 7s
      });

      if (data.remainingCredits !== undefined) {
        updateUserCredits(data.remainingCredits);
      }

      const styleObj = STYLES.find((s) => s.id === selectedStyle);

      const newImage: GeneratedImage = {
        id: data.id || `img-${Date.now()}`,
        url: data.url,
        prompt: data.prompt,
        enhancedPrompt: data.enhancedPrompt,
        style: selectedStyle,
        styleLabel: styleObj?.label || "Nghệ thuật AI",
        aspectRatio: data.aspectRatio,
        referenceImage: data.referenceImage || referenceImage || null,
        createdAt: "Vừa xong",
      };

      const updated = [newImage, ...gallery];
      saveGallery(updated);
      setPrompt("");
    } catch (err: any) {
      console.error("Lỗi khi tạo hình ảnh:", err);
      setGenerationError(err?.message || "Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
      setGeneratingStage("");
    }
  };

  // 5. Sao chép Prompt
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 6. Tải ảnh về máy tính
  const handleDownload = async (img: GeneratedImage) => {
    try {
      setDownloadingId(img.id);
      const res = await fetch(img.url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `omni-ai-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(img.url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  // 7. Xóa ảnh khỏi gallery
  const handleDelete = async (id: string) => {
    const ok = await showConfirm("Bạn có chắc chắn muốn xóa tác phẩm này khỏi thư viện?", "Xác nhận xóa");
    if (!ok) return;
    const updated = gallery.filter((img) => img.id !== id);
    saveGallery(updated);
    if (activeModalImage?.id === id) {
      setActiveModalImage(null);
    }
  };

  // 8. Tái sử dụng Prompt
  const handleReusePrompt = (img: GeneratedImage) => {
    setPrompt(img.prompt);
    setSelectedStyle(img.style || "cyberpunk");
    setAspectRatio(img.aspectRatio || "1:1");
    if (img.referenceImage) {
      setReferenceImage(img.referenceImage);
      setReferenceImageName("Ảnh tham chiếu cũ");
    }
    setActiveModalImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lọc tác phẩm
  const filteredGallery =
    selectedFilter === "all"
      ? gallery
      : gallery.filter((img) => img.style === selectedFilter);

  return (
    <div className="w-full max-w-[980px] mx-auto flex flex-col items-center pb-16">
      {/* Studio Header */}
      <div className="w-full mb-8 pb-6 border-b border-slate-200 dark:border-indigo-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            🎨
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === "en" ? "AI Image Studio" : "Studio Sáng Tạo Hình Ảnh AI"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {language === "en"
                ? "Generate images from text or upload photos to restyle"
                : "Tạo ảnh từ mô tả hoặc đính kèm ảnh để biến đổi phong cách"}
            </p>
          </div>
        </div>

        {/* User Credits Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <span className="text-amber-500">🪙</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">
            {user?.role === "ADMIN" ? (
              <span className="text-amber-500 flex items-center gap-1.5">
                <span>{language === "en" ? "∞ Unlimited Credits" : "∞ Vô hạn Credits"}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 font-black">
                  ADMIN
                </span>
              </span>
            ) : (
              language === "en" ? `${user?.credits ?? 10} Credits available` : `${user?.credits ?? 10} Credits khả dụng`
            )}
          </span>
        </div>
      </div>

      {/* Generation Command Center */}
      <div className="w-full p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-xl border border-slate-200 dark:border-indigo-950/80 shadow-xl shadow-indigo-950/15 mb-10">
        {/* Error message */}
        {generationError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-medium flex items-center justify-between">
            <span>{generationError}</span>
            <button
              onClick={() => setGenerationError(null)}
              className="text-slate-400 hover:text-white ml-2 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          className="hidden"
        />

        {/* PROMPT & COMPACT ATTACHMENT AREA */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>{language === "en" ? "Describe your artwork (Prompt)" : "Mô tả hình ảnh bạn muốn tạo (Prompt)"}</span>
              {referenceImage && (
                <span className="text-[10px] lowercase font-normal px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">
                  {language === "en" ? "with reference image" : "có ảnh đính kèm"}
                </span>
              )}
            </label>
            <span className="text-[11px] text-slate-400">
              {language === "en" ? "Vietnamese or English supported" : "Tiếng Việt hoặc Tiếng Anh đều được"}
            </span>
          </div>

          {/* Textarea Box with Drag & Drop */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className={`relative rounded-2xl border transition-all ${
              isDragging
                ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20"
                : "border-slate-200 dark:border-indigo-950/80 bg-slate-50 dark:bg-[#131522]"
            }`}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              rows={3}
              placeholder={
                referenceImage
                  ? (language === "en"
                      ? "e.g., Transform the photo into a professional 8k photograph with natural studio lighting..."
                      : "Ví dụ: Biến ảnh thành bức ảnh chụp chuyên nghiệp 8k, ánh sáng studio tự nhiên...")
                  : (language === "en"
                      ? "e.g., Industrial warehouse loading bay with cargo trucks, forklifts, realistic lighting, 8k professional photo..."
                      : "Ví dụ: Kho xưởng công nghiệp bốc dỡ hàng, ảnh chụp chân thực, ánh sáng điện ảnh, chi tiết sắc nét 8k...")
              }
              className="w-full p-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden transition-all resize-none"
            />

            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt("")}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs cursor-pointer"
                title={language === "en" ? "Clear prompt" : "Xóa prompt"}
              >
                ✕
              </button>
            )}

            {/* SLEEK COMPACT TOOLBAR AT THE BOTTOM OF PROMPT BOX */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2.5 pt-1 border-t border-slate-100 dark:border-indigo-950/40">
              {/* Left: Compact Image Attachment Spot */}
              <div className="flex items-center gap-2">
                {!referenceImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1a1c2e] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                    title={language === "en" ? "Attach image to stylize" : "Đính kèm ảnh để AI biến đổi phong cách"}
                  >
                    <span className="text-xs group-hover:scale-110 transition-transform">📷</span>
                    <span>{language === "en" ? "Attach image" : "Đính kèm ảnh"}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs animate-in fade-in">
                    <img
                      src={referenceImage}
                      alt="Ref"
                      className="w-6 h-6 rounded-lg object-cover border border-indigo-300 dark:border-indigo-700 shrink-0"
                    />
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-cyan-300 max-w-[120px] sm:max-w-[160px] truncate">
                      {referenceImageName || (language === "en" ? "Reference photo" : "Ảnh tham chiếu")}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-slate-400 hover:text-indigo-500 cursor-pointer ml-0.5 font-medium"
                      title={language === "en" ? "Change image" : "Đổi ảnh khác"}
                    >
                      {language === "en" ? "Change" : "Đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImage(null);
                        setReferenceImageName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-0.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer text-xs"
                      title={language === "en" ? "Remove image" : "Gỡ ảnh"}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Quick Suggestions (Compact chips) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none max-w-full">
                {(referenceImage
                  ? (language === "en" ? REFERENCE_SUGGESTIONS_EN : REFERENCE_SUGGESTIONS)
                  : (language === "en" ? PROMPT_SUGGESTIONS_EN : PROMPT_SUGGESTIONS)
                ).map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181a28] hover:bg-slate-200 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-transparent hover:border-indigo-500/30 shrink-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* OPTIONS: STYLE & RATIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Style Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {language === "en" ? "Art Style" : "Phong cách nghệ thuật"}
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                const styleName = language === "en" && style.labelEn ? style.labelEn : style.label;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/30 scale-102"
                        : "bg-slate-100 dark:bg-[#131522] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{style.icon}</span>
                    <span>{styleName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {language === "en" ? "Aspect Ratio" : "Tỷ lệ khung hình"}
            </label>
            <div className="flex gap-2">
              {[
                { id: "1:1", labelVi: "1:1 (Vuông)", labelEn: "1:1 (Square)", icon: "◻" },
                { id: "16:9", labelVi: "16:9 (Ngang)", labelEn: "16:9 (Landscape)", icon: "▭" },
                { id: "9:16", labelVi: "9:16 (Dọc)", labelEn: "9:16 (Portrait)", icon: "▯" },
              ].map((ratio) => {
                const isSelected = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/30 scale-102"
                        : "bg-slate-100 dark:bg-[#131522] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{ratio.icon}</span>
                    <span>{language === "en" ? ratio.labelEn : ratio.labelVi}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-4 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{generatingStage || (language === "en" ? "Generating, please wait..." : "Đang tạo, vui lòng chờ...")}</span>
            </>
          ) : (
            <>
              <span className="text-base">{referenceImage ? "🪄" : "✨"}</span>
              <span>
                {referenceImage
                  ? (language === "en" ? "Transform Artwork from Image (1 Credit)" : "Biến đổi tác phẩm theo ảnh (1 Credit)")
                  : (language === "en" ? "Generate Image Now (1 Credit)" : "Tạo hình ảnh ngay (1 Credit)")}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Gallery Showcase */}
      <div className="w-full">
        {/* Gallery Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === "en" ? "Recent Creations" : "Tác phẩm gần đây"}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold border border-cyan-500/20">
              {gallery.length}/4 {language === "en" ? "saved (max 4)" : "đã lưu (tối đa 4)"}
            </span>
          </div>

          {/* Style Filters (Only shown when there are saved images) */}
          {gallery.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#131522] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "en" ? "All" : "Tất cả"}
              </button>
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedFilter(s.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                    selectedFilter === s.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-[#131522] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{(language === "en" && s.labelEn ? s.labelEn : s.label).split(" ")[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty State when no recent images have been created yet */}
        {gallery.length === 0 && !isGenerating ? (
          <div className="w-full py-14 px-6 rounded-3xl bg-slate-50/80 dark:bg-[#0c0e17]/80 border border-dashed border-slate-300 dark:border-indigo-950/80 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎨
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              {language === "en" ? "No recent artworks yet" : "Chưa có tác phẩm nào"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {language === "en"
                ? "Describe your creative idea above and click Generate. Your 4 most recent artworks will be saved and displayed right here!"
                : "Hãy nhập mô tả ý tưởng ở phía trên rồi bấm tạo ảnh. Tối đa 4 tác phẩm bạn tạo gần nhất sẽ tự động được lưu và hiển thị tại đây!"}
            </p>
          </div>
        ) : gallery.length > 0 && filteredGallery.length === 0 && !isGenerating ? (
          <div className="w-full py-12 px-6 rounded-3xl bg-slate-50/80 dark:bg-[#0c0e17]/80 border border-slate-200 dark:border-indigo-950/80 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
              {language === "en"
                ? "No creations match this style among your 4 recent images."
                : "Không có tác phẩm nào thuộc phong cách này trong 4 ảnh gần đây."}
            </p>
            <button
              onClick={() => setSelectedFilter("all")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {language === "en" ? "View all recent images" : "Xem tất cả ảnh gần đây"}
            </button>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* LIVE SKELETON CARD WHEN GENERATING (SMOOTH REAL-TIME FEEDBACK) */}
            {isGenerating && (
              <div className="rounded-3xl bg-white/95 dark:bg-[#0c0e17]/95 border-2 border-indigo-500/60 shadow-xl shadow-indigo-500/15 overflow-hidden flex flex-col justify-between animate-pulse">
                <div
                  className={`relative overflow-hidden ${
                    aspectRatio === "16:9"
                      ? "aspect-video"
                      : aspectRatio === "9:16"
                      ? "aspect-[9/16] max-h-[460px]"
                      : "aspect-square"
                  } bg-gradient-to-tr from-indigo-950/60 via-purple-950/40 to-cyan-950/50 flex flex-col items-center justify-center p-6 text-center`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl mb-3 animate-spin">
                    ✨
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white mb-1">
                    {generatingStage || (language === "en" ? "Generating, please wait..." : "Đang tạo, vui lòng chờ...")}
                  </span>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    {language === "en" ? "Please wait a moment..." : "Vui lòng chờ giây lát..."}
                  </p>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            )}

          {filteredGallery.map((item) => {
            const ratioClass =
              item.aspectRatio === "16:9"
                ? "aspect-video"
                : item.aspectRatio === "9:16"
                ? "aspect-[9/16] max-h-[460px]"
                : "aspect-square";

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-md border border-slate-200/90 dark:border-indigo-950/70 overflow-hidden shadow-xs hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container with Hover Overlay */}
                <div
                  onClick={() => setActiveModalImage(item)}
                  className={`relative overflow-hidden ${ratioClass} bg-slate-100 dark:bg-[#121422] cursor-pointer`}
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src =
                        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {item.styleLabel || item.style}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-cyan-400 border border-white/10">
                      {item.aspectRatio}
                    </span>
                    {item.referenceImage && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600/80 backdrop-blur-md text-white border border-indigo-400/30">
                        {language === "en" ? "📸 With photo" : "📸 Có ảnh gốc"}
                      </span>
                    )}
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalImage(item);
                      }}
                      className="p-2.5 rounded-xl bg-white/90 dark:bg-[#131522]/90 text-slate-800 dark:text-white hover:scale-110 shadow-lg transition-transform cursor-pointer"
                      title={language === "en" ? "View details & compare" : "Xem chi tiết & So sánh"}
                    >
                      🔍
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      className="p-2.5 rounded-xl bg-white/90 dark:bg-[#131522]/90 text-slate-800 dark:text-white hover:scale-110 shadow-lg transition-transform cursor-pointer"
                      title={language === "en" ? "Download image" : "Tải ảnh về máy"}
                    >
                      {downloadingId === item.id ? "⏳" : "⬇️"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2.5 rounded-xl bg-white/90 dark:bg-[#131522]/90 text-rose-500 hover:scale-110 shadow-lg transition-transform cursor-pointer"
                      title={language === "en" ? "Delete image" : "Xóa ảnh"}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Image Details */}
                <div className="p-4">
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 mb-3">
                    "{item.prompt}"
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">{item.createdAt}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.prompt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#181a28] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{copiedId === item.id ? "✓" : "📋"}</span>
                        <span>{copiedId === item.id ? (language === "en" ? "Copied" : "Đã chép") : (language === "en" ? "Copy Prompt" : "Sao chép Prompt")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Lightbox Modal: Chi tiết tác phẩm & So sánh Trước/Sau */}
      {activeModalImage && (
        <div
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#0c0e17] border border-indigo-950/80 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/60 flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left: High-Res Image View & Before/After */}
            <div className="flex-1 bg-black flex flex-col items-center justify-center p-3 overflow-hidden relative">
              <img
                src={activeModalImage.url}
                alt={activeModalImage.prompt}
                className="max-h-[55vh] md:max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {/* Reference Image Thumbnail if available (Before / After view) */}
              {activeModalImage.referenceImage && (
                <div className="absolute bottom-4 left-4 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 flex items-center gap-2.5 shadow-xl max-w-xs">
                  <img
                    src={activeModalImage.referenceImage}
                    alt="Original"
                    className="w-12 h-12 rounded-xl object-cover border border-white/30 shrink-0"
                  />
                  <div className="min-w-0 pr-1">
                    <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
                      Ảnh gốc tham chiếu
                    </span>
                    <span className="text-[11px] text-slate-300 truncate block">
                      Đã dùng để vẽ lại
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Metadata & Actions */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/80 bg-[#0e101a] overflow-y-auto">
              <div>
                {/* Header Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {activeModalImage.styleLabel || activeModalImage.style}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      {activeModalImage.aspectRatio}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModalImage(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Original Prompt */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {language === "en" ? "Original Request / Prompt" : "Yêu cầu / Prompt gốc"}
                  </span>
                  <p className="text-xs text-white leading-relaxed font-medium bg-[#141624] p-3 rounded-xl border border-slate-800">
                    "{activeModalImage.prompt}"
                  </p>
                </div>

                {/* Enhanced Prompt */}
                {activeModalImage.enhancedPrompt && (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      {language === "en" ? "Enhanced Prompt" : "Prompt tối ưu"}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-[#141624] p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
                      {activeModalImage.enhancedPrompt}
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 mb-6">
                  {language === "en" ? "Created: " : "Được tạo: "}<strong>{activeModalImage.createdAt}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleDownload(activeModalImage)}
                  disabled={downloadingId === activeModalImage.id}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{downloadingId === activeModalImage.id ? "⏳" : "⬇️"}</span>
                  <span>{language === "en" ? "Download High-Res (.jpg)" : "Tải ảnh chất lượng cao (.jpg)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReusePrompt(activeModalImage)}
                  className="w-full py-2.5 px-4 bg-[#181a28] hover:bg-[#202334] text-cyan-300 font-semibold text-xs rounded-xl border border-indigo-950/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>{language === "en" ? "Reuse prompt & photo" : "Dùng lại prompt & ảnh này"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(activeModalImage.id, activeModalImage.prompt)}
                  className="w-full py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{copiedId === activeModalImage.id ? "✓" : "📋"}</span>
                  <span>{copiedId === activeModalImage.id ? (language === "en" ? "Copied Prompt" : "Đã sao chép prompt") : (language === "en" ? "Copy Prompt" : "Sao chép Prompt")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(activeModalImage.id)}
                  className="w-full py-2 px-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {language === "en" ? "🗑️ Delete from gallery" : "🗑️ Xóa khỏi thư viện"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
