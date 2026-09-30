"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MarkdownRendererProps {
  content: string;
  hideActionNotes?: boolean;
}

// Hàm trích xuất lời thoại thuần túy, lọc bỏ các đoạn văn miêu tả cử chỉ / bối cảnh / hành động
export function extractDialogueOnly(text: string): { dialogue: string; hasNotes: boolean } {
  if (!text) return { dialogue: "", hasNotes: false };

  // Nếu là mã code lập trình thì giữ nguyên 100%
  if (text.includes("```")) {
    return { dialogue: text, hasNotes: false };
  }

  // 1. Tìm tất cả các câu thoại trong ngoặc kép "..." hoặc “...”
  const quoteRegex = /["“][\s\S]*?["”]/g;
  const quotes = text.match(quoteRegex);

  const hasAsteriskNotes = /\*[\s\S]*?\*/.test(text);
  const hasItalicNotes = /_[\s\S]*?_/.test(text);
  const hasParenthesesNotes = /\([^)]*?\)/.test(text);

  // Nếu có câu thoại và có văn bản miêu tả kèm theo bên ngoài (như trong truyện ngôn tình / nhập vai)
  if (
    quotes &&
    quotes.length > 0 &&
    (hasAsteriskNotes || hasItalicNotes || text.replace(quoteRegex, "").trim().length > 25)
  ) {
    return {
      dialogue: quotes.map((q) => q.trim()).join("\n\n"),
      hasNotes: true,
    };
  }

  // 2. Nếu không có ngoặc kép nhưng có chứa các đoạn cử chỉ *...* hoặc _..._
  if (hasAsteriskNotes || hasItalicNotes || hasParenthesesNotes) {
    const withoutNotes = text
      .replace(/\*[\s\S]*?\*/g, "")
      .replace(/_[\s\S]*?_/g, "")
      .replace(/\([^)]*?\)/g, "")
      .replace(/\[[^\]]*?\]/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join("\n\n");

    if (withoutNotes.trim().length > 0 && withoutNotes.trim() !== text.trim()) {
      return {
        dialogue: withoutNotes.trim(),
        hasNotes: true,
      };
    }
  }

  return {
    dialogue: text,
    hasNotes: false,
  };
}

