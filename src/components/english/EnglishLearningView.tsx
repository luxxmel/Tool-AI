"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import RechargeModal from "@/components/payment/RechargeModal";
import { ENGLISH_ROADMAP, LessonUnit, QuizQuestion } from "@/data/englishRoadmapData";

interface EnglishLearningViewProps {
  onOpenLoginModal?: () => void;
}

export default function EnglishLearningView({ onOpenLoginModal }: EnglishLearningViewProps) {
  const { user } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Lưu tiến độ học tập (danh sách ID các bài học đã hoàn thành)
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [xpPoints, setXpPoints] = useState<number>(120);

  // Trạng thái bài học đang mở
  const [activeLesson, setActiveLesson] = useState<LessonUnit | null>(null);
  const [activeStep, setActiveStep] = useState<"overview" | "vocab" | "quiz" | "ai_chat" | "congrats">("overview");

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // AI Conversational Practice State
  const [aiMessage, setAiMessage] = useState<string>("");
  const [chatLog, setChatLog] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);

  // Tải tiến trình từ localStorage
  useEffect(() => {
    try {
      const uid = user?.id || user?.email || "guest";
      const saved = localStorage.getItem(`biettuot_english_progress_${uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completed) setCompletedLessons(parsed.completed);
        if (parsed.xp) setXpPoints(parsed.xp);
        if (parsed.streak) setStreakDays(parsed.streak);
      }
    } catch {}
  }, [user?.id, user?.email]);

  // Lưu tiến trình
  const saveProgress = (newCompleted: string[], addedXp: number = 0) => {
    try {
      const uid = user?.id || user?.email || "guest";
      const nextXp = xpPoints + addedXp;
      setCompletedLessons(newCompleted);
      setXpPoints(nextXp);
      localStorage.setItem(
        `biettuot_english_progress_${uid}`,
        JSON.stringify({
          completed: newCompleted,
          xp: nextXp,
          streak: streakDays,
        })
      );
    } catch {}
  };

  // Mở một bài học
  const handleOpenLesson = (lesson: LessonUnit) => {
    setActiveLesson(lesson);
    setActiveStep("overview");
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setChatLog([
      {
        role: "ai",
        text: `Hi there! I am your AI Speaking Partner for "${lesson.title}". What would you like to practice today? You can say hello or ask me anything!`,
      },
    ]);
  };

  // Phát âm từ vựng / câu tiếng Anh bằng SpeechSynthesis
  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Kiểm tra đáp án Quiz
  const handleCheckAnswer = () => {
    if (!activeLesson || selectedOption === null) return;
    const currentQ = activeLesson.questions[currentQuestionIndex];
    const isRight = selectedOption === currentQ.correctAnswer;
    setIsCorrect(isRight);
    setIsAnswerChecked(true);
    if (isRight) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  // Chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = () => {
    if (!activeLesson) return;
    if (currentQuestionIndex + 1 < activeLesson.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // Hoàn thành bài học
      if (!completedLessons.includes(activeLesson.id)) {
        const nextList = [...completedLessons, activeLesson.id];
        saveProgress(nextList, activeLesson.points);
      }
      setActiveStep("congrats");
    }
  };

  // Gửi tin nhắn thực hành giao tiếp với AI Tutor
  const handleSendAiChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiMessage.trim() || isAiReplying || !activeLesson) return;

    const userText = aiMessage.trim();
    setAiMessage("");
    const newLogs = [...chatLog, { role: "user" as const, text: userText }];
    setChatLog(newLogs);
    setIsAiReplying(true);

    try {
      const promptContext = `Bạn là Gia sư Tiếng Anh bản ngữ thân thiện, nhiệt tình kiểu Duolingo.
Chủ đề bài học hiện tại: "${activeLesson.title}" (${activeLesson.description}).
Nhiệm vụ của bạn:
1. Trả lời bằng tiếng Anh tự nhiên, thân thiện (kèm dịch nghĩa tiếng Việt ngắn bên dưới nếu câu phức tạp).
2. Nếu người học viết sai ngữ pháp hoặc phát âm/dùng từ, hãy nhẹ nhàng sửa lỗi và khen ngợi sự nỗ lực của họ.
3. Đặt lại một câu hỏi ngắn để khuyến khích học viên tiếp tục phản xạ giao tiếp.

Lịch sử trò chuyện:
${newLogs.map((l) => `${l.role === "ai" ? "Tutor" : "Student"}: ${l.text}`).join("\n")}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: "english-tutor",
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.name,
          messages: [{ role: "user", content: promptContext }],
          model: "gemini-2.5-flash",
          stream: false,
        }),
      });

      if (!res.ok) throw new Error("Không thể kết nối gia sư AI.");

      const data = await res.json();
      const reply = data.text || data.response || "Great effort! Keep practicing!";
      setChatLog((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Well done! You're making steady progress. Let's practice another sentence!",
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Top Banner & Gamification Bar */}
      <div className="mb-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-indigo-950/40 border border-emerald-500/25 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/25 animate-bounce">
              🦉
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Biết Tuốt English Hub
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Duolingo Style
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Lộ trình học tiếng Anh bài bản từ A1 đến IELTS với gia sư AI phản xạ 1:1
              </p>
            </div>
          </div>

          {/* Gamification Stats: Streak, XP, Level */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 font-extrabold text-xs shadow-xs">
              <span>🔥</span>
              <span>{streakDays} ngày chuỗi</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-extrabold text-xs shadow-xs">
              <span>⚡</span>
              <span>{xpPoints} XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs shadow-xs">
              <span>✓</span>
              <span>{completedLessons.length} bài xong</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Road Map vs Modal / Lesson View */}
      {!activeLesson ? (
        /* ================== CHẾ ĐỘ LỘ TRÌNH (ROADMAP TREE) ================== */
        <div className="space-y-10 py-4">
          {ENGLISH_ROADMAP.map((stage, stageIdx) => {
            const stageCompletedCount = stage.lessons.filter((l) =>
              completedLessons.includes(l.id)
            ).length;
            const progressPercent = Math.round(
              (stageCompletedCount / stage.lessons.length) * 100
            );

            return (
              <div
                key={stage.id}
                className="bg-white/95 dark:bg-[#0c0e18]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-xl relative overflow-hidden"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {stage.level}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5">
                      {stage.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full sm:w-44 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>Tiến độ</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lesson Nodes Path (Kiểu Duolingo tròn ziczac hoặc dạng card nối) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                  {stage.lessons.map((unit, unitIdx) => {
                    const isDone = completedLessons.includes(unit.id);
                    // Mở khóa bài đầu tiên hoặc khi bài trước đó đã xong
                    const isUnlocked =
                      unitIdx === 0 ||
                      completedLessons.includes(stage.lessons[unitIdx - 1]?.id) ||
                      stageIdx === 0;

                    return (
                      <div
                        key={unit.id}
                        onClick={() => isUnlocked && handleOpenLesson(unit)}
                        className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                          isDone
                            ? "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/50 shadow-emerald-500/10 shadow-lg hover:border-emerald-500"
                            : isUnlocked
                            ? "bg-white dark:bg-[#121526] hover:bg-slate-50 dark:hover:bg-[#181d33] border-slate-300 dark:border-slate-700/80 hover:border-emerald-500 hover:shadow-xl cursor-pointer hover:-translate-y-1 shadow-sm"
                            : "bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/40 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700/90 border border-slate-300 dark:border-slate-600/60 flex items-center justify-center text-2xl shadow-sm">
                            {unit.icon}
                          </div>
                          <div>
                            {isDone ? (
                              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40">
                                ✓
                              </span>
                            ) : isUnlocked ? (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs">
                                +{unit.points} XP
                              </span>
                            ) : (
                              <span className="text-base text-slate-400">🔒</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-1">
                            {unit.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                            {unit.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>⏱ {unit.duration}</span>
                          <span className={isDone ? "text-emerald-500 font-black" : isUnlocked ? "text-indigo-500 dark:text-indigo-400 font-black" : "text-slate-400"}>
                            {isDone ? "Học lại →" : isUnlocked ? "Bắt đầu →" : "Đã khóa"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================== GIAO DIỆN HỌC BÀI CHI TIẾT (LESSON INTERFACE) ================== */
        <div className="bg-white/95 dark:bg-[#0c0e18]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Top Bar inside Lesson */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <button
              onClick={() => setActiveLesson(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>←</span>
              <span>Quay lại lộ trình</span>
            </button>

            {/* Navigation Tabs in Lesson */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveStep("overview")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeStep === "overview"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveStep("vocab")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeStep === "vocab"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Từ vựng ({activeLesson.vocabulary.length})
              </button>
              <button
                onClick={() => setActiveStep("quiz")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeStep === "quiz"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Trắc nghiệm ({activeLesson.questions.length})
              </button>
              <button
                onClick={() => setActiveStep("ai_chat")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeStep === "ai_chat"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Gia sư AI 🤖
              </button>
            </div>
          </div>

          {/* Step 1: Overview */}
          {activeStep === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-4xl shadow-md">
                  {activeLesson.icon}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {activeLesson.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeLesson.description}
                  </p>
                </div>
              </div>

              {/* Grammar Focus Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-1.5 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Ngữ pháp trọng tâm</span>
                </h4>
                <p className="text-sm font-semibold">{activeLesson.grammarFocus}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setActiveStep("vocab")}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Học từ vựng ngay</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Vocabulary Flashcards */}
          {activeStep === "vocab" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Từ vựng quan trọng trong bài
                </h3>
                <span className="text-xs text-slate-400">
                  Bấm vào biểu tượng loa để nghe phát âm bản ngữ chuẩn
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeLesson.vocabulary.map((vocab, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121422] border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 group hover:border-emerald-500/50 transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{vocab.word}</span>
                          <button
                            type="button"
                            onClick={() => handleSpeak(vocab.word)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-500 transition-colors cursor-pointer"
                            title="Nghe phát âm"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {vocab.phonetic}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {vocab.meaning}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c0e18] border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 italic flex items-center justify-between">
                      <span>"{vocab.example}"</span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(vocab.example)}
                        className="text-slate-400 hover:text-emerald-400 cursor-pointer p-1"
                        title="Nghe cả câu ví dụ"
                      >
                        🔊
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveStep("overview")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  ← Trở về
                </button>
                <button
                  onClick={() => setActiveStep("quiz")}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Luyện trắc nghiệm</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Quiz Questions (Duolingo Style) */}
          {activeStep === "quiz" && (
            <div className="max-w-2xl mx-auto space-y-6 py-2">
              {/* Question Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-400">
                  {currentQuestionIndex + 1}/{activeLesson.questions.length}
                </span>
                <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / activeLesson.questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Prompt */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#121422] border border-slate-200 dark:border-slate-800 text-center shadow-md">
                <span className="text-[11px] uppercase font-black tracking-widest text-emerald-500 mb-2 block">
                  CÂU HỎI {currentQuestionIndex + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {activeLesson.questions[currentQuestionIndex].prompt}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeLesson.questions[currentQuestionIndex].options?.map((opt, oIdx) => {
                  const isSelected = selectedOption === opt;
                  const isCurrentCorrect =
                    opt === activeLesson.questions[currentQuestionIndex].correctAnswer;

                  let optClass =
                    "bg-white dark:bg-[#121422] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50";
                  if (isSelected) {
                    optClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20";
                  }
                  if (isAnswerChecked) {
                    if (isCurrentCorrect) {
                      optClass = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30";
                    } else if (isSelected && !isCurrentCorrect) {
                      optClass = "bg-rose-500 text-white border-rose-500";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between cursor-pointer active:scale-98 ${optClass}`}
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(opt);
                        }}
                        className="text-xs p-1 opacity-70 hover:opacity-100"
                        title="Nghe phát âm"
                      >
                        🔊
                      </button>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Action Bar */}
              {isAnswerChecked && (
                <div
                  className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    <span>{isCorrect ? "🎉 Chính xác tuyệt vời!" : "❌ Chưa chính xác rồi!"}</span>
                  </div>
                  <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                    {activeLesson.questions[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                {!isAnswerChecked ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!selectedOption}
                    className={`w-full py-3 rounded-2xl font-black text-sm text-white transition-all shadow-lg cursor-pointer ${
                      selectedOption
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 shadow-emerald-500/25 active:scale-98"
                        : "bg-slate-300 dark:bg-slate-800 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>
                      {currentQuestionIndex + 1 < activeLesson.questions.length
                        ? "Câu tiếp theo"
                        : "Xem kết quả bài học"}
                    </span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: AI Conversational Practice (Tutor 1:1) */}
          {activeStep === "ai_chat" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-semibold flex items-center justify-between">
                <span>🤖 Gia sư AI Biết Tuốt luôn sẵn sàng luyện hội thoại theo bài học này.</span>
                <span className="text-[10px] text-slate-400">Không tốn Credits</span>
              </div>

              {/* Chat Container */}
              <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0b12] border border-slate-200 dark:border-slate-800 space-y-3">
                {chatLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      log.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {log.role === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed relative group ${
                        log.role === "user"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs"
                          : "bg-white dark:bg-[#161826] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                      }`}
                    >
                      <div>{log.text}</div>
                      {log.role === "ai" && (
                        <button
                          type="button"
                          onClick={() => handleSpeak(log.text)}
                          className="mt-1 text-[11px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          🔊 Nghe đọc
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isAiReplying && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <span className="animate-spin">⏳</span>
                    <span>Gia sư AI đang soạn phản hồi...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAiChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Gõ câu trả lời tiếng Anh của bạn tại đây..."
                  className="flex-1 bg-slate-50 dark:bg-[#07080f] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!aiMessage.trim() || isAiReplying}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}

          {/* Step 5: Congrats Screen */}
          {activeStep === "congrats" && (
            <div className="py-8 text-center max-w-md mx-auto space-y-5 animate-in zoom-in-95">
              <div className="text-6xl animate-bounce">🏆</div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Chúc Mừng Bạn Đã Hoàn Thành!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Bạn đã vượt qua bài học <strong>"{activeLesson.title}"</strong> và nhận được{" "}
                <strong className="text-emerald-500">+{activeLesson.points} XP</strong>!
              </p>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                Đúng {correctCount}/{activeLesson.questions.length} câu trắc nghiệm
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => setActiveLesson(null)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Tiếp tục lộ trình học →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />
    </div>
  );
}
