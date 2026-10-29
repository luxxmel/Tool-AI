"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { playVietnameseTTS, stopVietnameseTTS } from "@/lib/ttsAudio";

interface HealingMessage {
  id: string;
  sender: "user" | "tam_an";
  text: string;
  time: string;
}

const COMFORT_MOODS_VI = [
  {
    icon: "🌧️",
    label: "Kiệt sức & Áp lực",
    sample: "Hôm nay mình thật sự rất mệt mỏi, áp lực từ công việc và cuộc sống dường như đè nặng lên vai, mình thấy bất lực quá...",
  },
  {
    icon: "💔",
    label: "Tổn thương tình cảm",
    sample: "Mình vừa chia tay một người từng là tất cả... Cảm giác trong ngực đau nhói và trống rỗng không tả nổi.",
  },
  {
    icon: "🌫️",
    label: "Cô đơn & Lạc lõng",
    sample: "Ở giữa đám đông nhưng mình thấy cô độc đến nghẹt thở, dường như chẳng có một ai thật sự hiểu và quan tâm mình...",
  },
  {
    icon: "🥀",
    label: "Tủi thân & Muốn khóc",
    sample: "Mình đã cố tỏ ra mạnh mẽ quá lâu rồi, giờ đây chỉ muốn khóc một trận cho nhẹ lòng mà không sợ ai phán xét...",
  },
  {
    icon: "🕊️",
    label: "Cần một cái ôm",
    sample: "Tâm An ơi, hôm nay cuộc sống đối xử với mình tệ quá. Bạn ôm mình một cái thật chặt được không?",
  },
];

const COMFORT_MOODS_EN = [
  {
    icon: "🌧️",
    label: "Exhausted & Pressured",
    sample: "Today I feel genuinely exhausted. The pressure from work and life feels overwhelming, and I feel powerless...",
  },
  {
    icon: "💔",
    label: "Heartbroken & Hurt",
    sample: "I just parted ways with someone who meant the world to me... There's an aching, empty void in my chest.",
  },
  {
    icon: "🌫️",
    label: "Lonely & Lost",
    sample: "Even surrounded by people, I feel suffocatingly alone. It feels like nobody truly understands or cares...",
  },
  {
    icon: "🥀",
    label: "Vulnerable & Tearful",
    sample: "I've been trying to stay strong for so long. Right now, I just want to let my tears flow without fear of judgment...",
  },
  {
    icon: "🕊️",
    label: "Need a Warm Hug",
    sample: "Tam An, life has been so harsh to me today. Could you give me a gentle, reassuring virtual hug?",
  },
];

interface HealingCornerProps {
  onOpenLoginModal?: () => void;
}

