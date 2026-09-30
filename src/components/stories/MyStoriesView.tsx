"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import StoryWriterView from "./StoryWriterView";

interface StoryItem {
  id: string;
  botId: string;
  botName: string;
  botAvatar: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

type Tab = "history" | "writer";

export default function MyStoriesView() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("history");

  useEffect(() => {
    async function loadStories() {
      if (!user) {
        setStories([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversations) {
            const mapped: StoryItem[] = data.conversations.map((c: any) => ({
              id: c.id,
              botId: c.botId,
              botName: c.bot?.name || (language === "en" ? "AI Assistant" : "Trợ lý AI"),
              botAvatar:
                c.bot?.avatar ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
              title: c.title || (language === "en" ? "New conversation" : "Cuộc trò chuyện mới"),
              lastMessage:
                c.messages?.[c.messages.length - 1]?.content ||
                (language === "en" ? "Click to continue story..." : "Bấm để tiếp tục câu chuyện..."),
              updatedAt: new Date(c.updatedAt || c.createdAt).toLocaleDateString(
                language === "en" ? "en-US" : "vi-VN"
              ),
            }));
            setStories(mapped);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải truyện của tôi:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStories();
  }, [user, language]);

  return (
    <div className="w-full max-w-[1100px] mx-auto flex flex-col">
      {/* ── HEADER ── */}
      <div className="w-full mb-6 pb-5 border-b border-slate-200 dark:border-indigo-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">📖</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("stories.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("stories.subtitle")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("writer")}
          className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span>✍️</span>
          <span>{t("stories.new_story")}</span>
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-white dark:bg-[#0d0f18] text-slate-900 dark:text-white border border-slate-200 dark:border-indigo-950/60 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>📚</span>
          <span>{t("stories.tab_history")}</span>
          {stories.length > 0 && (
            <span className="ml-1 text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">
              {stories.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("writer")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "writer"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>✍️</span>
          <span>{t("stories.tab_writer")}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 ml-0.5">AI</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "writer" ? (
        /* ── STORY WRITER WORKSPACE ── */
        <div className="flex-1 min-h-[600px]">
          <StoryWriterView onBack={() => setActiveTab("history")} />
        </div>
      ) : (
        /* ── HISTORY TAB ── */
        <>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">{t("stories.loading")}</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="w-full text-center py-14 bg-white/80 dark:bg-[#0d0f18]/80 backdrop-blur-md border border-slate-200 dark:border-indigo-950/60 rounded-3xl p-8">
              <span className="text-4xl">📚</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3">
                {t("stories.empty")}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t("stories.empty_desc")}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => router.push("/chat/char-luna")}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  {t("stories.roleplay_luna")}
                </button>
                <button
                  onClick={() => setActiveTab("writer")}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  ✍️ {t("stories.new_story")}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {/* Quick write card at top */}
              <button
                onClick={() => setActiveTab("writer")}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex items-center gap-3 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-lg shrink-0">
                  ✍️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t("stories.open_workspace")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("stories.workspace_desc")}
                  </p>
                </div>
                <span className="text-indigo-500 font-bold group-hover:translate-x-1 transition-transform text-sm shrink-0">→</span>
              </button>

              {/* Story list */}
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/chat/${story.botId}`}
                  className="p-4 rounded-2xl bg-white/90 dark:bg-[#0d0f18]/90 backdrop-blur-md border border-slate-200/90 dark:border-indigo-950/60 hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group block"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={story.botAvatar}
                      alt={story.botName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors truncate">
                          {story.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#181a28] text-slate-500 dark:text-slate-400 shrink-0">
                          {story.botName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {story.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:inline">{story.updatedAt}</span>
                    <span className="text-sm font-bold text-indigo-500 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
