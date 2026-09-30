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
  const name = language === "en" && (character as any).nameEn ? (character as any).nameEn : character.name;
  const tag = language === "en" && (character as any).tagEn ? (character as any).tagEn : character.tag;
  const description = language === "en" && (character as any).descriptionEn ? (character as any).descriptionEn : character.description;

  return (
    <Link
      href={`/chat/${character.id}`}
      onClick={() => onClick?.(character)}
      className="group relative h-[195px] rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200/90 dark:border-slate-800/80 hover:border-cyan-500/70 dark:hover:border-cyan-500/70 p-4 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between block"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-2xl group-hover:from-cyan-500/20 group-hover:to-violet-500/20 transition-all pointer-events-none" />

      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 group-hover:border-cyan-400/80 transition-all shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800">
            <img
              src={character.avatar}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                {name}
              </h3>
            </div>
            <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/30">
              {tag}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {language === "en" ? "Interactions:" : "Tương tác:"}{" "}
          <strong className="text-slate-700 dark:text-slate-300 font-mono">{character.interactions}</strong>
        </span>

        <span className="text-indigo-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform font-bold flex items-center gap-0.5">
          {language === "en" ? "Roleplay →" : "Nhập vai →"}
        </span>
      </div>
    </Link>
  );
}