export default function HealingCorner({ onOpenLoginModal }: HealingCornerProps = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<HealingMessage[]>([
    {
      id: "welcome-msg",
      sender: "tam_an",
      text: language === "en"
        ? "Hello... How has your day been? If there is anything bothering or weighing you down, feel free to chat with me."
        : "Chào bạn... Hôm nay của bạn thế nào? Có chuyện gì làm bạn phiền lòng hay mệt mỏi không, cứ tâm sự với mình nhé.",
      time: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<"female" | "male">("female");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const formattedTime = new Date().toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === "welcome-msg" && !m.time ? { ...m, time: formattedTime } : m))
    );
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const botMsgId = `tam-an-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessages: HealingMessage[] = [
      ...messages,
      { id: userMsgId, sender: "user", text, time: currentTime },
      { id: botMsgId, sender: "tam_an", text: "", time: currentTime },
    ];

    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome-msg")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: "goc-chua-lanh",
          message: text,
          history: historyPayload,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gửi tin nhắn thất bại");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: accumulated } : msg
          )
        );
      }

      if (!accumulated.trim()) {
        const defaultComfort = language === "en"
          ? "I hear you. Feel free to talk to me whenever you are ready."
          : "Mình nghe bạn rồi nè. Có chuyện gì cứ chia sẻ với mình nhé!";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: defaultComfort } : msg
          )
        );
      }
    } catch (e: any) {
      console.error("Lỗi gửi tin nhắn chữa lành:", e);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                text: language === "en"
                  ? "I'm still here. Feel free to talk to me."
                  : "Mình vẫn ở đây lắng nghe bạn. Có điều gì làm bạn phiền lòng cứ kể mình nghe nhé.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (isSpeaking === msgId) {
      stopVietnameseTTS();
      setIsSpeaking(null);
      return;
    }
    setIsSpeaking(msgId);
    playVietnameseTTS(msgId, text, {
      voice: selectedVoice,
      onStart: () => setIsSpeaking(msgId),
      onEnd: () => setIsSpeaking(null),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col py-2 sm:py-4 px-2 sm:px-4">
      {/* Mood Emotion Chips - Thanh chọn tâm trạng tinh gọn, sang trọng */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span className="text-emerald-500">✨</span>
            <span>{t("healing.mood_title", "Chọn tâm trạng của bạn để bắt đầu:")}</span>
          </p>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400/90 hidden sm:inline">
            🕊️ Hoàn toàn miễn phí & bảo mật
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          {(language === "en" ? COMFORT_MOODS_EN : COMFORT_MOODS_VI).map((mood, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(mood.sample)}
              className="px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs shrink-0 whitespace-nowrap"
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box - Thiết kế hiện đại, khung viền mềm mại */}
      <div className="w-full rounded-2xl bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl shadow-slate-950/5 flex flex-col h-[650px] overflow-hidden">
        {/* Header Trong Khung Chat */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-50 dark:bg-slate-800 shadow-xs shrink-0">
              <img
                src="/characters/tam_an.jpg"
                alt="Tâm An"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c0e17]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {t("healing.companion_title", "Tâm An")}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shrink-0">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Lắng nghe & đồng hành cùng bạn
              </p>
            </div>
          </div>

          {/* Controls: Chọn giọng đọc & nút sang phòng riêng */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bộ chọn giọng */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedVoice("female")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedVoice === "female"
                    ? "bg-rose-500 text-white shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Giọng nữ nhẹ nhàng"
              >
                <span>🌸</span>
                <span className="hidden sm:inline">{t("healing.voice_female", "Nữ dịu dàng")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoice("male")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedVoice === "male"
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Giọng nam trầm ấm"
              >
                <span>🍃</span>
                <span className="hidden sm:inline">{t("healing.voice_male", "Nam trầm ấm")}</span>
              </button>
            </div>

            <button
              onClick={() => router.push("/chat/goc-chua-lanh")}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1"
              title="Mở toàn màn hình"
            >
              <span className="hidden sm:inline">Phòng riêng</span>
              <span>↗</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 items-end ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar Bot */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-emerald-500/25 shadow-xs mb-1">
                    <img
                      src="/characters/tam_an.jpg"
                      alt="Tâm An"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                )}

                {/* Bong bóng tin nhắn */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? "bg-emerald-600 text-white rounded-br-xs shadow-sm shadow-emerald-600/20"
                      : "bg-slate-100/90 dark:bg-[#151724] text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 rounded-bl-xs shadow-xs"
                  }`}
                >
                  {msg.text ? (
                    <MarkdownRenderer content={msg.text} />
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 italic py-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{t("healing.thinking", "Tâm An đang nghe bạn...")}</span>
                    </div>
                  )}

                  <div
                    className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${
                      isUser ? "text-emerald-200/80" : "text-slate-400"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {!isUser && msg.text && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeech(msg.id, msg.text)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer border ${
                          isSpeaking === msg.id
                            ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                            : "bg-white/90 dark:bg-slate-800/90 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40"
                        }`}
                        title="Nghe giọng đọc"
                      >
                        <span>{isSpeaking === msg.id ? "⏹ Dừng" : "🎧 Đọc"}</span>
                        {isSpeaking === msg.id && (
                          <span className="flex gap-0.5 items-end h-2">
                            <span className="w-0.5 h-2 bg-white animate-bounce" />
                            <span className="w-0.5 h-1.5 bg-white animate-bounce [animation-delay:0.15s]" />
                            <span className="w-0.5 h-2 bg-white animate-bounce [animation-delay:0.3s]" />
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Avatar Người dùng kế bên tin nhắn */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mb-1">
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                      alt={user?.displayName || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Khung Nhập Tin Nhắn */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0c0e17] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t("healing.input_placeholder", "Cứ nhắn cho mình nhé, mình ở đây lắng nghe bạn...")}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-[#131522] border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3 21l18-9L3 3l3 9zm0 0h9" />
            </svg>
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
