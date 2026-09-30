"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

// ─── ANALYSIS MODES ───────────────────────────────────────────────────────────
const ANALYSIS_MODES = [
  {
    id: "overall",
    label: "Tổng quan",
    labelEn: "Overview",
    emoji: "🔍",
    desc: "Phân tích toàn diện cốt truyện, nhân vật, văn phong",
    descEn: "Comprehensive analysis of plot, characters, and writing style",
    color: "from-indigo-600 to-violet-600",
  },
  {
    id: "plot",
    label: "Mạch truyện",
    labelEn: "Plot Arc",
    emoji: "📈",
    desc: "Cấu trúc 3 hồi, xung đột, nhịp độ, twist",
    descEn: "3-act structure, pacing, conflict, and twists",
    color: "from-violet-600 to-purple-600",
  },
  {
    id: "character",
    label: "Nhân vật",
    labelEn: "Characters",
    emoji: "🎭",
    desc: "Tính cách, động lực, lời thoại của từng nhân vật",
    descEn: "Personalities, motivations, and dialogues of characters",
    color: "from-rose-600 to-pink-600",
  },
  {
    id: "language",
    label: "Văn phong",
    labelEn: "Writing Style",
    emoji: "✍️",
    desc: "Câu văn, hình ảnh, từ ngữ, giọng kể",
    descEn: "Sentence variety, imagery, vocabulary, and narration tone",
    color: "from-cyan-600 to-teal-600",
  },
  {
    id: "dialogue",
    label: "Lời thoại",
    labelEn: "Dialogue",
    emoji: "💬",
    desc: "Chất lượng hội thoại, giọng nhân vật riêng biệt",
    descEn: "Dialogue naturalness and distinct character voices",
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "rewrite",
    label: "Viết lại",
    labelEn: "Rewrite",
    emoji: "✨",
    desc: "AI viết lại đoạn đã chọn với văn phong phong phú hơn",
    descEn: "AI rewrites selected excerpt with enriched prose",
    color: "from-emerald-600 to-green-600",
  },
  {
    id: "continue",
    label: "Tiếp tục",
    labelEn: "Continue",
    emoji: "➡️",
    desc: "AI viết tiếp 2-3 đoạn theo mạch truyện hiện tại",
    descEn: "AI continues next 2-3 paragraphs following story arc",
    color: "from-sky-600 to-blue-600",
  },
];

// ─── STORY TEMPLATES ──────────────────────────────────────────────────────────
const STORY_TEMPLATES = [
  {
    id: "romance",
    label: "Tiểu thuyết ngôn tình",
    labelEn: "Romance Novel",
    emoji: "💕",
    placeholder: `Tên truyện: [Tên truyện của bạn]

CHƯƠNG 1: [Tên chương]

[Bối cảnh & mở đầu]
Ánh nắng chiều tà rải vàng trên con phố nhỏ. Cô gái với mái tóc đen dài bước vội, tay ôm chặt chồng hồ sơ...

[Cuộc gặp gỡ]
...`,
    placeholderEn: `Title: [Your Story Title]

CHAPTER 1: [Chapter Title]

[Setting & Hook]
The golden twilight painted the narrow street. She walked swiftly, clutching a thick stack of manuscripts...

[The Encounter]
...`,
  },
  {
    id: "action",
    label: "Kịch bản hành động",
    labelEn: "Action Screenplay",
    emoji: "⚔️",
    placeholder: `KỊCH BẢN: [Tên phim/truyện]
Thể loại: Hành động / Phiêu lưu

CẢNH 1 - EXT. ĐƯỜNG PHỐ SAIGON - ĐÊM
[Mô tả bối cảnh]

NHÂN VẬT: Tên - Đặc điểm ngắn gọn

CẢNH 2 - INT. VĂN PHÒNG - NGÀY
...`,
    placeholderEn: `SCREENPLAY: [Title]
Genre: Action / Thriller

SCENE 1 - EXT. CITY STREET - NIGHT
[Atmosphere description]

CHARACTERS: Name - brief traits

SCENE 2 - INT. OFFICE - DAY
...`,
  },
  {
    id: "mystery",
    label: "Truyện trinh thám",
    labelEn: "Mystery & Detective",
    emoji: "🔍",
    placeholder: `TÊN TRUYỆN: [Tên truyện]

VỤ ÁN: [Mô tả vụ án ngắn gọn]
THÁM TỬ: [Tên & đặc điểm]
THỜI GIAN: [Thời điểm xảy ra]

CHƯƠNG 1

[Mở đầu bằng cảnh phát hiện sự việc...]`,
    placeholderEn: `STORY: [Title]

CASE: [Brief case overview]
DETECTIVE: [Name & key traits]
TIME: [Timeline]

CHAPTER 1

[Opening with discovery scene...]`,
  },
  {
    id: "fantasy",
    label: "Dị thế giới / Fantasy",
    labelEn: "Fantasy & Isekai",
    emoji: "🐉",
    placeholder: `THẾ GIỚI: [Tên thế giới]
HỆ THỐNG NĂNG LỰC: [Hệ thống tu luyện/ma thuật]
NHÂN VẬT CHÍNH: [Tên - xuất thân - mục tiêu]

CHƯƠNG 1: ĐẦU THAI

[Cảnh mở đầu...]`,
    placeholderEn: `WORLD: [Realm Name]
MAGIC SYSTEM: [Core elemental/cultivation tiers]
PROTAGONIST: [Name - origin - goal]

CHAPTER 1: REBIRTH

[Opening scene...]`,
  },
  {
    id: "blank",
    label: "Trang trắng",
    labelEn: "Blank Canvas",
    emoji: "📝",
    placeholder: ``,
    placeholderEn: ``,
  },
];

