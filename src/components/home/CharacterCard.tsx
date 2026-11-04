"use client";

import React from "react";
import Link from "next/link";
import { CharacterItem } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";

interface CharacterCardProps {
  character: CharacterItem;
  onClick?: (character: CharacterItem) => void;
}

export default function CharacterCard({ character, onClick }: CharacterCardProps) {
  const { language } = useLanguage();
  const rawName = language === "en" && (character as any).nameEn ? (character as any).nameEn : character.name;
  const tag = language === "en" && (character as any).tagEn ? (character as any).tagEn : character.tag;
  const description = language === "en" && (character as any).descriptionEn ? (character as any).descriptionEn : character.description;

  // Phân tách tên chính và biệt danh/danh xưng (Ví dụ: "Lục Cận Phong · Bá Đạo Tổng Tài" => Name: "Lục Cận Phong", Title: "Bá Đạo Tổng Tài")
  const parts = rawName.split(/[\·\•\-]/);
  const mainName = parts[0]?.trim() || rawName;
  const titleAlias = parts.length > 1 ? parts.slice(1).join(" · ").trim() : "";

  return (
    <div
      onClick={() => onClick?.(character)}
      className="group relative min-h-[210px] h-full rounded-2xl bg-gradient-to-b from-white/95 to-white/80 dark:from-[#0c0e18]/95 dark:to-[#07080f]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 hover:border-cyan-500/70 dark:hover:border-cyan-400/70 p-4.5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/10 hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/15 to-violet-500/15 rounded-full blur-2xl group-hover:from-cyan-500/25 group-hover:to-violet-500/25 transition-all pointer-events-none" />

      <div>
        <div className="flex items-center gap-3.5 mb-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 group-hover:border-cyan-400/80 transition-all shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800 group-hover:shadow-md group-hover:shadow-cyan-500/20">
            <img
              src={character.avatar}
              alt={mainName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
              {mainName}
            </h3>
            {titleAlias ? (
              <p className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 truncate mt-0.5">
                ✦ {titleAlias}
              </p>
            ) : (
              <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/30">
                {tag}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
        <span>
          {language === "en" ? "Interactions:" : "Tương tác:"}{" "}
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{character.interactions}</strong>
        </span>

        <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>{language === "en" ? "Roleplay" : "Nhập vai"}</span>
          <span>➔</span>
        </span>
      </div>
    </div>
  );
}