function ChatImageCard({ src, alt }: { src?: string; alt?: string }) {
  const [currentSrc, setCurrentSrc] = useState(src || "");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [retries, setRetries] = useState(0);

  if (!src) return null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentSrc || src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      const downloadTarget = currentSrc || src;
      const res = await fetch(downloadTarget);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `omni-ai-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(currentSrc || src, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleImageError = () => {
    // 1. Thử chuyển qua proxy nội bộ nếu URL trực tiếp bị chặn mạng
    if (retries === 0 && currentSrc.startsWith("http") && !currentSrc.includes("/api/images/proxy")) {
      setRetries(1);
      setCurrentSrc(`/api/images/proxy?url=${encodeURIComponent(currentSrc)}`);
      return;
    }

    // 2. Thử thêm 1 lần với cache buster
    if (retries === 1) {
      setRetries(2);
      setTimeout(() => {
        setCurrentSrc((prev) => `${prev}${prev.includes("?") ? "&" : "?"}retry=${Date.now()}`);
      }, 1000);
      return;
    }

    setError(true);
  };

  const handleManualRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(false);
    setLoaded(false);
    setRetries(0);
    setCurrentSrc(`/api/images/proxy?url=${encodeURIComponent(src)}&t=${Date.now()}`);
  };

  return (
    <>
      <div className="my-3 max-w-lg rounded-2xl overflow-hidden border border-slate-200/90 dark:border-indigo-950/80 bg-slate-900/5 dark:bg-[#0c0e17] shadow-lg group relative transition-all">
        {/* Loading Placeholder */}
        {!loaded && !error && (
          <div className="w-full aspect-square max-h-80 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-cyan-950/20 animate-pulse text-center p-4">
            <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-semibold text-slate-300">🎨 Đang tải tác phẩm nghệ thuật AI...</span>
            <span className="text-[10px] text-slate-500 mt-1">Độ phân giải 1024x1024 HD</span>
          </div>
        )}

        {/* Error Fallback with Retry */}
        {error ? (
          <div className="p-4 text-center text-xs text-amber-300 bg-amber-950/20 border border-amber-900/40 rounded-2xl space-y-2.5">
            <p className="font-medium text-slate-300">Hình ảnh đang được tải hoặc xử lý ở chế độ nền.</p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualRetry}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Thử tải lại ảnh</span>
              </button>
              <a
                href={currentSrc || src}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-all inline-flex items-center gap-1"
              >
                <span>Mở ảnh ↗</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="relative cursor-pointer overflow-hidden" onClick={() => setShowModal(true)}>
            <img
              src={currentSrc || src}
              alt={alt || "Hình ảnh AI"}
              onLoad={() => setLoaded(true)}
              onError={handleImageError}
              className={`w-full h-auto object-cover max-h-[460px] rounded-2xl transition-all duration-300 group-hover:scale-[1.01] ${
                loaded ? "opacity-100" : "opacity-0 absolute"
              }`}
            />

            {/* Hover Action Toolbar */}
            {loaded && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
                    ✨ AI IMAGE HD
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-medium backdrop-blur-md border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
                      title="Sao chép liên kết ảnh"
                    >
                      <span>{copied ? "✓" : "📋"}</span>
                      <span>{copied ? "Đã chép" : "Copy Link"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-semibold backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer shadow-md"
                      title="Tải ảnh về máy"
                    >
                      <span>{downloading ? "⏳" : "⬇"}</span>
                      <span>{downloading ? "Đang tải..." : "Tải về"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-white/90 text-xs">
                  <span className="truncate max-w-[80%] font-medium text-[11px]">{alt || "Hình ảnh AI"}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Phóng to ↗
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-screen Lightbox Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top close & actions */}
            <div className="w-full flex items-center justify-between mb-3 px-2 text-white">
              <span className="text-sm font-semibold truncate max-w-md">{alt || "Hình ảnh AI chi tiết"}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>⬇</span>
                  <span>Tải ảnh về</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <img
              src={src}
              alt={alt || "Hình ảnh phóng to"}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}

function MarkdownRenderer({ content, hideActionNotes = false }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showFullNotes, setShowFullNotes] = useState(false);

  const { dialogue, hasNotes } = React.useMemo(() => {
    return extractDialogueOnly(content);
  }, [content]);

  const isHidingNotes = hideActionNotes && hasNotes && !showFullNotes;
  const displayContent = isHidingNotes ? dialogue : content;

  const handleCopyCode = (codeText: string, blockId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(blockId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 text-slate-800 dark:text-slate-100">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-indigo-950/80">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-indigo-600 dark:text-cyan-300 mt-2.5 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed font-normal">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-1.5 text-slate-700 dark:text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-1.5 text-slate-700 dark:text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500/60 pl-3.5 py-1 my-2.5 italic text-slate-600 dark:text-slate-400 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-r-xl">
              {children}
            </blockquote>
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match && !codeString.includes("\n");
            const blockId = `code-${Math.random().toString(36).substring(2, 8)}`;

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#181a28] text-indigo-600 dark:text-cyan-300 font-mono text-xs border border-slate-200 dark:border-indigo-950/70"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-indigo-950/80 bg-[#0d0f18] shadow-lg">
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#141724] border-b border-indigo-950/60 text-xs text-slate-400 font-mono">
                  <span className="uppercase text-[10px] font-bold text-cyan-400">
                    {match ? match[1] : "code"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(codeString, blockId)}
                    className="text-[11px] hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <span>{copiedCode === blockId ? "✓" : "📋"}</span>
                    <span>{copiedCode === blockId ? "Đã sao chép!" : "Sao chép"}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-indigo-950/80">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="p-2.5 bg-slate-100 dark:bg-[#141724] font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-indigo-950/80">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 border-b border-slate-100 dark:border-slate-800/60">
              {children}
            </td>
          ),
          img: ({ src, alt }: any) => <ChatImageCard src={src} alt={alt} />,
        }}
      >
        {displayContent}
      </ReactMarkdown>
      </div>

      {/* Nút gập/mở xem lại miêu tả hành động khi đang ở chế độ ẩn ghi chú */}
      {hasNotes && hideActionNotes && (
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFullNotes((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100/90 dark:bg-indigo-950/40 hover:bg-slate-200 dark:hover:bg-indigo-900/60 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition-all cursor-pointer border border-slate-200/80 dark:border-indigo-900/40 shadow-2xs"
          >
            <span>{showFullNotes ? "🙈 Ẩn lại miêu tả cử chỉ" : "👁️ Xem miêu tả hành động"}</span>
          </button>
          {!showFullNotes && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              (Đã ẩn ghi chú cử chỉ, chỉ giữ lời thoại)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(MarkdownRenderer);
