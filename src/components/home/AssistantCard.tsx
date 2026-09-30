"use client";

import React from "react";
import Link from "next/link";
import { AssistantItem } from "@/data/aiData";
import { useLanguage } from "@/context/LanguageContext";

interface AssistantCardProps {
  assistant: AssistantItem;
  onClick?: (assistant: AssistantItem) => void;
}

export default function AssistantCard({ assistant, onClick }: AssistantCardProps) {
  const { language } = useLanguage();
  const name = language === "en" && (assistant as any).nameEn ? (assistant as any).nameEn : assistant.name;
  const description = language === "en" && (assistant as any).descriptionEn ? (assistant as any).descriptionEn : assistant.description;

  return (
    <Link
      href={`/chat/${assistant.id}`}
      onClick={() => onClick?.(assistant)}
      className="group relative h-[195px] rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-500/70 dark:hover:border-indigo-500/70 p-4 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between block"
    >
      {/* Background glowing gradient */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-2xl group-hover:from-indigo-500/20 group-hover:to-cyan-500/20 transition-all pointer-events-none" />

      <div>
        {/* Top: Avatar and Title */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 group-hover:border-indigo-500/80 transition-all shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800">
            <img
              src={assistant.avatar}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                {name}
              </h3>
              {assistant.verified && (
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] flex items-center justify-center shrink-0 font-bold" title="Đã kiểm chứng">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              By {assistant.author}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer / Stats */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-mono font-medium">{assistant.uses}</span>
        </div>

        <span className="text-indigo-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform font-bold flex items-center gap-0.5">
          {language === "en" ? "Chat →" : "Trò chuyện →"}
        </span>
      </div>
    </Link>
  );
}
