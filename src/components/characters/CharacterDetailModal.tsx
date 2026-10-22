"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CharacterStoryData, getCharacterStory, CharacterComment } from "@/data/characterStories";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface CharacterDetailModalProps {
  characterId: string;
  fallbackName?: string;
  fallbackAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CharacterDetailModal({
  characterId,
  fallbackName,
  fallbackAvatar,
  isOpen,
  onClose,
}: CharacterDetailModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();

  const storyData: CharacterStoryData = getCharacterStory(characterId, fallbackName);
  const avatarUrl = fallbackAvatar || storyData.avatar;

  // Tab & Read State
  const [activeTab, setActiveTab] = useState<"summary" | "fullStory">("summary");
  const [showPersonaForm, setShowPersonaForm] = useState(false);

  // Persona State (Tên & Giới tính)
  const [roleplayName, setRoleplayName] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");

  // Reactions state
  const [reactions, setReactions] = useState(storyData.initialReactions);
  const [userReacted, setUserReacted] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<CharacterComment[]>(storyData.comments);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentLiked, setCommentLiked] = useState<Record<string, boolean>>({});

  // Lịch sử kịch bản trò chuyện riêng của nhân vật này
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Đọc persona và lịch sử đã lưu từ trước (nếu có)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("omni_rp_persona");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setRoleplayName(parsed.name);
          if (parsed.gender) setGender(parsed.gender);
        } else if (user?.displayName) {
          setRoleplayName(user.displayName);
        }
      } catch {}

      // Lấy reactions đã lưu
      const savedReaction = localStorage.getItem(`omni_react_${characterId}`);
      if (savedReaction) setUserReacted(savedReaction);

      // Lấy comments cá nhân đã lưu
      const savedComments = localStorage.getItem(`omni_cmt_${characterId}`);
      if (savedComments) {
        try {
          const parsedCmt = JSON.parse(savedComments);
          setComments([...parsedCmt, ...storyData.comments]);
        } catch {}
      }

      // Tải danh sách kịch bản trò chuyện riêng của nhân vật này
      const uid = user?.id || user?.email;
      if (uid) {
        setLoadingHistory(true);
        fetch(`/api/conversations?userId=${encodeURIComponent(uid)}&botId=${encodeURIComponent(characterId)}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => {
            if (Array.isArray(data)) {
              setSavedConversations(data);
            }
          })
          .catch((err) => console.error("Lỗi tải kịch bản nhân vật:", err))
          .finally(() => setLoadingHistory(false));
      }
    }
  }, [characterId, user?.id, user?.email, user?.displayName, storyData.comments]);

  if (!isOpen) return null;

  // Xử lý thả cảm xúc
  const handleToggleReaction = (type: "heart" | "fire" | "crown" | "sparkles" | "blush") => {
    if (userReacted === type) {
      setReactions((prev) => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
      setUserReacted(null);
      localStorage.removeItem(`omni_react_${characterId}`);
    } else {
      setReactions((prev) => {
        const updated = { ...prev };
        if (userReacted && updated[userReacted as keyof typeof updated] !== undefined) {
          updated[userReacted as keyof typeof updated] = Math.max(
            0,
            updated[userReacted as keyof typeof updated] - 1
          );
        }
        updated[type] = (updated[type] || 0) + 1;
        return updated;
      });
      setUserReacted(type);
      localStorage.setItem(`omni_react_${characterId}`, type);
    }
  };

  // Thêm bình luận mới
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = roleplayName.trim() || user?.displayName || "Người ẩn danh";
    const newCmt: CharacterComment = {
      id: `usr-${Date.now()}`,
      userName: authorName,
      gender: gender,
      content: newCommentText.trim(),
      createdAt: "Vừa xong",
      likes: 1,
    };

    const updated = [newCmt, ...comments];
    setComments(updated);
    setNewCommentText("");

    // Lưu vào localStorage
    try {
      const mySaved = JSON.parse(localStorage.getItem(`omni_cmt_${characterId}`) || "[]");
      localStorage.setItem(`omni_cmt_${characterId}`, JSON.stringify([newCmt, ...mySaved]));
    } catch {}
  };

  const handleLikeComment = (cmtId: string) => {
    setCommentLiked((prev) => {
      const isLiked = !!prev[cmtId];
      setComments((list) =>
        list.map((c) =>
          c.id === cmtId ? { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 } : c
        )
      );
      return { ...prev, [cmtId]: !isLiked };
    });
  };

  // Bắt đầu chat với Persona đã chọn (có thể truyền kèm convId nếu tiếp tục kịch bản cũ)
  const handleProceedToChat = (targetConvId?: string) => {
    const finalName = roleplayName.trim() || user?.displayName || (gender === "female" ? "Tiểu Thư" : "Thiếu Hiệp");
    const persona = { name: finalName, gender };

    try {
      localStorage.setItem("omni_rp_persona", JSON.stringify(persona));
      localStorage.setItem(`omni_rp_persona_${characterId}`, JSON.stringify(persona));
    } catch {}

    onClose();
    // Điều hướng sang chat kèm query params để AI đọc được ngay
    const params = new URLSearchParams({
      rpName: encodeURIComponent(finalName),
      gender: gender,
    });
    if (targetConvId) {
      params.set("convId", targetConvId);
    } else {
      params.set("new", "true");
    }
    router.push(`/chat/${characterId}?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0f111a] border border-slate-800 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Bar */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
          <img
            src={avatarUrl}
            alt={storyData.name}
            className="w-full h-full object-cover blur-xs scale-105 brightness-60"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/characters/luc_can_phong.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-20"
            title="Đóng"
          >
            ✕
          </button>

          {/* Character Main Header Info */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3.5 z-10">
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-xl shrink-0 bg-slate-900">
              <img
                src={avatarUrl}
                alt={storyData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/characters/luc_can_phong.jpg";
                }}
              />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xs">
                  {storyData.tag}
                </span>
                <span className="text-[11px] text-cyan-300 font-medium truncate">
                  ✦ {storyData.title}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md truncate">
                {storyData.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5 scrollbar-thin">
          {/* Quote Banner */}
          <div className="relative p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs sm:text-sm text-cyan-200 italic shadow-inner">
            <span className="text-cyan-400 font-serif text-lg mr-1">“</span>
            {storyData.quote}
            <span className="text-cyan-400 font-serif text-lg ml-1">”</span>
          </div>

          {/* Story Toggle Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "summary"
                  ? "bg-white text-black shadow-md"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              📖 Tóm tắt cốt truyện
            </button>
            <button
              onClick={() => setActiveTab("fullStory")}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "fullStory"
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <span>📜 Bản đầy đủ chi tiết</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">Sâu sắc</span>
            </button>
          </div>

          {/* Story Content View */}
          {activeTab === "summary" ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {storyData.summary}
              </p>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div>
                  <strong className="text-white">🎭 Tính cách:</strong> {storyData.personality}
                </div>
                <div>
                  <strong className="text-cyan-300">💫 Duyên phận với bạn:</strong> {storyData.relationship}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed animate-in fade-in duration-150 whitespace-pre-line font-normal">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-800">
                <span>✦</span> TIỂU SỬ & CỐT TRUYỆN TOÀN DIỆN
              </div>
              {storyData.fullStory}
            </div>
          )}

          {/* Reactions Row */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>💖 Thả cảm xúc cho nhân vật:</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {reactions.heart + reactions.fire + reactions.crown + reactions.sparkles + reactions.blush} lượt yêu thích
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { type: "heart" as const, emoji: "❤️", label: "Yêu thích", count: reactions.heart },
                { type: "fire" as const, emoji: "🔥", label: "Quá cháy", count: reactions.fire },
                { type: "crown" as const, emoji: "👑", label: "Cực phẩm", count: reactions.crown },
                { type: "sparkles" as const, emoji: "✨", label: "Cuốn hút", count: reactions.sparkles },
                { type: "blush" as const, emoji: "🌸", label: "Ngọt ngào", count: reactions.blush },
              ].map((r) => {
                const isSelected = userReacted === r.type;
                return (
                  <button
                    key={r.type}
                    onClick={() => handleToggleReaction(r.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 scale-105 shadow-sm"
                        : "bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.label}</span>
                    <span className="font-mono text-[11px] opacity-80">{r.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saved Conversations / Kịch bản của riêng nhân vật này */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span>📜</span> Kịch bản trò chuyện của bạn với {storyData.name}:
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPersonaForm(true);
                }}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>➕ Kịch bản mới</span>
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-2 text-center text-xs text-slate-500 animate-pulse">
                Đang tải các kịch bản đã lưu...
              </div>
            ) : savedConversations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {savedConversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleProceedToChat(c.id)}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                      {c.title || "Cuộc trò chuyện"}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>{c.messagesCount || 0} tin nhắn</span>
                      <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Tiếp tục ➔</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Chưa có kịch bản cũ nào với {storyData.name}. Bấm bắt đầu trò chuyện để mở kịch bản đầu tiên nhé!
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>💬 Đánh giá & Bình luận ({comments.length}):</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Chia sẻ cảm xúc của bạn về nhân vật này..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-md"
              >
                Gửi
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {comments.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 italic">
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ về nhân vật này nhé!
                </div>
              ) : (
                comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-slate-200">{cmt.userName}</span>
                        {cmt.gender && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400">
                            {cmt.gender === "female" ? "♀ Nữ" : "♂ Nam"}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">• {cmt.createdAt}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{cmt.content}</p>
                    </div>
                    <button
                      onClick={() => handleLikeComment(cmt.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer shrink-0 ${
                        commentLiked[cmt.id]
                          ? "text-rose-400 bg-rose-500/10 font-bold"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <span>{commentLiked[cmt.id] ? "❤️" : "🤍"}</span>
                      <span>{cmt.likes}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action / Onboarding Persona Step */}
        <div className="p-4 sm:p-5 bg-[#0a0c13] border-t border-slate-800 shrink-0">
          {!showPersonaForm ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400 hidden sm:block">
                <span>✦ Nhập vai độc bản với xưng hô theo danh tính của bạn</span>
              </div>
              <button
                onClick={() => setShowPersonaForm(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer ml-auto"
              >
                <span>💬 Bắt đầu trò chuyện</span>
                <span>➔</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>🎭</span> Thiết lập danh tính của bạn trước khi bước vào chat:
                </span>
                <button
                  onClick={() => setShowPersonaForm(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Quay lại
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tên người dùng */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tên / Biệt danh bạn muốn nhân vật gọi:
                  </label>
                  <input
                    type="text"
                    value={roleplayName}
                    onChange={(e) => setRoleplayName(e.target.value)}
                    placeholder="VD: Linh, Tuyết Nhi, Quân ca..."
                    maxLength={25}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Giới tính của bạn (để xưng hô chuẩn xác):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === "female"
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                          : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>🌸 Nữ</span>
                      <span className="text-[10px] opacity-80">(Em/Nàng)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === "male"
                          ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                          : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>⚡ Nam</span>
                      <span className="text-[10px] opacity-80">(Anh/Chàng)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút vào chat */}
              <button
                type="button"
                onClick={() => handleProceedToChat()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>✨ Vào trò chuyện ngay với {storyData.name}</span>
                <span>➔</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
