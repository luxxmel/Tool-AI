"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/sidebar/AppSidebar";
import AiSearchBox from "@/components/home/AiSearchBox";
import AssistantCard from "@/components/home/AssistantCard";
import CharacterCard from "@/components/home/CharacterCard";
import ChatResponseModal from "@/components/home/ChatResponseModal";
import LoginForm from "@/components/auth/LoginForm";
import ExploreFeed from "@/components/explore/ExploreFeed";
import AiImageStudio from "@/components/images/AiImageStudio";
import CharactersDirectory from "@/components/characters/CharactersDirectory";
import MyStoriesView from "@/components/stories/MyStoriesView";
import HomeChatView from "@/components/home/HomeChatView";
import ProjectDetailView from "@/components/projects/ProjectDetailView";
import CreateProjectView from "@/components/projects/CreateProjectView";
import AiToolsStudio from "@/components/tools/AiToolsStudio";
import HealingCorner from "@/components/healing/HealingCorner";
import UserProfileView from "@/components/profile/UserProfileView";
import {
  FEATURED_ASSISTANTS,
  TRENDING_CHARACTERS,
  AssistantItem,
  CharacterItem,
} from "@/data/aiData";
import WorkspaceBackgroundLayer from "@/components/theme/WorkspaceBackgroundLayer";
import WorkspaceFloatingDock from "@/components/theme/WorkspaceFloatingDock";
import { useWorkspaceBackground } from "@/context/WorkspaceBackgroundContext";
import UserSettingsModal, { SettingsTab } from "@/components/user/UserSettingsModal";
import { useLanguage } from "@/context/LanguageContext";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams?.get("tab") || "home";

  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState(tabQuery);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [selectedBrainMode, setSelectedBrainMode] = useState<string>("fast");
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [chatSessionKey, setChatSessionKey] = useState<string>("session-init");
  const [chatImages, setChatImages] = useState<string[]>([]);
  const { bgType } = useWorkspaceBackground();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("appearance");

  // Đồng bộ URL tab parameter
  useEffect(() => {
    if (tabQuery && tabQuery !== currentTab) {
      setCurrentTab(tabQuery);
      if (tabQuery === "home") {
        setIsChatOpen(false);
      }
    }
  }, [tabQuery]);

  // Mở đoạn chat mới từ thanh tìm kiếm với bộ não đã chọn và hình ảnh kèm theo (nếu có)
  const handlePromptSubmit = (
    promptText: string,
    modelId: string = "fast",
    images: string[] = []
  ) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setActiveConversationId(null);
    setSelectedAssistant(null);
    setIsCreatingProject(false);
    setSelectedBrainMode(modelId);
    setChatPrompt(promptText);
    setChatImages(images);
    setChatSessionKey(`prompt-${Date.now()}`);
    setIsChatOpen(true);
  };

  // Chọn một cuộc trò chuyện từ sidebar
  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setChatSessionKey(`conv-${convId}`);
    setIsCreatingProject(false);
    setChatPrompt("");
    setSelectedAssistant(null);
    setIsChatOpen(true);
    setCurrentTab("home");
  };

  // Chọn một dự án từ sidebar
  const handleSelectProject = (projId: string) => {
    setActiveProjectId(projId);
    setActiveConversationId(null);
    setIsCreatingProject(false);
    setIsChatOpen(false);
    setCurrentTab("home");
  };

  // Mở màn hình tạo dự án ở giữa trang chính
  const handleOpenCreateProject = () => {
    setIsCreatingProject(true);
    setActiveProjectId(null);
    setActiveConversationId(null);
    setIsChatOpen(false);
    setCurrentTab("home");
  };

  // Tạo mới cuộc trò chuyện (Reset về trang chủ)
  const handleNewChat = () => {
    setActiveConversationId(null);
    setActiveProjectId(null);
    setIsCreatingProject(false);
    setChatPrompt("");
    setChatImages([]);
    setSelectedAssistant(null);
    setChatSessionKey(`new-${Date.now()}`);
    setIsChatOpen(false);
    setCurrentTab("home");
  };

  // Handle clicking an assistant -> chuyển hướng sang trang chat /chat/[botId]
  const handleSelectAssistant = (assistant: AssistantItem) => {
    router.push(`/chat/${assistant.id}`);
  };

  // Handle clicking a character -> chuyển hướng sang trang chat /chat/[botId]
  const handleSelectCharacter = (character: CharacterItem) => {
    router.push(`/chat/${character.id}`);
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    if (tab === "home") {
      handleNewChat();
      router.push("/");
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  return (
    <div
      className={`${
        isChatOpen ? "h-screen max-h-[100dvh] overflow-hidden" : "min-h-screen"
      } ${
        bgType === "default" ? "bg-[#f8fafc] dark:bg-[#07080d]" : "bg-[#07080d]"
      } text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-300 relative`}
    >
      {/* Workspace Background Layer */}
      <WorkspaceBackgroundLayer />

      {/* Left Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onSelectAssistant={handleSelectAssistant}
        onOpenLoginModal={() => setShowLoginModal(true)}
        activeConversationId={activeConversationId}
        activeProjectId={activeProjectId}
        onSelectConversation={handleSelectConversation}
        onSelectProject={handleSelectProject}
        onNewChat={handleNewChat}
        onOpenCreateProject={handleOpenCreateProject}
        refreshTrigger={refreshTrigger}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Floating Expand Sidebar Button (Desktop when collapsed) */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden lg:flex fixed top-4 left-4 z-40 p-2 sm:px-3 sm:py-2 rounded-xl bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all items-center gap-2 text-xs font-semibold cursor-pointer group"
          title={t("sidebar.expand")}
        >
          <svg className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span>{t("sidebar.expand")}</span>
        </button>
      )}

      {/* Workspace Floating Dock (Surprise Me, Ambient Soundscape, Particles, Studio) */}
      <WorkspaceFloatingDock
        onOpenFullSettings={() => {
          if (!user) {
            setShowLoginModal(true);
          } else {
            setSettingsTab("appearance");
            setIsSettingsOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 ${
          isChatOpen
            ? "h-screen max-h-[100dvh] overflow-hidden px-2 sm:px-4 pt-14 lg:pt-3 pb-2"
            : "min-h-screen px-4 sm:px-6 pt-16 lg:pt-8 pb-28 sm:pb-36 lg:pb-40"
        } flex flex-col ${isChatOpen ? "items-stretch" : "items-center"} justify-start w-full relative z-10 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-0" : "lg:ml-64"
        }`}
      >

        {/* Centered Unified Content Container */}
        <div className={`w-full ${isChatOpen ? "h-full min-h-0 max-w-full" : "max-w-[980px]"} flex flex-col`}>
          {isCreatingProject ? (
            /* Inline Project Creation View in center of chat area */
            <CreateProjectView
              onProjectCreated={(newProj) => {
                setIsCreatingProject(false);
                setActiveProjectId(newProj.id);
                setRefreshTrigger((prev) => prev + 1);
              }}
              onCancel={() => setIsCreatingProject(false)}
            />
          ) : activeProjectId && !isChatOpen ? (
            /* Project Workspace View */
            <ProjectDetailView
              projectId={activeProjectId}
              onSelectConversation={handleSelectConversation}
              onNewChatInProject={(projId) => {
                setActiveProjectId(projId);
                setActiveConversationId(null);
                setChatPrompt("");
                setIsChatOpen(true);
              }}
              onBack={() => setActiveProjectId(null)}
            />
          ) : currentTab === "explore" ? (
            <ExploreFeed onOpenLoginModal={() => setShowLoginModal(true)} />
          ) : currentTab === "images" ? (
            <AiImageStudio onOpenLoginModal={() => setShowLoginModal(true)} />
          ) : currentTab === "characters" ? (
            <CharactersDirectory />
          ) : currentTab === "healing" ? (
            <HealingCorner onOpenLoginModal={() => setShowLoginModal(true)} />
          ) : currentTab === "stories" ? (
            <MyStoriesView />
          ) : currentTab === "tools" ? (
            <AiToolsStudio />
          ) : currentTab === "profile" ? (
            <UserProfileView onOpenLoginModal={() => setShowLoginModal(true)} />
          ) : isChatOpen ? (
            /* Direct In-Page Chat (ChatGPT Style) */
            <HomeChatView
              key={chatSessionKey}
              initialPrompt={chatPrompt}
              initialImages={chatImages}
              initialModel={selectedBrainMode}
              conversationId={activeConversationId}
              projectId={activeProjectId}
              selectedAssistant={selectedAssistant}
              onNewChat={handleNewChat}
              onConversationCreated={(newId) => {
                setActiveConversationId(newId);
                setRefreshTrigger((prev) => prev + 1);
              }}
              onOpenLoginModal={() => setShowLoginModal(true)}
            />
          ) : (
            <>
              {/* Center Search / Prompt Area */}
              <div className="pt-2 sm:pt-6 pb-12 w-full">
                <AiSearchBox onSubmitPrompt={handlePromptSubmit} />
              </div>

              {/* Section 1: Trợ lý nổi bật */}
              <section className="mb-12 w-full">
                 <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-2.5">
                     <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                       {t("home.featured_assistants")}
                     </h2>
                     <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/60 animate-pulse" />
                   </div>

                   <button
                     onClick={() => {
                       const btn = document.querySelector('[data-nav-id="assistants"]') as HTMLElement;
                       if (btn) btn.click();
                       else handleSelectTab("tools");
                     }}
                     className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                   >
                     <span>{t("home.view_all")}</span>
                     <span>→</span>
                   </button>
                 </div>

                 {/* Grid of Featured Assistants */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {FEATURED_ASSISTANTS.slice(0, 4).map((assistant) => (
                     <AssistantCard
                       key={assistant.id}
                       assistant={assistant}
                       onClick={handleSelectAssistant}
                     />
                   ))}
                 </div>
               </section>

               {/* Section 2: Nhân vật xu hướng */}
               <section className="mb-12 w-full">
                 <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-2.5">
                     <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                       {t("home.trending_characters")}
                     </h2>
                     <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/15 to-cyan-500/15 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-500/20 dark:border-cyan-500/30">
                       {t("home.trending")}
                     </span>
                   </div>

                   <button
                     onClick={() => handleSelectTab("characters")}
                     className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                   >
                     <span>{t("home.view_all")}</span>
                     <span>→</span>
                   </button>
                 </div>

                 {/* Grid of Trending Characters */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {TRENDING_CHARACTERS.map((char) => (
                     <CharacterCard
                       key={char.id}
                       character={char}
                       onClick={handleSelectCharacter}
                     />
                   ))}
                 </div>
               </section>

               {/* Footer */}
               <footer className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                 <p>{t("home.footer_desc")}</p>
                 <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                   <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">{t("home.terms")}</span>
                   <span>•</span>
                   <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">{t("home.privacy")}</span>
                 </div>
               </footer>
            </>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginForm
              onSuccess={() => setShowLoginModal(false)}
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* User Settings & Wallpaper Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}