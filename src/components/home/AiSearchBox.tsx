"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  AI_MODELS,
  TRENDING_QUESTIONS,
  AiModelOption,
  getDailyHotQuestions,
  getFormattedToday,
  DailyHotTopic,
} from "@/data/aiData";
import {
  extractImagesFromClipboard,
  extractImagesFromFileList,
  extractImagesFromDrop,
} from "@/lib/imageUtils";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

interface AiSearchBoxProps {
  onSubmitPrompt: (prompt: string, model: string, images?: string[]) => void;
}

export default function AiSearchBox({ onSubmitPrompt }: AiSearchBoxProps) {
  const { t, language } = useLanguage();
  const { showAlert } = usePopup();
  const [prompt, setPrompt] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<AiModelOption>(AI_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imgs = await extractImagesFromClipboard(e);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgs = await extractImagesFromFileList(e.target.files);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const imgs = await extractImagesFromDrop(e);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() && attachedImages.length === 0) return;
    onSubmitPrompt(prompt.trim(), selectedModel.id, attachedImages);
    setPrompt("");
    setAttachedImages([]);
    setIsFocused(false);
  };

  const handleSelectSuggestion = (question: string) => {
    setPrompt(question);
    onSubmitPrompt(question, selectedModel.id, attachedImages);
    setAttachedImages([]);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      showAlert(
        language === "en" ? "Your browser does not support speech recognition directly." : "Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp.",
        "Thông báo",
        "warning"
      );
      return;
    }

    try {
      type SpeechRecognitionType = new () => {
        lang: string;
        continuous: boolean;
        onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };

      const SpeechRecognitionClass =
        ((window as unknown as { SpeechRecognition?: SpeechRecognitionType }).SpeechRecognition ||
         (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionType }).webkitSpeechRecognition)!;

      const recognition = new SpeechRecognitionClass();
      recognition.lang = language === "en" ? "en-US" : "vi-VN";
      recognition.continuous = false;

      if (!isListening) {
        recognition.start();
        setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setPrompt((prev) => (prev ? prev + " " + transcript : transcript));
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      }
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full mx-auto flex flex-col items-center relative z-20">
      {/* Big Center Hero Section */}
      <div className="text-center mb-8 relative">
        {/* Glow Aura Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full animate-pulse"></div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight transition-all leading-tight">
          {language === "en" ? (
            <>
              Ask anything you don't know,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent font-black drop-shadow-xs">
                because I know everything
              </span>
            </>
          ) : (
            <>
              Hãy hỏi những điều bạn không biết{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent font-black drop-shadow-xs block sm:inline mt-1 sm:mt-0">
                vì tôi cái gì cũng biết
              </span>
            </>
          )}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mt-4 mb-2 max-w-2xl mx-auto transition-colors leading-relaxed font-medium">
          {language === "en"
            ? "Your ultimate AI assistant ready to answer all questions, solve code, generate images, and assist your daily tasks."
            : "Trợ lý AI đa nhiệm luôn sẵn sàng giải đáp mọi thắc mắc, viết code, tạo hình ảnh và hỗ trợ bạn trong mọi công việc."}
        </p>
      </div>

      {/* Biệt Tuốt AI Custom Feature Suite - Circular Icon Badges */}
      <div className="w-full mb-8 mt-2">
        <div className="flex items-center justify-between px-1 mb-4">
          <span className="text-[12px] font-bold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            {language === "en" ? "Omni Special Engines" : "BỘ CÔNG CỤ ĐỘC QUYỀN BIỆT TUỐT AI"}
          </span>
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar py-2 px-1">
          {[
            {
              id: "tarot",
              name: language === "en" ? "Tarot" : "Tarot",
              glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] group-hover:border-purple-400 group-hover:text-purple-400",
              badgeColor: "bg-purple-500",
              iconColor: "text-purple-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="10" height="15" x="2" y="5" rx="2" transform="rotate(-12 7 12)" />
                  <rect width="10" height="15" x="12" y="4" rx="2" transform="rotate(12 17 11)" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-purple-500/10 via-slate-900 to-purple-950/20 text-purple-300 border border-purple-500/30",
              dot: "bg-purple-400 shadow-[0_0_6px_#c084fc]",
              tab: "tarot",
              prompt: "",
            },
            {
              id: "tuvi",
              name: language === "en" ? "Tu Vi" : "Tử Vi",
              glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.45)] group-hover:border-amber-400 group-hover:text-amber-400",
              badgeColor: "bg-amber-500",
              iconColor: "text-amber-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  <path d="M19 4v4" />
                  <path d="M21 6h-4" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 text-amber-300 border border-amber-500/30",
              dot: "bg-amber-400 shadow-[0_0_6px_#fbbf24]",
              tab: "tuvi",
              prompt: "",
            },
            {
              id: "chiemtinh",
              name: language === "en" ? "Astrology" : "Chiêm Tinh",
              glow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] group-hover:border-cyan-400 group-hover:text-cyan-400",
              badgeColor: "bg-cyan-500",
              iconColor: "text-cyan-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4.5" />
                  <path d="M3.5 14.5c3-6 14-6 17 0" />
                  <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-cyan-500/10 via-slate-900 to-cyan-950/20 text-cyan-300 border border-cyan-500/30",
              dot: "bg-cyan-400 shadow-[0_0_6px_#22d3ee]",
              tab: "chiemtinh",
              prompt: "",
            },
            {
              id: "battu",
              name: language === "en" ? "Bazi Chart" : "Bát Tự",
              glow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.45)] group-hover:border-rose-400 group-hover:text-rose-400",
              badgeColor: "bg-rose-500",
              iconColor: "text-rose-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="3" />
                  <path d="M8 3v18" />
                  <path d="M12 3v18" />
                  <path d="M16 3v18" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-rose-500/10 via-slate-900 to-rose-950/20 text-rose-300 border border-rose-500/30",
              dot: "bg-rose-400 shadow-[0_0_6px_#f87171]",
              tab: "battu",
              prompt: "",
            },
            {
              id: "toan",
              name: language === "en" ? "Math Solver" : "Giải Toán",
              glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.45)] group-hover:border-blue-400 group-hover:text-blue-400",
              badgeColor: "bg-blue-500",
              iconColor: "text-blue-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <line x1="8" x2="16" y1="6" y2="6" />
                  <line x1="16" x2="16" y1="14" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-blue-500/10 via-slate-900 to-blue-950/20 text-blue-300 border border-blue-500/30",
              dot: "bg-blue-400 shadow-[0_0_6px_#60a5fa]",
              tab: "toan",
              prompt: "",
            },
            {
              id: "english",
              name: language === "en" ? "Learn English" : "Học tiếng Anh",
              glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] group-hover:border-emerald-400 group-hover:text-emerald-400",
              badgeColor: "bg-emerald-500",
              iconColor: "text-emerald-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-emerald-500/10 via-slate-900 to-emerald-950/20 text-emerald-300 border border-emerald-500/30",
              dot: "bg-emerald-400 shadow-[0_0_6px_#34d399]",
              tab: "english",
              prompt: "",
            },
            {
              id: "writer",
              name: language === "en" ? "Writer" : "Viết lách",
              glow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.45)] group-hover:border-pink-400 group-hover:text-pink-400",
              badgeColor: "bg-pink-500",
              iconColor: "text-pink-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-pink-500/10 via-slate-900 to-pink-950/20 text-pink-300 border border-pink-500/30",
              dot: "bg-pink-400 shadow-[0_0_6px_#f472b6]",
              tab: "home",
              prompt: language === "en" ? "Please help me write an engaging piece about: " : "Hãy giúp tôi viết một bài viết hấp dẫn về: ",
            },
            {
              id: "card_scan",
              name: language === "en" ? "Card & Doc Scanner" : "Quét Card/Tài liệu",
              glow: "group-hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] group-hover:border-indigo-400 group-hover:text-indigo-400",
              badgeColor: "bg-indigo-500",
              iconColor: "text-indigo-400 group-hover:scale-110",
              icon: (
                <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="8" x2="16" y1="12" y2="12" />
                </svg>
              ),
              circleStyle: "bg-gradient-to-br from-indigo-500/10 via-slate-900 to-indigo-950/20 text-indigo-300 border border-indigo-500/30",
              dot: "bg-indigo-400 shadow-[0_0_6px_#818cf8]",
              tab: "card_scan",
              prompt: "",
            },
          ].map((item, idx) => {
            const isDirectTab = item.tab !== "home" && !item.prompt;
            const Component = isDirectTab ? Link : "button";
            const extraProps = isDirectTab
              ? { href: `/?tab=${item.tab}` }
              : {
                  type: "button" as const,
                  onClick: () => {
                    if (item.prompt) {
                      setPrompt(item.prompt);
                      textareaRef.current?.focus();
                    }
                  },
                };

            return (
              <Component
                key={idx}
                {...(extraProps as any)}
                className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 active:translate-y-0"
              >
                {/* Sleek Dark Circular Icon Badge with Neon Pulsing Glow */}
                <div className="relative">
                  {/* Subtle ambient blur glow behind on hover */}
                  <div className="absolute -inset-1 rounded-2xl blur-md opacity-20 group-hover:opacity-90 transition-opacity duration-300 bg-current pointer-events-none" />

                  <div
                    className={`w-13 h-13 rounded-2xl ${item.circleStyle} ${(item as any).glow} flex items-center justify-center transition-all duration-300 shadow-sm relative z-10 backdrop-blur-md group-hover:scale-110 group-hover:-translate-y-1`}
                  >
                    <div className={`${(item as any).iconColor} transition-transform duration-300 group-hover:scale-110`}>
                      {item.icon}
                    </div>
                  </div>
                  {item.dot && (
                    <span
                      className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${item.dot} ring-2 ring-white dark:ring-[#0c0e17] z-20 animate-pulse`}
                    />
                  )}
                </div>

                {/* Clean minimalist text label with color transition */}
                <span className="text-[12px] font-bold text-slate-700 dark:text-neutral-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors whitespace-nowrap tracking-tight">
                  {item.name}
                </span>
              </Component>
            );
          })}
        </div>
      </div>

      {/* Main Search/Prompt Box Container - LÀM NỔI BẬT KHUNG NHẬP CÂU HỎI */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`w-full bg-white dark:bg-[#16181f] rounded-2xl border transition-all duration-200 shadow-xs relative ${
          isFocused
            ? "border-slate-400 dark:border-slate-600 shadow-sm ring-1 ring-slate-400/20 z-30"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs z-20"
        }`}
      >
        {/* Quick Mode/Task Chips (Gợi ý tác vụ nhanh) */}
        <div className="px-4.5 pt-3.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { label: language === "en" ? "💬 Chat AI" : "💬 Trò chuyện", prompt: "" },
            { label: language === "en" ? "🎨 Draw Image" : "🎨 Vẽ tranh AI", prompt: "Vẽ bức ảnh " },
            { label: language === "en" ? "💻 Code Helper" : "💻 Viết & Sửa Code", prompt: "Hãy viết code " },
            { label: language === "en" ? "✍️ Content Writer" : "✍️ Viết bài viết", prompt: "Soạn thảo bài viết về " },
            { label: language === "en" ? "🌐 Translate" : "🌐 Dịch thuật", prompt: "Dịch đoạn văn này sang tiếng Việt: " },
            { label: language === "en" ? "🔍 Deep Analysis" : "🔍 Giải & Phân tích", prompt: "Phân tích chi tiết vấn đề: " },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (chip.prompt) {
                  setPrompt(chip.prompt);
                  textareaRef.current?.focus();
                }
              }}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="p-4.5 pt-3 pb-2.5">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "en"
                ? "Ask anything, paste images (Ctrl+V) to analyze, request code or creative writing..."
                : "Nhập bất kỳ câu hỏi nào, dán ảnh (Ctrl+V) để phân tích, yêu cầu viết code hoặc tạo nội dung..."
            }
            rows={2}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none text-sm sm:text-base leading-relaxed"
          />
        </div>

        {/* Attached Images Preview Tray */}
        {attachedImages.length > 0 && (
          <div className="px-4 py-2.5 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-[#0d0f1a]/60">
            {attachedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group w-14 h-14 rounded-xl overflow-hidden border border-indigo-500/40 dark:border-cyan-500/40 shadow-sm"
              >
                <img
                  src={img}
                  alt={`Ảnh đính kèm ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                  title="Xóa ảnh"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <span>📸</span> {language === "en" ? `${attachedImages.length} image(s) attached` : `Đã đính kèm ${attachedImages.length} ảnh`}
            </div>
          </div>
        )}

        {/* Hidden File Input for Picking Images */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Bottom Actions Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/70 dark:bg-[#0e101a]/80 rounded-b-2xl">
          {/* Left: Attach & Model Selector */}
          <div className="flex items-center gap-2">
            {/* Attach file button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center gap-1"
              title={language === "en" ? "Attach or paste image (Ctrl+V)" : "Đính kèm hoặc dán hình ảnh (Ctrl+V)"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-[11px] font-medium hidden sm:inline">{language === "en" ? "Image" : "Ảnh"}</span>
            </button>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>{selectedModel.icon}</span>
                <span>{language === "en" ? (selectedModel.labelEn || selectedModel.label) : selectedModel.label}</span>
                <span className="text-[10px] text-slate-400">∨</span>
              </button>

              {/* Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-[#12141e] border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-2xl z-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    {language === "en" ? "Select AI Model" : "Chọn mô hình AI"}
                  </div>
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedModel.id === model.id
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{model.icon}</span>
                        <div>
                          <div className="font-semibold">{language === "en" ? (model.labelEn || model.label) : model.label}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{language === "en" ? (model.descriptionEn || model.description) : model.description}</div>
                        </div>
                      </div>
                      {model.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold border border-indigo-500/20">
                          {language === "en" ? (model.badgeEn || model.badge) : model.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Voice Input & Send Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "text-cyan-400 bg-cyan-500/20 border border-cyan-400 animate-pulse"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80 active:scale-95"
              }`}
              title={language === "en" ? "Voice input" : "Nhập bằng giọng nói"}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() && attachedImages.length === 0}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                prompt.trim() || attachedImages.length > 0
                  ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 scale-100 cursor-pointer border border-white/20"
                  : "bg-slate-200/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
              }`}
              title={language === "en" ? "Send query" : "Gửi câu hỏi"}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Suggestions Dropdown (Bảng Xếp Hạng Câu Hỏi Hot Nhất Mỗi Ngày) */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#0c0d16]/95 backdrop-blur-2xl border border-slate-200 dark:border-indigo-950/70 rounded-2xl p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Header: Tiêu đề + Ngày tháng động + Trạng thái real-time */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base select-none">🔥</span>
                <span className="text-xs font-black text-slate-900 dark:text-white tracking-wide uppercase">
                  {language === "en" ? "TODAY'S HOTTEST QUESTIONS" : "CÂU HỎI HOT NHẤT HÔM NAY"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50">
                  {getFormattedToday(language).fullStr}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === "en" ? "Realtime Trending" : "Xu hướng Realtime"}</span>
              </div>
            </div>

            {/* Danh sách câu hỏi xếp hạng theo xu hướng */}
            <div className="space-y-1">
              {getDailyHotQuestions(language).map((item, idx) => {
                const rank = idx + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(item.title)}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-indigo-950/40 flex items-center justify-between gap-3 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Huy hiệu thứ tự xếp hạng Top 1, 2, 3 nổi bật */}
                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 transition-transform group-hover:scale-110 ${
                          isTop1
                            ? "bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-xs shadow-rose-500/30"
                            : isTop2
                            ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/30"
                            : isTop3
                            ? "bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-xs shadow-amber-500/30"
                            : "bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-bold"
                        }`}
                      >
                        {rank}
                      </span>

                      {/* Tiêu đề câu hỏi */}
                      <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-cyan-400 font-medium transition-colors">
                        {item.title}
                      </span>
                    </div>

                    {/* Huy hiệu Tag & Số lượt hỏi */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.tagLabel && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.tag === "hot"
                              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                              : item.tag === "new"
                              ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40"
                              : item.tag === "surge"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {item.tagLabel}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                        {item.views}
                      </span>

                      <svg
                        className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Tip */}
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span>💡</span>
                <span>
                  {language === "en"
                    ? "Click any question to start chatting with AI"
                    : "Nhấn vào câu hỏi bất kỳ để trò chuyện ngay với AI"}
                </span>
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                {language === "en"
                  ? "Top trending questions in past 24h"
                  : "Top câu hỏi thịnh hành 24h qua"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
