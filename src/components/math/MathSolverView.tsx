"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import RechargeModal from "@/components/payment/RechargeModal";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import {
  extractImagesFromClipboard,
  extractImagesFromFileList,
  extractImagesFromDrop,
} from "@/lib/imageUtils";

interface MathHistoryItem {
  id: string;
  problem: string;
  solution: string;
  timestamp: string;
  type?: string;
}

interface MathSolverViewProps {
  onOpenLoginModal?: () => void;
}

export default function MathSolverView({ onOpenLoginModal }: MathSolverViewProps) {
  const { user, updateUserCredits } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Tab: 'calculator' (Máy tính khoa học), 'ai_solve' (Giải toán AI)
  const [activeSubTab, setActiveSubTab] = useState<"standard" | "scientific" | "graph">("scientific");

  // Calculator State
  const [calcInput, setCalcInput] = useState<string>("0");
  const [calcPrev, setCalcPrev] = useState<string>("");
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad">("deg");
  const [isMemorySaved, setIsMemorySaved] = useState<number | null>(null);

  // AI Math Solver State
  const [mathPrompt, setMathPrompt] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [mathSubject, setMathSubject] = useState<string>("all");
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [currentSolution, setCurrentSolution] = useState<string>("");
  const [history, setHistory] = useState<MathHistoryItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const solutionEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý dán ảnh từ clipboard (Ctrl + V / Chụp màn hình)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imgs = await extractImagesFromClipboard(e);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
  };

  // Xử lý chọn ảnh từ máy (file input)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgs = await extractImagesFromFileList(e.target.files);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
    if (e.target) e.target.value = "";
  };

  // Xử lý kéo thả ảnh
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const imgs = await extractImagesFromDrop(e);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
  };

  // Tải lịch sử từ localStorage
  useEffect(() => {
    try {
      const uid = user?.id || user?.email || "guest";
      const saved = localStorage.getItem(`biettuot_math_history_${uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {}
  }, [user?.id, user?.email]);

  // Lưu lịch sử
  const saveToHistory = (problem: string, solution: string) => {
    try {
      const uid = user?.id || user?.email || "guest";
      const newItem: MathHistoryItem = {
        id: `math_${Date.now()}`,
        problem,
        solution,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        }),
      };
      const updated = [newItem, ...history.slice(0, 29)];
      setHistory(updated);
      localStorage.setItem(`biettuot_math_history_${uid}`, JSON.stringify(updated));
    } catch {}
  };

  // Safe Calculator Parser & Evaluator
  const evaluateCalc = (expr: string): string => {
    try {
      // Chuẩn hóa biểu thức
      let clean = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/e(?![a-zA-Z])/g, "Math.E");

      // Xử lý góc lượng giác (DEG vs RAD)
      const toRad = angleUnit === "deg" ? "(Math.PI/180)*" : "";

      clean = clean
        .replace(/sin\(([^)]+)\)/g, `Math.sin(${toRad}($1))`)
        .replace(/cos\(([^)]+)\)/g, `Math.cos(${toRad}($1))`)
        .replace(/tan\(([^)]+)\)/g, `Math.tan(${toRad}($1))`)
        .replace(/asin\(([^)]+)\)/g, `(Math.asin($1)${angleUnit === "deg" ? "*(180/Math.PI)" : ""})`)
        .replace(/acos\(([^)]+)\)/g, `(Math.acos($1)${angleUnit === "deg" ? "*(180/Math.PI)" : ""})`)
        .replace(/atan\(([^)]+)\)/g, `(Math.atan($1)${angleUnit === "deg" ? "*(180/Math.PI)" : ""})`)
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/cbrt\(([^)]+)\)/g, "Math.cbrt($1)")
        .replace(/log\(([^)]+)\)/g, "Math.log10($1)")
        .replace(/ln\(([^)]+)\)/g, "Math.log($1)")
        .replace(/\^/g, "**");

      // Đảm bảo an toàn không có ký tự độc hại
      if (!/^[0-9+\-*/().,% MathPIEasincoqrtlg\s]+$/.test(clean)) {
        return "Lỗi";
      }

      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${clean});`)();
      if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
        return "Lỗi cú pháp";
      }
      // Định dạng số đẹp
      const rounded = Math.round(result * 100000000) / 100000000;
      return String(rounded);
    } catch {
      return "Lỗi cú pháp";
    }
  };

  const handleCalcClick = (val: string) => {
    if (val === "C") {
      setCalcInput("0");
      setCalcPrev("");
      return;
    }
    if (val === "DEL") {
      if (calcInput.length <= 1) {
        setCalcInput("0");
      } else {
        setCalcInput(calcInput.slice(0, -1));
      }
      return;
    }
    if (val === "=") {
      if (!calcInput) return;
      const res = evaluateCalc(calcInput);
      setCalcPrev(calcInput + " =");
      setCalcInput(res);
      return;
    }
    if (val === "+/-") {
      if (calcInput.startsWith("-")) {
        setCalcInput(calcInput.substring(1));
      } else if (calcInput !== "0") {
        setCalcInput("-" + calcInput);
      }
      return;
    }
    if (val === "MC") {
      setIsMemorySaved(null);
      return;
    }
    if (val === "MR") {
      if (isMemorySaved !== null) {
        setCalcInput(String(isMemorySaved));
      }
      return;
    }
    if (val === "M+") {
      const num = parseFloat(calcInput);
      if (!isNaN(num)) {
        setIsMemorySaved((prev) => (prev || 0) + num);
      }
      return;
    }
    if (val === "M-") {
      const num = parseFloat(calcInput);
      if (!isNaN(num)) {
        setIsMemorySaved((prev) => (prev || 0) - num);
      }
      return;
    }

    // Các hàm toán học có mở ngoặc
    if (["sin(", "cos(", "tan(", "asin(", "acos(", "atan(", "sqrt(", "log(", "ln("].includes(val)) {
      if (calcInput === "0") {
        setCalcInput(val);
      } else {
        setCalcInput(calcInput + val);
      }
      return;
    }

    if (calcInput === "0" && !["+", "-", "×", "÷", "%", ".", "^"].includes(val)) {
      setCalcInput(val);
    } else {
      setCalcInput(calcInput + val);
    }
  };

  // Chuyển kết quả tính sang ô nhập bài toán AI
  const handleTransferToAI = () => {
    if (calcInput && calcInput !== "0" && calcInput !== "Lỗi cú pháp") {
      setMathPrompt((prev) =>
        prev ? `${prev} ${calcInput}` : `Giải phương trình / phân tích biểu thức sau: ${calcInput}`
      );
    }
  };

  // AI Math Solver Request
  const handleSolveAI = async (overridePrompt?: string) => {
    const query = (overridePrompt || mathPrompt).trim();
    if (!query && attachedImages.length === 0) return;

    if (!user) {
      onOpenLoginModal?.();
      return;
    }

    const isAdmin =
      user.role === "ADMIN" || user.email?.toLowerCase() === "hoanglinhcntti@gmail.com";
    if (!isAdmin && (user.credits || 0) < 1) {
      setShowRechargeModal(true);
      return;
    }

    setIsSolving(true);
    setCurrentSolution("");

    const subjectPrefix =
      mathSubject === "algebra"
        ? "[ĐẠI SỐ & PHƯƠNG TRÌNH]"
        : mathSubject === "geometry"
        ? "[HÌNH HỌC KHÔNG GIAN/PHẲNG]"
        : mathSubject === "calculus"
        ? "[GIẢI TÍCH - ĐẠO HÀM - TÍCH PHÂN]"
        : mathSubject === "probability"
        ? "[XÁC SUẤT THỐNG KÊ]"
        : "[TOÁN HỌC CHUNG]";

    const systemPrompt = `Bạn là Trợ Lý Gia Sư Giải Toán Chuyên Nghiệp của Biết Tuốt AI (Biettuot.io Math Engine).
Nhiệm vụ của bạn là giải bài toán (trong văn bản hoặc trích xuất từ hình ảnh đề bài đính kèm) với độ chính xác tuyệt đối 100%, trình bày cực kỳ chi tiết, dễ hiểu từng bước:
1. Đọc và chép lại đề bài từ hình ảnh hoặc văn bản, phân tích dữ kiện và tìm điều kiện xác định.
2. Trình bày lời giải từng bước rõ ràng (Step-by-step). Sử dụng công thức toán chuẩn LaTeX ($...$ cho inline và $$...$$ cho dòng riêng).
3. Đưa ra Kết quả cuối cùng (Được đóng khung hoặc in đậm).
4. Nhận xét, lưu ý các lỗi sai thường gặp của học sinh hoặc các cách giải nhanh/mẹo trắc nghiệm (nếu có).

Chủ đề: ${subjectPrefix}
Đề bài yêu cầu: ${query || "Hãy đọc đề bài toán trong bức ảnh đính kèm và giải chi tiết từng bước."}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: "math-solver",
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.displayName || user?.username,
          messages: [
            {
              role: "user",
              content: systemPrompt,
              images: attachedImages,
            },
          ],
          model: "gemini-2.5-flash",
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể kết nối đến máy chủ giải toán.");
      }

      const data = await res.json();
      const answer =
        data.text ||
        data.choices?.[0]?.message?.content ||
        data.response ||
        "Đã xảy ra lỗi khi tạo lời giải.";

      setCurrentSolution(answer);
      saveToHistory(query, answer);

      // Cập nhật credits
      if (!isAdmin) {
        updateUserCredits(Math.max(0, (user.credits || 10) - 1));
      }
    } catch (err: any) {
      setCurrentSolution(
        `⚠️ Đã xảy ra lỗi: ${err.message || "Vui lòng thử lại sau ít phút."}`
      );
    } finally {
      setIsSolving(false);
      setTimeout(() => {
        solutionEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-violet-950/40 border border-cyan-500/20 dark:border-cyan-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/25">
              📐
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Biết Tuốt Math Lab
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  AI & Scientific Calc
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Bộ máy tính khoa học cao cấp kết hợp Trợ lý AI giải toán chi tiết từng bước với LaTeX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs font-semibold text-slate-300 flex items-center gap-2">
              <span>🪙</span>
              <span>
                {user?.role === "ADMIN" ? "∞ Vô hạn" : `${user?.credits ?? 10} Credits`}
              </span>
            </div>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              +Nạp
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: MÁY TÍNH KHOA HỌC XỊN XÒ (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-[#0c0e18]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-xl flex flex-col">
          {/* Top Mode Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveSubTab("scientific")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeSubTab === "scientific"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Khoa học (Fx)
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("standard")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeSubTab === "standard"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Cơ bản
              </button>
            </div>

            {/* DEG / RAD Selector */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                onClick={() => setAngleUnit(angleUnit === "deg" ? "rad" : "deg")}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer uppercase transition-colors"
                title="Chuyển đổi Độ (DEG) / Radian (RAD)"
              >
                {angleUnit}
              </button>
              {isMemorySaved !== null && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                  M
                </span>
              )}
            </div>
          </div>

          {/* Calculator Screen / Display */}
          <div className="w-full bg-slate-900 dark:bg-[#060812] border border-cyan-500/30 rounded-2xl p-4 mb-4 text-right flex flex-col justify-end min-h-[105px] select-text shadow-inner">
            <div className="text-xs text-slate-400 font-mono tracking-wider min-h-[18px] truncate">
              {calcPrev}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 dark:text-cyan-400 tracking-tight break-all mt-1">
              {calcInput || "0"}
            </div>
          </div>

          {/* Quick Action: Gửi biểu thức sang AI */}
          <div className="flex items-center gap-2 mb-3.5">
            <button
              onClick={handleTransferToAI}
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-500 dark:text-cyan-400 border border-cyan-500/40 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shadow-sm"
              title="Chuyển số này sang ô AI để phân tích / giải phương trình"
            >
              <span>🪄</span>
              <span>Đưa sang AI giải chi tiết</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(calcInput);
                alert("Đã sao chép kết quả!");
              }}
              className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700/80"
              title="Sao chép kết quả"
            >
              📋 Copy
            </button>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {/* Row 1: Memory & Clear */}
            <button
              onClick={() => handleCalcClick("MC")}
              className="p-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 cursor-pointer shadow-xs transition-colors"
            >
              MC
            </button>
            <button
              onClick={() => handleCalcClick("MR")}
              className="p-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 cursor-pointer shadow-xs transition-colors"
            >
              MR
            </button>
            <button
              onClick={() => handleCalcClick("M+")}
              className="p-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 cursor-pointer shadow-xs transition-colors"
            >
              M+
            </button>
            <button
              onClick={() => handleCalcClick("DEL")}
              className="p-2.5 rounded-xl text-xs font-black bg-amber-500/20 text-amber-500 dark:text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer shadow-xs transition-colors"
            >
              ⌫
            </button>
            <button
              onClick={() => handleCalcClick("C")}
              className="p-2.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 cursor-pointer shadow-xs transition-colors"
            >
              AC
            </button>

            {/* Scientific Functions (chỉ hiện khi mode scientific) */}
            {activeSubTab === "scientific" && (
              <>
                <button
                  onClick={() => handleCalcClick("sin(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  sin
                </button>
                <button
                  onClick={() => handleCalcClick("cos(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  cos
                </button>
                <button
                  onClick={() => handleCalcClick("tan(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  tan
                </button>
                <button
                  onClick={() => handleCalcClick("π")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  π
                </button>
                <button
                  onClick={() => handleCalcClick("^")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  xʸ
                </button>

                <button
                  onClick={() => handleCalcClick("asin(")}
                  className="p-2 sm:p-2.5 rounded-xl text-[11px] font-mono font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  sin⁻¹
                </button>
                <button
                  onClick={() => handleCalcClick("acos(")}
                  className="p-2 sm:p-2.5 rounded-xl text-[11px] font-mono font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  cos⁻¹
                </button>
                <button
                  onClick={() => handleCalcClick("atan(")}
                  className="p-2 sm:p-2.5 rounded-xl text-[11px] font-mono font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  tan⁻¹
                </button>
                <button
                  onClick={() => handleCalcClick("sqrt(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  √x
                </button>
                <button
                  onClick={() => handleCalcClick("log(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  log
                </button>

                <button
                  onClick={() => handleCalcClick("(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 cursor-pointer shadow-xs transition-colors"
                >
                  (
                </button>
                <button
                  onClick={() => handleCalcClick(")")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 cursor-pointer shadow-xs transition-colors"
                >
                  )
                </button>
                <button
                  onClick={() => handleCalcClick("ln(")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  ln
                </button>
                <button
                  onClick={() => handleCalcClick("e")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  e
                </button>
                <button
                  onClick={() => handleCalcClick("%")}
                  className="p-2 sm:p-2.5 rounded-xl text-xs font-mono font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer shadow-xs transition-colors"
                >
                  %
                </button>
              </>
            )}

            {/* Standard Number Keypad */}
            {["7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleCalcClick(num)}
                className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-slate-100 dark:bg-[#151828] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2238] border border-slate-300 dark:border-slate-700/80 shadow-xs transition-colors cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleCalcClick("÷")}
              className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 shadow-xs cursor-pointer transition-colors"
            >
              ÷
            </button>
            <button
              onClick={() => handleCalcClick("+/-")}
              className="p-3 sm:p-3.5 rounded-2xl text-sm font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 cursor-pointer shadow-xs transition-colors"
            >
              ±
            </button>

            {["4", "5", "6"].map((num) => (
              <button
                key={num}
                onClick={() => handleCalcClick(num)}
                className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-slate-100 dark:bg-[#151828] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2238] border border-slate-300 dark:border-slate-700/80 shadow-xs transition-colors cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleCalcClick("×")}
              className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 shadow-xs cursor-pointer transition-colors"
            >
              ×
            </button>
            <button
              onClick={() => handleCalcClick(".")}
              className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-slate-100 dark:bg-[#151828] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2238] border border-slate-300 dark:border-slate-700/80 cursor-pointer shadow-xs transition-colors"
            >
              .
            </button>

            {["1", "2", "3"].map((num) => (
              <button
                key={num}
                onClick={() => handleCalcClick(num)}
                className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-slate-100 dark:bg-[#151828] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2238] border border-slate-300 dark:border-slate-700/80 shadow-xs transition-colors cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleCalcClick("-")}
              className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 shadow-xs cursor-pointer transition-colors"
            >
              −
            </button>
            <button
              onClick={() => handleCalcClick("+")}
              className="p-3 sm:p-3.5 rounded-2xl text-base font-black bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 shadow-xs cursor-pointer transition-colors"
            >
              +
            </button>

            {/* Zero & Equal */}
            <button
              onClick={() => handleCalcClick("0")}
              className="col-span-2 p-3 sm:p-3.5 rounded-2xl text-base font-black bg-slate-100 dark:bg-[#151828] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2238] border border-slate-300 dark:border-slate-700/80 shadow-xs transition-colors cursor-pointer"
            >
              0
            </button>
            <button
              onClick={() => handleCalcClick("00")}
              className="p-3 sm:p-3.5 rounded-2xl text-sm font-black bg-slate-100 dark:bg-[#151828] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2238] border border-slate-300 dark:border-slate-700/80 shadow-xs transition-colors cursor-pointer"
            >
              00
            </button>
            <button
              onClick={() => handleCalcClick("=")}
              className="col-span-2 p-3 sm:p-3.5 rounded-2xl text-lg font-black bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              =
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: GIA SƯ AI GIẢI TOÁN TỪNG BƯỚC (7 COLS) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* AI Solver Input Box */}
          <div className="bg-white/95 dark:bg-[#0c0e18]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Nhập bài toán cần AI giải chi tiết
              </span>

              {/* Subject Tag Selector */}
              <select
                value={mathSubject}
                onChange={(e) => setMathSubject(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="all">⚡ Tất cả thể loại</option>
                <option value="algebra">📐 Đại số & Phương trình</option>
                <option value="geometry">📏 Hình học không gian</option>
                <option value="calculus">∫ Đạo hàm & Tích phân</option>
                <option value="probability">🎲 Xác suất thống kê</option>
              </select>
            </div>

            {/* Textarea & Image Paste/Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#07080f] p-3 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all"
            >
              {/* Attached Images Previews */}
              {attachedImages.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mb-3 p-1">
                  {attachedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group w-20 h-20 rounded-xl overflow-hidden border border-cyan-500/40 bg-black/40 shadow-md"
                    >
                      <img
                        src={img}
                        alt="Đề bài toán đính kèm"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-500/90 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                        title="Xóa ảnh"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={mathPrompt}
                onChange={(e) => setMathPrompt(e.target.value)}
                onPaste={handlePaste}
                placeholder="Nhập đề bài hoặc CHỤP ĐỀ TOÁN RỒI PASTE (Ctrl + V) trực tiếp vào đây..."
                rows={3}
                className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden transition-all resize-none"
              />

              {/* Bottom toolbar inside input area: Upload image & tips */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                    title="Tải ảnh đề bài từ máy tính/điện thoại"
                  >
                    <span>📷</span>
                    <span>Tải ảnh / Chụp đề</span>
                  </button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    (Hoặc bấm <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl+V</kbd> để dán ảnh chụp)
                  </span>
                </div>

                {attachedImages.length > 0 && (
                  <span className="text-[11px] text-emerald-500 font-bold">
                    ✓ Đã đính kèm {attachedImages.length} ảnh
                  </span>
                )}
              </div>
            </div>

            {/* Quick Templates / Gợi ý mẫu */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Mẫu nhanh:</span>
              {[
                "2x² - 5x + 3 = 0",
                "∫(x * e^x) dx",
                "lim(x->0) sin(x)/x",
                "Hệ: x+y=5; 2x-y=1",
              ].map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setMathPrompt(tpl)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  {tpl}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                ⚡ Phí giải: <strong className="text-amber-400">1 Credit / lần</strong> (Miễn phí cho Admin)
              </span>

              <button
                onClick={() => handleSolveAI()}
                disabled={isSolving || (!mathPrompt.trim() && attachedImages.length === 0)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isSolving || (!mathPrompt.trim() && attachedImages.length === 0)
                    ? "bg-slate-400 dark:bg-slate-800 opacity-60 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 hover:opacity-95 shadow-cyan-500/25 active:scale-95"
                }`}
              >
                {isSolving ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>AI Đang giải bài...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Giải Từng Bước Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Solution Result Container */}
          {currentSolution && (
            <div className="bg-white/95 dark:bg-[#0c0e18]/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Lời Giải Chi Tiết Từ Biết Tuốt AI
                  </h3>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentSolution);
                    alert("Đã sao chép lời giải!");
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  📋 Sao chép
                </button>
              </div>

              {/* Markdown + LaTeX render */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                <MarkdownRenderer content={currentSolution} />
              </div>

              <div ref={solutionEndRef} />
            </div>
          )}

          {/* History List */}
          {history.length > 0 && (
            <div className="bg-white/95 dark:bg-[#0c0e18]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>🕒</span>
                  <span>Lịch sử giải toán gần đây</span>
                </h4>
                <button
                  onClick={() => {
                    const uid = user?.id || user?.email || "guest";
                    localStorage.removeItem(`biettuot_math_history_${uid}`);
                    setHistory([]);
                  }}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setMathPrompt(item.problem);
                      setCurrentSolution(item.solution);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-500 transition-colors">
                        {item.problem}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.timestamp}
                      </div>
                    </div>
                    <span className="text-xs text-cyan-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Xem lại →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />
    </div>
  );
}