// ─── WORD COUNT ───────────────────────────────────────────────────────────────
function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countChars(text: string): number {
  return text.replace(/\s/g, "").length;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
interface StoryWriterViewProps {
  onBack?: () => void;
}

export default function StoryWriterView({ onBack }: StoryWriterViewProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showAlert, showConfirm } = usePopup();

  // Editor state
  const [content, setContent] = useState("");
  const [storyTitle, setStoryTitle] = useState(
    language === "en" ? "Untitled Story" : "Truyện chưa có tên"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Selection for analysis
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // AI Panel state
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState("overall");
  const [aiContext, setAiContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [analyzeTarget, setAnalyzeTarget] = useState<"selected" | "all">("all");

  // History for undo
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Auto-save indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle text selection in editor
  const handleEditorSelect = () => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    if (start !== end) {
      const sel = content.substring(start, end);
      setSelectedText(sel);
      setSelectionRange({ start, end });
      setAnalyzeTarget("selected");
    } else {
      setSelectedText("");
      setSelectionRange(null);
      setAnalyzeTarget("all");
    }
  };

  // Content change with history
  const handleContentChange = (val: string) => {
    setContent(val);
    // Auto-save
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      setLastSaved(new Date());
    }, 2000);
  };

  // Apply template
  const applyTemplate = async (tpl: (typeof STORY_TEMPLATES)[0]) => {
    const confirmMsg =
      language === "en"
        ? "Do you want to use this template? Current content will be overwritten."
        : "Bạn có muốn dùng template này? Nội dung hiện tại sẽ bị thay thế.";
    if (content.trim()) {
      const ok = await showConfirm(confirmMsg, "Xác nhận đổi mẫu truyện");
      if (!ok) return;
    }
    setContent(language === "en" && tpl.placeholderEn !== undefined ? tpl.placeholderEn : tpl.placeholder);
    setSelectedTemplate(tpl.id);
    if (
      tpl.id !== "blank" &&
      (storyTitle === "Truyện chưa có tên" || storyTitle === "Untitled Story")
    ) {
      setStoryTitle(
        language === "en"
          ? `${tpl.labelEn || tpl.label} Story`
          : `Truyện ${tpl.label}`
      );
    }
  };

  // Undo/Redo keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (historyIdx > 0) {
        setHistoryIdx((i) => i - 1);
        setContent(history[historyIdx - 1]);
      }
    }
  };

  // Insert text at cursor
  const insertAtCursor = (text: string) => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = start + text.length;
        editorRef.current.selectionEnd = start + text.length;
        editorRef.current.focus();
      }
    }, 0);
  };

  // AI Analysis
  const handleAnalyze = async () => {
    const textToAnalyze = analyzeTarget === "selected" && selectedText ? selectedText : content;
    if (!textToAnalyze.trim()) {
      showAlert(language === "en" ? "No content to analyze!" : "Chưa có nội dung để phân tích!", "Lưu ý", "warning");
      return;
    }
    if (countWords(textToAnalyze) < 20) {
      showAlert(
        language === "en"
          ? "Need at least 20 words for accurate AI analysis!"
          : "Cần ít nhất 20 từ để AI phân tích chính xác!",
        "Lưu ý",
        "warning"
      );
      return;
    }

    setIsAnalyzing(true);
    setAiResult("");

    try {
      const res = await fetch("/api/story-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToAnalyze,
          mode: selectedMode,
          context: aiContext,
          language: language,
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAiResult((prev) => prev + chunk);
      }
    } catch (err) {
      console.error("Analyze error:", err);
      setAiResult(
        language === "en"
          ? "❌ Error analyzing. Please try again."
          : "❌ Lỗi khi phân tích. Vui lòng thử lại."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy AI result
  const copyAiResult = () => {
    if (aiResult) {
      navigator.clipboard.writeText(aiResult);
    }
  };

  // Insert AI result into editor
  const insertAiResult = () => {
    if (aiResult && (selectedMode === "rewrite" || selectedMode === "continue")) {
      if (selectedMode === "continue") {
        setContent((prev) => prev + "\n\n" + aiResult);
      } else if (selectionRange) {
        const newContent =
          content.substring(0, selectionRange.start) +
          aiResult +
          content.substring(selectionRange.end);
        setContent(newContent);
      } else {
        setContent((prev) => prev + "\n\n" + aiResult);
      }
    }
  };

  const wordCount = countWords(content);
  const charCount = countChars(content);
  const currentMode = ANALYSIS_MODES.find((m) => m.id === selectedMode);
  const currentModeLabel = language === "en" ? (currentMode?.labelEn || currentMode?.label) : currentMode?.label;

  return (
    <div className="w-full h-full flex flex-col">
      {/* ── TOOLBAR ── */}
      <div className="w-full flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-indigo-950/70">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title={language === "en" ? "Back" : "Quay lại"}
            >
              ←
            </button>
          )}
          {/* Title editable */}
          {isEditingTitle ? (
            <input
              ref={titleRef}
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              className="text-lg font-black text-slate-900 dark:text-white bg-transparent border-b-2 border-indigo-500 outline-none px-1 min-w-0 flex-1 max-w-xs"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-xs"
              title={language === "en" ? "Click to rename" : "Nhấn để đổi tên"}
            >
              📖 {storyTitle}
            </h1>
          )}
          {lastSaved && (
            <span className="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
              ✓ {t("writer.saved")}{" "}
              {lastSaved.toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 mr-2">
            <span>
              {wordCount.toLocaleString()} {t("writer.words")}
            </span>
            <span>
              {charCount.toLocaleString()} {t("writer.chars")}
            </span>
          </div>
          {/* Toggle AI Panel */}
          <button
            onClick={() => setAiPanelOpen((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              aiPanelOpen
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <span>🤖</span>
            <span className="hidden sm:inline">{t("writer.ai_analysis")}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* ── LEFT: EDITOR ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Template picker (when empty) */}
          {!content.trim() && !selectedTemplate && (
            <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                🚀 {t("writer.start_template")}
              </p>
              <div className="flex flex-wrap gap-2">
                {STORY_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{tpl.emoji}</span>
                    <span>{language === "en" ? (tpl.labelEn || tpl.label) : tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick format toolbar */}
          <div className="flex items-center gap-1 flex-wrap">
            {[
              {
                label: language === "en" ? "★ New Chapter" : "★ Chương mới",
                insert:
                  language === "en"
                    ? "\n\n═══════════════\nCHAPTER [X]: [CHAPTER TITLE]\n═══════════════\n\n"
                    : "\n\n═══════════════\nCHƯƠNG [X]: [TÊN CHƯƠNG]\n═══════════════\n\n",
              },
              {
                label: language === "en" ? "[ ] Scene" : "[ ] Cảnh",
                insert:
                  language === "en"
                    ? "\nSCENE [X] - [LOCATION] - [TIME]\n"
                    : "\nCẢNH [X] - [ĐỊA ĐIỂM] - [THỜI GIAN]\n",
              },
              {
                label: language === "en" ? "— Dialogue" : "— Thoại",
                insert:
                  language === "en"
                    ? '— "[Character speech]" — [Character Name] said, [action].\n'
                    : '— "[Lời nhân vật]" — [Tên nhân vật] nói, [hành động].\n',
              },
              { label: "* * *", insert: "\n\n* * *\n\n" },
              {
                label: language === "en" ? "[Note]" : "[Ghi chú]",
                insert: language === "en" ? "[NOTE: ]\n" : "[GHI CHÚ: ]\n",
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => insertAtCursor(item.insert)}
                className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-[#11131c] border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Editor */}
          <div className="flex-1 relative min-h-0">
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onSelect={handleEditorSelect}
              onKeyDown={handleKeyDown}
              placeholder={selectedTemplate ? "" : t("writer.placeholder")}
              className="w-full h-full min-h-[420px] bg-white dark:bg-[#080a12] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 leading-7 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 resize-none font-[Georgia,'Times New Roman',serif] transition-all selection:bg-indigo-200 dark:selection:bg-indigo-900/60"
              spellCheck={false}
            />

            {/* Selected text indicator */}
            {selectedText && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-indigo-600/90 dark:bg-indigo-600/80 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-lg">
                  <span>
                    ✂️ {language === "en" ? `Selected ${selectedText.length} chars` : `Đã chọn ${selectedText.length} ký tự`}
                  </span>
                  <button
                    onClick={handleAnalyze}
                    className="ml-2 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {language === "en" ? "Analyze now →" : "Phân tích ngay →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom stats bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-3">
              <span>
                {wordCount.toLocaleString()} {t("writer.words")}
              </span>
              <span>·</span>
              <span>
                {charCount.toLocaleString()} {t("writer.chars")}
              </span>
              {wordCount > 0 && (
                <>
                  <span>·</span>
                  <span>
                    ~{Math.ceil(wordCount / 200)} {t("writer.read_time")}
                  </span>
                </>
              )}
            </div>
            {selectedText && (
              <span className="text-indigo-500 dark:text-indigo-400 font-medium">
                {t("writer.selected_snippet")} {countWords(selectedText)} {t("writer.words")}
              </span>
            )}
          </div>
        </div>

        {/* ── RIGHT: AI PANEL ── */}
        {aiPanelOpen && (
          <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-220px)]">
            {/* Mode selector */}
            <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2.5">
                🤖 {t("writer.select_mode")}
              </p>
              <div className="flex flex-col gap-1.5">
                {ANALYSIS_MODES.map((mode) => {
                  const mLabel = language === "en" ? (mode.labelEn || mode.label) : mode.label;
                  const mDesc = language === "en" ? (mode.descEn || mode.desc) : mode.desc;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer text-left ${
                        selectedMode === mode.id
                          ? "bg-gradient-to-r " + mode.color + " text-white shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{mode.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{mLabel}</p>
                        <p
                          className={`text-[10px] leading-tight mt-0.5 ${
                            selectedMode === mode.id ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {mDesc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context input */}
            <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                💭 {t("writer.notes_for_ai")}
              </label>
              <textarea
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                placeholder={t("writer.notes_placeholder")}
                rows={3}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Analyze target + button */}
            <div className="bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-3 space-y-2.5">
              <div className="flex gap-2">
                <button
                  onClick={() => setAnalyzeTarget("all")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    analyzeTarget === "all"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  📄 {t("writer.all_content")}
                </button>
                <button
                  onClick={() => setAnalyzeTarget("selected")}
                  disabled={!selectedText}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    analyzeTarget === "selected"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  ✂️ {t("writer.selected_content")}
                </button>
              </div>
              {analyzeTarget === "selected" && selectedText && (
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 truncate">
                  {t("writer.selected_snippet")} "{selectedText.slice(0, 50)}
                  {selectedText.length > 50 ? "..." : ""}"
                </p>
              )}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!content.trim() && !selectedText)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentMode
                    ? "bg-gradient-to-r " + currentMode.color + " text-white hover:opacity-90 shadow-md"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("writer.analyzing")}</span>
                  </>
                ) : (
                  <>
                    <span>{currentMode?.emoji}</span>
                    <span>
                      {t("writer.analyze_btn")} {currentModeLabel}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* AI Result */}
            {(aiResult || isAnalyzing) && (
              <div className="bg-white dark:bg-[#0d0f18] border border-indigo-200 dark:border-indigo-900/60 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/30">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{currentMode?.emoji}</span>
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      {t("writer.analysis_result")}
                    </span>
                    {isAnalyzing && (
                      <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin ml-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={copyAiResult}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer text-xs"
                      title={language === "en" ? "Copy" : "Sao chép"}
                    >
                      📋
                    </button>
                    {(selectedMode === "rewrite" || selectedMode === "continue") && aiResult && (
                      <button
                        onClick={insertAiResult}
                        className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
                        title={language === "en" ? "Insert into editor" : "Chèn vào truyện"}
                      >
                        {t("writer.insert_btn")}
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {aiResult || (
                    <span className="text-slate-400 italic">
                      {language === "en" ? "Generating analysis..." : "Đang tạo phân tích..."}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            {!aiResult && !isAnalyzing && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1.5">
                  💡 {t("writer.tips_title")}
                </p>
                <ul className="space-y-1 text-[10px] text-amber-700/80 dark:text-amber-400/80">
                  <li>• {t("writer.tip_1")}</li>
                  <li>• {t("writer.tip_2")}</li>
                  <li>• {t("writer.tip_3")}</li>
                  <li>• {t("writer.tip_4")}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
