"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface WorkspaceFloatingDockProps {
  onOpenFullSettings?: () => void;
}

export default function WorkspaceFloatingDock({}: WorkspaceFloatingDockProps) {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <div className="flex items-center p-1.5 rounded-full bg-white/95 dark:bg-[#11131f]/95 backdrop-blur-xl border border-slate-200/90 dark:border-indigo-900/60 shadow-xl shadow-slate-900/10 dark:shadow-black/50 transition-all duration-300">
        {/* Nút Sáng */}
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            !isDark
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-md shadow-amber-500/30 scale-100"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5 opacity-70 hover:opacity-100"
          }`}
          title={language === "en" ? "Switch to Light Mode" : "Chuyển sang chế độ Sáng"}
        >
          <span className="text-base leading-none">☀️</span>
          <span className="tracking-tight">{language === "en" ? "Light" : "Sáng"}</span>
        </button>

        {/* Nút Tối */}
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            isDark
              ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-600/40 scale-100 border border-indigo-400/30"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 opacity-70 hover:opacity-100"
          }`}
          title={language === "en" ? "Switch to Dark Mode" : "Chuyển sang chế độ Tối"}
        >
          <span className="text-base leading-none">🌙</span>
          <span className="tracking-tight">{language === "en" ? "Dark" : "Tối"}</span>
        </button>
      </div>
    </div>
  );
}
