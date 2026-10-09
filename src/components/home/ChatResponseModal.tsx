"use client";

import React, { useState, useEffect, useRef } from "react";
import { AssistantItem } from "@/data/aiData";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import RechargeModal from "@/components/payment/RechargeModal";

interface ChatResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  selectedAssistant?: AssistantItem | null;
}

export default function ChatResponseModal({
  isOpen,
  onClose,
  prompt,
  selectedAssistant,
}: ChatResponseModalProps) {
  const { user, updateUserCredits } = useAuth();
  const { language, t } = useLanguage();
  const activeUserId = user?.id || null;
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialPromptSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Gửi tin nhắn và stream câu trả lời từ API
  const sendChatMessage = async (
    chatHistory: { id: string; role: "user" | "assistant"; content: string }[],
    newPrompt: string
  ) => {
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    const updatedHistory = [
      ...chatHistory,
      { id: userMsgId, role: "user" as const, content: newPrompt },
      { id: aiMsgId, role: "assistant" as const, content: "" },
    ];

    setMessages(updatedHistory);
    setIsTyping(true);

    try {
      const targetBotId = selectedAssistant?.id || "omni-assistant";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: targetBotId,
          userId: activeUserId,
          conversationId,
          language,
          messages: updatedHistory
            .filter((m) => m.id !== aiMsgId)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 403) {
        setIsRechargeModalOpen(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content:
                    language === "en"
                      ? "⚠️ **Your account is out of Credits!** Please recharge to continue using AI features."
                      : "⚠️ **Tài khoản của bạn đã hết Credits!** Vui lòng nạp thêm để tiếp tục trải nghiệm các tính năng AI.",
                }
              : m
          )
        );
        setIsTyping(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      // Cập nhật remaining credits
      const remainingCreditsHeader = res.headers.get("X-Remaining-Credits");
      if (remainingCreditsHeader !== null) {
        updateUserCredits(Number(remainingCreditsHeader));
      }

      const convIdHeader = res.headers.get("X-Conversation-Id");
      if (convIdHeader) {
        setConversationId(convIdHeader);
      }

      // Đọc Streaming
      if (!res.body) {
        throw new Error("Không có response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content:
                  language === "en"
                    ? "Sorry, an AI connection error occurred. Please try again in a moment!"
                    : "Xin lỗi, đã xảy ra lỗi kết nối AI. Vui lòng thử lại sau giây lát!",
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Kích hoạt gửi câu hỏi đầu tiên khi mở modal
  useEffect(() => {
    if (isOpen && prompt && !isInitialPromptSent.current) {
      isInitialPromptSent.current = true;
      setMessages([]);
      sendChatMessage([], prompt);
    }

    if (!isOpen) {
      isInitialPromptSent.current = false;
      setMessages([]);
      setConversationId(null);
    }
  }, [isOpen, prompt]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const text = inputValue.trim();
    setInputValue("");
    sendChatMessage(messages, text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0c0e17]/95 border border-indigo-950/80 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/40 flex flex-col h-[600px] max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#0e101a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedAssistant ? (
              <img
                src={selectedAssistant.avatar}
                alt={selectedAssistant.name}
                className="w-9 h-9 rounded-full object-cover border border-indigo-500/50"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/30">
                AI
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {selectedAssistant ? selectedAssistant.name : "Biết Tuốt AI Core Ultra"}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                  Online 24/7
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedAssistant
                  ? selectedAssistant.description
                  : language === "en"
                  ? "All-in-one Artificial Intelligence Assistant"
                  : "Trợ lý trí tuệ nhân tạo toàn năng"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 shadow-xs shadow-indigo-500/30">
                  ✦
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white font-medium shadow-md shadow-indigo-600/20"
                    : "bg-[#131522] border border-indigo-950/70 text-slate-100"
                }`}
              >
                {m.content || (
                  <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-400 text-[11px]">
                {language === "en" ? "Responding, please wait..." : "Đang tạo câu trả lời, vui lòng chờ..."}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-800/80 bg-[#0e101a] flex items-center gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={language === "en" ? "Ask Biết Tuốt AI follow-up question..." : "Hỏi tiếp Biết Tuốt AI..."}
            disabled={isTyping}
            className="flex-1 bg-[#151724] border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
          >
            {language === "en" ? "Send" : "Gửi"}
          </button>
        </form>
      </div>

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
      />
    </div>
  );
}
