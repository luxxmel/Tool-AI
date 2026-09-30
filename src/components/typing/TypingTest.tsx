"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getRandomWords, LanguageMode } from "@/data/words";
import TypingStats from "./TypingStats";
import TypingResultModal from "./TypingResultModal";

interface TypingTestProps {
  isAuthenticated: boolean;
  onRequireLogin?: () => void;
  username?: string;
}

export default function TypingTest({
  isAuthenticated,
  onRequireLogin,
  username = "guest",
}: TypingTestProps) {
  // Settings
  const [language, setLanguage] = useState<LanguageMode>("vietnamese");
  const [duration, setDuration] = useState<number>(30); // 15, 30, 60
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Words and Typing State
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [wordHistory, setWordHistory] = useState<
    { typed: string; target: string; isCorrect: boolean }[]
  >([]);

  // Timer & Test Status
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Real-time Stats
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load best score from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && username) {
      const savedBest = localStorage.getItem(`best_wpm_${username}`);
      if (savedBest) {
        setBestWpm(parseInt(savedBest, 10) || 0);
      }
    }
  }, [username]);

  // Subtle mechanical keyboard click sound via Web Audio API
  const playKeySound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(160 + Math.random() * 80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        40,
        ctx.currentTime + 0.03
      );

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Ignore audio errors if audio context is blocked
    }
  }, [soundEnabled]);

  // Initialize or reset words
  const initWords = useCallback(() => {
    const newWords = getRandomWords(language, 80);
    setWords(newWords);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setWordHistory([]);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setStartTime(null);
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setErrors(0);
    setIsNewBest(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [language, duration]);

  useEffect(() => {
    initWords();
  }, [initWords]);

  // Focus input when clicking words container
  const handleContainerClick = () => {
    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }
    inputRef.current?.focus();
  };

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // Calculate stats
  const calculateCurrentStats = useCallback(
    (
      history = wordHistory,
      currInput = currentInput,
      currIndex = currentWordIndex,
      elapsedSec?: number
    ) => {
      let correctCharCount = 0;
      let totalTypedCharCount = 0;
      let totalErrors = 0;

      // History words
      history.forEach(({ typed, target }) => {
        totalTypedCharCount += typed.length + 1; // +1 for space
        for (let i = 0; i < typed.length; i++) {
          if (i < target.length && typed[i] === target[i]) {
            correctCharCount++;
          } else {
            totalErrors++;
          }
        }
        if (typed.length < target.length) {
          totalErrors += target.length - typed.length;
        }
      });

      // Current word
      const targetWord = words[currIndex] || "";
      totalTypedCharCount += currInput.length;
      for (let i = 0; i < currInput.length; i++) {
        if (i < targetWord.length && currInput[i] === targetWord[i]) {
          correctCharCount++;
        } else {
          totalErrors++;
        }
      }

      const timeUsed =
        elapsedSec !== undefined
          ? elapsedSec
          : Math.max(1, duration - timeLeft);
      const minutes = timeUsed / 60;

      const currentWpm = Math.max(
        0,
        Math.round(correctCharCount / 5 / minutes)
      );
      const currentCpm = Math.max(
        0,
        Math.round(correctCharCount / minutes)
      );
      const currentAcc =
        totalTypedCharCount > 0
          ? Math.max(
              0,
              Math.min(
                100,
                Math.round((correctCharCount / totalTypedCharCount) * 100)
              )
            )
          : 100;

      return {
        wpm: currentWpm,
        cpm: currentCpm,
        accuracy: currentAcc,
        errors: totalErrors,
        correctChars: correctCharCount,
        totalChars: totalTypedCharCount,
        timeUsed,
      };
    },
    [wordHistory, currentInput, currentWordIndex, words, duration, timeLeft]
  );

  // Real-time stats update while typing
  useEffect(() => {
    if (isActive) {
      const stats = calculateCurrentStats();
      setWpm(stats.wpm);
      setCpm(stats.cpm);
      setAccuracy(stats.accuracy);
      setErrors(stats.errors);
    }
  }, [isActive, wordHistory, currentInput, calculateCurrentStats]);

  // Finish test
  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);

    const stats = calculateCurrentStats(
      wordHistory,
      currentInput,
      currentWordIndex,
      duration
    );
    setWpm(stats.wpm);
    setCpm(stats.cpm);
    setAccuracy(stats.accuracy);
    setErrors(stats.errors);

    // Save best WPM
    if (stats.wpm > bestWpm) {
      setBestWpm(stats.wpm);
      setIsNewBest(true);
      if (typeof window !== "undefined" && username) {
        localStorage.setItem(`best_wpm_${username}`, stats.wpm.toString());
      }
    }
  };

  // Input change handler (IME friendly)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }

    const value = e.target.value;

    // Start timer on first keystroke
    if (!isActive && !isFinished) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    playKeySound();

    // Check if user pressed space to complete word
    if (value.endsWith(" ")) {
      const trimmed = value.trim();
      const targetWord = words[currentWordIndex] || "";
      const isCorrect = trimmed === targetWord;

      const newHistory = [
        ...wordHistory,
        { typed: trimmed, target: targetWord, isCorrect },
      ];
      setWordHistory(newHistory);

      // If finished all words, append more
      if (currentWordIndex + 1 >= words.length) {
        setWords((prev) => [...prev, ...getRandomWords(language, 40)]);
      }

      setCurrentWordIndex((prev) => prev + 1);
      setCurrentInput("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } else {
      setCurrentInput(value);
    }
  };

  // Restart handler
  const handleRestart = () => {
    initWords();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Toolbar: Language, Time, Sound */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8 px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        {/* Language Selection */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setLanguage("vietnamese")}
            disabled={isActive}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              language === "vietnamese"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button
            onClick={() => setLanguage("english")}
            disabled={isActive}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              language === "english"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLanguage("code")}
            disabled={isActive}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              language === "code"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            💻 Code
          </button>
        </div>

        {/* Duration Selection */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          {[15, 30, 60].map((sec) => (
            <button
              key={sec}
              onClick={() => setDuration(sec)}
              disabled={isActive}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                duration === sec
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Audio Toggle & Restart */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              soundEnabled
                ? "bg-slate-800/80 border-slate-700 text-amber-400"
                : "bg-slate-950/40 border-slate-800 text-slate-500"
            }`}
            title="Bật/Tắt âm bàn phím"
          >
            {soundEnabled ? "🔊 Âm phím" : "🔇 Tắt âm"}
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Làm mới bài test"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Realtime Stats Bar */}
      <TypingStats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        timeLeft={timeLeft}
        errors={errors}
        isActive={isActive}
      />

      {/* Typing Container with Lock Guard */}
      <div className="w-full relative">
        {/* Floating Lock indicator when not authenticated */}
        {!isAuthenticated && (
          <div
            onClick={onRequireLogin}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/30 hover:bg-slate-950/40 rounded-3xl border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="px-5 py-2.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xl group-hover:scale-105 transition-transform backdrop-blur-md">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Bấm vào đây hoặc đăng nhập để bắt đầu gõ</span>
            </div>
          </div>
        )}

        {/* Typing Box */}
        <div
          ref={wordsContainerRef}
          onClick={handleContainerClick}
          className={`w-full min-h-[180px] p-6 sm:p-8 rounded-3xl bg-slate-900/80 border ${
            isActive
              ? "border-amber-500/50 shadow-lg shadow-amber-500/5"
              : "border-slate-800"
          } backdrop-blur-xl cursor-text relative transition-all duration-300 select-none overflow-hidden`}
        >
          {/* Hidden Input to capture keystrokes */}
          <input
            ref={inputRef}
            type="text"
            className="absolute opacity-0 pointer-events-none top-0 left-0 w-0 h-0"
            onChange={handleInputChange}
            disabled={!isAuthenticated || isFinished}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {/* Words Stream */}
          <div className="flex flex-wrap gap-x-3 gap-y-3 font-mono text-xl sm:text-2xl leading-relaxed">
            {words.map((word, wIdx) => {
              const isPast = wIdx < currentWordIndex;
              const isCurrent = wIdx === currentWordIndex;
              const historyItem = wordHistory[wIdx];

              return (
                <span
                  key={wIdx}
                  className={`relative rounded-md px-1 transition-colors ${
                    isPast
                      ? historyItem?.isCorrect
                        ? "text-slate-300"
                        : "text-red-400/90 underline decoration-red-500/50"
                      : isCurrent
                      ? "bg-slate-800/60 text-white"
                      : "text-slate-600"
                  }`}
                >
                  {word.split("").map((char, cIdx) => {
                    let charColor = "";
                    let isCaret = false;

                    if (isCurrent) {
                      if (cIdx < currentInput.length) {
                        charColor =
                          currentInput[cIdx] === char
                            ? "text-emerald-400"
                            : "text-red-400 bg-red-500/20 rounded-sm";
                      }
                      if (cIdx === currentInput.length) {
                        isCaret = true;
                      }
                    }

                    return (
                      <span
                        key={cIdx}
                        className={`relative inline-block ${charColor}`}
                      >
                        {isCaret && (
                          <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-amber-400 animate-pulse" />
                        )}
                        {char}
                      </span>
                    );
                  })}

                  {/* Caret at end of current word */}
                  {isCurrent && currentInput.length >= word.length && (
                    <span className="relative inline-block">
                      <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-amber-400 animate-pulse" />
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Prompt to start */}
          {!isActive && isAuthenticated && !isFinished && (
            <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none animate-bounce">
              <span className="px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-amber-400/90 shadow-md">
                ⌨️ Nhấn vào đây và bắt đầu gõ để tính giờ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      <TypingResultModal
        isOpen={isFinished}
        wpm={wpm}
        cpm={cpm}
        accuracy={accuracy}
        errors={errors}
        totalChars={
          calculateCurrentStats(
            wordHistory,
            currentInput,
            currentWordIndex,
            duration
          ).totalChars
        }
        correctChars={
          calculateCurrentStats(
            wordHistory,
            currentInput,
            currentWordIndex,
            duration
          ).correctChars
        }
        timeSpent={duration}
        bestWpm={bestWpm}
        isNewBest={isNewBest}
        onRestart={handleRestart}
      />
    </div>
  );
}
