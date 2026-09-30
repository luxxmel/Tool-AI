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
        ? "Hello dear friend... Did life outside wear you down today, or is there a quiet sorrow in your heart you can't tell anyone else?\n\nFeel free to pour it all out here. In this safe haven, you don't need to pretend to be strong. I am always right here, listening and holding you with gentle kindness. 🌿🕊️"
        : "Chào bạn thương... Hôm nay cuộc sống bên ngoài có làm bạn mệt mỏi, hay có nỗi buồn nào chất chứa trong lòng mà chẳng biết tỏ cùng ai không?\n\nCứ trút hết vào đây với mình nhé. Ở góc nhỏ này, bạn không cần phải cố tỏ ra mạnh mẽ. Mình luôn ở đây, lắng nghe và ôm lấy bạn bằng tất cả sự dịu dàng. 🌿🕊️",
      time: new Date().toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", { hour: "2-digit", minute: "2-digit" }),
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
    return () => {
      stopVietnameseTTS();
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    if (!user) {
      onOpenLoginModal?.();
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: HealingMessage = {
      id: userMsgId,
      sender: "user",
      text: content,
      time: new Date().toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    const botMsgId = `bot-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: "tam_an",
        text: "",
        time: new Date().toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: "goc-chua-lanh",
          model: "creative",
          userId: user.id,
          language,
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (res.status === 401) {
        onOpenLoginModal?.();
        setMessages((prev) => prev.filter((m) => m.id !== botMsgId));
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(language === "en" ? "Unable to send message right now" : "Không thể gửi tin nhắn lúc này");
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

      // Đảm bảo không bao giờ để tin nhắn trống nếu mạng có sự cố bất ngờ
      if (!accumulated.trim()) {
        const defaultComfort = language === "en"
          ? "I hear you... You've worked so hard, dear friend. In this quiet corner, you are completely safe and I will always stay by your side to listen. 🌿🕊️"
          : "Mình nghe thấy bạn rồi... Bạn đã vất vả nhiều rồi thương ơi. Ở góc nhỏ này, bạn hoàn toàn an toàn và luôn có mình ở bên lắng nghe bạn nhé. 🌿🕊️";
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
                  ? "I am always here listening to you. Please feel free to open up; no matter how stormy life gets, you will never be alone in this quiet haven... 🌿🕊️"
                  : "Mình luôn ở đây lắng nghe bạn. Bạn cứ trải lòng nhé, dù cuộc sống có giông bão thế nào thì ở góc nhỏ này mình vẫn luôn bên bạn... 🌿🕊️",
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
    <div className="w-full max-w-[980px] mx-auto flex flex-col pb-16">
      {/* Header Banner */}
      <div className="w-full mb-6 pb-6 border-b border-slate-200 dark:border-indigo-950/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-teal-500/25 ring-1 ring-white/20 shrink-0">
              🕊️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t("healing.title", "Góc Gửi Gắm Nỗi Buồn")}
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 uppercase tracking-wider">
                  {t("healing.free_badge", "Miễn Phí 100%")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t("healing.subtitle", "Nơi bạn được phép yếu lòng, trút bỏ gánh nặng và lắng nghe những cái ôm ấm áp từ câu chữ")}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/chat/goc-chua-lanh")}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{t("healing.open_chat", "💬 Mở phòng chat riêng")}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Mood Emotion Chips */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
          <span>🌿</span>
          <span>{t("healing.mood_title", "Chọn tâm trạng hiện tại của bạn để mở lời:")}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(language === "en" ? COMFORT_MOODS_EN : COMFORT_MOODS_VI).map((mood, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(mood.sample)}
              className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#11131f]/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-400/50 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comfort Conversation Box */}
      <div className="w-full rounded-3xl bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-xl border border-slate-200 dark:border-indigo-950/80 shadow-2xl shadow-indigo-950/10 overflow-hidden flex flex-col h-[580px]">
        {/* Chat Header Inside Box */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-indigo-950/70 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-50 shadow-xs">
              <img
                src="/characters/tam_an.jpg"
                alt="Tâm An"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("healing.companion_title", "Tâm An · Người Bạn Lắng Nghe")}
                </h3>
                <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  {t("healing.online", "Online")}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {t("healing.companion_tagline", "“Không phán xét, không giáo điều, chỉ có thấu hiểu và sẻ chia”")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedVoice("female")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedVoice === "female"
                    ? "bg-rose-500 text-white shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={language === "en" ? "Female voice: Gentle, sweet, soothing comfort" : "Giọng nữ Hoài My: Ngọt ngào, dịu dàng, thủ thỉ chữa lành"}
              >
                <span>🌸</span>
                <span>{t("healing.voice_female", "Nữ dịu dàng")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoice("male")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedVoice === "male"
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={language === "en" ? "Male voice: Deep, empathetic, reassuring" : "Giọng nam Nam Minh: Trầm ấm, bao dung, tin cậy"}
              >
                <span>🍃</span>
                <span>{t("healing.voice_male", "Nam trầm ấm")}</span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 font-medium ml-1">
              <span>🕊️ {language === "en" ? "Free" : "Miễn phí"}</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30 shadow-2xs mt-1">
                    <img
                      src="/characters/tam_an.jpg"
                      alt="Tâm An"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 dark:bg-[#131524] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-indigo-950/70 rounded-bl-xs shadow-xs"
                  }`}
                >
                  {msg.text ? (
                    <MarkdownRenderer content={msg.text} />
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 italic py-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{t("healing.thinking", "Tâm An đang lắng nghe và viết cho bạn...")}</span>
                    </div>
                  )}

                  <div
                    className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${
                      isUser ? "text-emerald-200" : "text-slate-400"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {!isUser && msg.text && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeech(msg.id, msg.text)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                          isSpeaking === msg.id
                            ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                            : "bg-white/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/70 dark:border-rose-900/50"
                        }`}
                        title={language === "en" ? "Listen to comforting audio voice" : "Lắng nghe giọng đọc an ủi ngọt ngào và truyền cảm"}
                      >
                        <span>{isSpeaking === msg.id ? t("healing.stop_voice", "⏹️ Dừng đọc") : t("healing.listen_voice", "🎧 Nghe giọng đọc ấm áp")}</span>
                        {isSpeaking === msg.id && (
                          <span className="flex gap-0.5 items-end h-2.5">
                            <span className="w-0.5 h-2.5 bg-white animate-bounce" />
                            <span className="w-0.5 h-1.5 bg-white animate-bounce [animation-delay:0.15s]" />
                            <span className="w-0.5 h-2 bg-white animate-bounce [animation-delay:0.3s]" />
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t border-slate-200 dark:border-indigo-950/70 bg-white dark:bg-[#0c0e17] flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t("healing.input_placeholder", "Cứ trút hết vào đây... Mình ở đây bên bạn...")}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            <span>🕊️</span>
            <span className="hidden sm:inline">{t("healing.send_btn", "Gửi tâm sự")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
