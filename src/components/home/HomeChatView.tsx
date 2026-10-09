"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { useAuth } from "@/context/AuthContext";
import { AssistantItem } from "@/data/aiData";
import { AVAILABLE_MODELS, AvailableModel } from "@/lib/aiProvider";
import {
  extractImagesFromClipboard,
  extractImagesFromFileList,
  extractImagesFromDrop,
} from "@/lib/imageUtils";
import RechargeModal from "@/components/payment/RechargeModal";
import { soundManager } from "@/utils/sound";
import { useWorkspaceBackground } from "@/context/WorkspaceBackgroundContext";
import { playVietnameseTTS, stopVietnameseTTS } from "@/lib/ttsAudio";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

interface HomeChatViewProps {
  initialPrompt?: string;
  initialImages?: string[];
  initialModel?: string;
  conversationId?: string | null;
  projectId?: string | null;
  selectedAssistant?: AssistantItem | null;
  onNewChat: () => void;
  onConversationCreated?: (newConvId: string) => void;
  onOpenLoginModal?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  modelName?: string;
  createdAt?: string;
}

export const VOICE_OPTIONS = [
  { id: "tong_tai", label: "Nam thần lồng tiếng", icon: "🎬", desc: "Giọng nam chính phim ngôn tình, trầm ấm quyến rũ" },
  { id: "female", label: "Nữ truyền cảm", icon: "🌸", desc: "Giọng Hoài My dịu dàng, sâu lắng" },
  { id: "female_sweet", label: "Nữ ngọt ngào", icon: "🍯", desc: "Giọng nữ trong trẻo, ngọt ngào dễ thương" },
];

export default function HomeChatView({
  initialPrompt,
  initialImages,
  initialModel,
  conversationId: propConversationId,
  projectId,
  selectedAssistant,
  onNewChat,
  onConversationCreated,
  onOpenLoginModal,
}: HomeChatViewProps) {
  const { user, updateUserCredits } = useAuth();
  const activeUserId = user?.id || user?.email || null;
  const { glassStyle } = useWorkspaceBackground();
  const { language, t } = useLanguage();
  const { showAlert, showConfirm } = usePopup();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(initialModel || "fast");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States nâng cấp tính năng mới
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("tong_tai");
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isPromptEnhancing, setIsPromptEnhancing] = useState(false);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const [conversationId, setConversationId] = useState<string | null>(
    propConversationId || null
  );
  const [conversationTitle, setConversationTitle] = useState<string>("Đoạn chat mới");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // State công cụ nhanh được chọn (Dạng ẩn placeholder, không chèn chữ cứng vào khung chat)
  const [activeTool, setActiveTool] = useState<{
    id: string;
    label: string;
    promptPrefix: string;
    placeholder: string;
    isImageGen?: boolean;
    isImageEdit?: boolean;
    isHighlight?: boolean;
  } | null>(null);

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [hideActionNotes, setHideActionNotes] = useState<boolean>(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "up" | "down">>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialSent = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentConvIdRef = useRef<string | null>(null);
  const isSendingRef = useRef(false);

  // Khôi phục model và giọng đọc ưa thích từ localStorage
  useEffect(() => {
    if (initialModel) {
      setSelectedModel(initialModel);
    } else {
      const saved = localStorage.getItem("omni_pref_model");
      if (saved) {
        setSelectedModel(saved);
      }
    }
    const savedVoice = localStorage.getItem("omni_pref_voice");
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, [initialModel]);

  // Click outside listener cho dropdown chọn model và dropdown chọn giọng đọc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
      if (
        voiceDropdownRef.current &&
        !voiceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVoiceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 1. Tải lịch sử cuộc trò chuyện nếu chọn từ sidebar (khác với conversation hiện tại và không đang gửi tin)
  useEffect(() => {
    if (
      propConversationId &&
      propConversationId !== currentConvIdRef.current &&
      !isSendingRef.current
    ) {
      currentConvIdRef.current = propConversationId;
      setConversationId(propConversationId);
      // Chỉ hiện loading nếu chưa có tin nhắn nào hiển thị để tránh chớp màn hình
      if (messages.length === 0) {
        setIsLoadingHistory(true);
      }

      fetch(`/api/conversations/${propConversationId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.messages)) {
            setMessages(data.messages);
            if (data.title) setConversationTitle(data.title);
          }
        })
        .catch((err) => console.error("Lỗi khi tải cuộc trò chuyện:", err))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [propConversationId]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imgs = await extractImagesFromClipboard(e);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgs = await extractImagesFromFileList(e.target.files);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const imgs = await extractImagesFromDrop(e);
    if (imgs.length > 0) {
      setAttachedImages((prev) => [...prev, ...imgs]);
    }
  };

  // Các hành động tương tác với tin nhắn AI
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  useEffect(() => {
    return () => {
      stopVietnameseTTS();
    };
  }, []);

  const detectMessageVoice = (text: string): "tong_tai" | "male" | "female" => {
    if (selectedAssistant) {
      const maleAssistants = [
        "char-tong-tai",
        "char-co-da-than",
        "char-tieu-viem",
        "alex",
        "master-zen",
        "luc-tong",
      ];
      if (maleAssistants.includes(selectedAssistant.id)) return "tong_tai";
    }
    const lower = text.toLowerCase();
    const isTongTaiVibe =
      lower.includes("lục tổng") ||
      lower.includes("tổng tài") ||
      lower.includes("chủ tịch lục") ||
      lower.includes("bảo bối") ||
      lower.includes("tiểu ngốc nghếch") ||
      lower.includes("đại ca") ||
      lower.includes("ngoan ngoãn") ||
      lower.includes("vòng tay ôm") ||
      lower.includes("giọng nói trầm") ||
      lower.includes("cưng chiều") ||
      lower.includes("thâm trầm") ||
      lower.includes("ngực rắn chắc") ||
      lower.includes("anh yêu em") ||
      lower.includes("cô gái nhỏ") ||
      lower.includes("bản tọa") ||
      lower.includes("vi sư") ||
      lower.includes("lục thị");

    if (isTongTaiVibe) return "tong_tai";

    if (lower.startsWith("tôi") || lower.startsWith("anh")) {
      if (lower.includes("em") || lower.includes("cô bé") || lower.includes("người phụ nữ")) {
        return "tong_tai";
      }
    }

    return "female";
  };

  const handleToggleSpeech = (msgId: string, text: string, forcedVoice?: string) => {
    if (speakingMsgId === msgId) {
      stopVietnameseTTS();
      setSpeakingMsgId(null);
      return;
    }
    const voice = forcedVoice || selectedVoice || detectMessageVoice(text);
    setSpeakingMsgId(msgId);
    playVietnameseTTS(msgId, text, {
      voice,
      onStart: () => setSpeakingMsgId(msgId),
      onEnd: () => setSpeakingMsgId(null),
    });
  };

  // 1.1. Nhập liệu bằng giọng nói tiếng Việt (Microphone Speech-to-Text)
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      showAlert(
        "Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp. Hãy sử dụng Chrome hoặc Edge mới nhất.",
        "Thông báo",
        "warning"
      );
      return;
    }

    try {
      type SpeechRecType = new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: any) => void;
        onerror: (e: any) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };

      const SpeechRecClass =
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) as SpeechRecType;

      if (!SpeechRecClass) return;

      if (isListening) {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
        }
        setIsListening(false);
        return;
      }

      const rec = new SpeechRecClass();
      rec.lang = "vi-VN";
      rec.continuous = false;
      rec.interimResults = false;
      speechRecognitionRef.current = rec;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => {
          const next = prev ? `${prev} ${transcript}` : transcript;
          return next;
        });
        setIsListening(false);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
            textareaRef.current.focus();
          }
        }, 50);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Lỗi mic giọng nói:", err);
      setIsListening(false);
    }
  };

  // 1.2. Phù thủy Prompt (Magic Wand): Tối ưu hóa prompt ngắn thành câu lệnh chi tiết
  const handlePromptEnhance = () => {
    if (!inputValue.trim()) {
      setInputValue("Hãy đóng vai trò chuyên gia, phân tích chuyên sâu đa chiều kèm ví dụ thực tế và giải pháp thực thi từng bước cụ thể cho vấn đề: ");
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = "80px";
      }
      return;
    }
    setIsPromptEnhancing(true);
    setTimeout(() => {
      const raw = inputValue.trim();
      const enhanced = `Đóng vai trò là chuyên gia hàng đầu, hãy giải đáp một cách chi tiết, bài bản và chuyên sâu nhất cho yêu cầu sau:\n\n"${raw}"\n\nYêu cầu câu trả lời:\n1. Phân tích bản chất cốt lõi và các góc nhìn đa chiều.\n2. Cung cấp ví dụ thực tế hoặc số liệu dẫn chứng cụ thể.\n3. Lộ trình hoặc các bước hành động rõ ràng, khả thi ngay.\n4. Trình bày khoa học bằng Markdown, bảng biểu hoặc gạch đầu dòng mạch lạc.`;
      setInputValue(enhanced);
      setIsPromptEnhancing(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
        textareaRef.current.focus();
      }
    }, 250);
  };

  // 1.3. Xuất cuộc trò chuyện dạng file Markdown (.md)
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const title = conversationTitle || "Cuoc-tro-chuyen-Biết Tuốt AI";
    let markdown = `# ${title}\n\n`;
    markdown += `*Được xuất từ Biết Tuốt AI vào ${new Date().toLocaleString("vi-VN")}*\n\n---\n\n`;

    messages.forEach((m) => {
      const sender = m.role === "user" ? "👤 **Bạn (User)**" : `🤖 **${m.modelName || (selectedAssistant ? selectedAssistant.name : "Biết Tuốt AI")}**`;
      markdown += `### ${sender}\n\n${m.content}\n\n`;
      if (m.images && m.images.length > 0) {
        m.images.forEach((img, idx) => {
          markdown += `![Hình ảnh ${idx + 1}](${img})\n\n`;
        });
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1.4. Làm mới/Xóa cuộc trò chuyện
  const handleClearChat = async () => {
    const ok = await showConfirm(
      "Bạn có chắc chắn muốn làm mới và xóa toàn bộ nội dung trò chuyện hiện tại không?",
      "Xác nhận làm mới"
    );
    if (ok) {
      setMessages([]);
      setInputValue("");
      setAttachedImages([]);
      onNewChat();
    }
  };

  // 1.5. Chỉnh sửa tin nhắn người dùng (Edit inline & Resend)
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditInputText(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditInputText("");
  };

  const handleSaveAndResend = (msgId: string) => {
    const targetIdx = messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;
    const originalMsg = messages[targetIdx];
    const newText = editInputText.trim();
    if (!newText) return;

    const historyBefore = messages.slice(0, targetIdx);
    setEditingMsgId(null);
    setEditInputText("");
    sendChatMessage(historyBefore, newText, originalMsg.images || []);
  };

  // 1.6. Tự động co giãn Textarea khi nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setMessageFeedback((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined! : type,
    }));
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const handleRegenerate = () => {
    if (isTyping) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[actualIdx];
    const truncatedHistory = messages.slice(0, actualIdx);
    sendChatMessage(truncatedHistory, lastUserMsg.content, lastUserMsg.images || []);
  };

  // 2. Gửi tin nhắn và stream câu trả lời từ AI
  const sendChatMessage = async (
    chatHistory: ChatMessage[],
    userText: string,
    images: string[] = []
  ) => {
    if (!userText.trim() && images.length === 0) return;

    let currentUser = user;
    if (!currentUser && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tool_ai_auth_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && !parsed.id?.startsWith("guest_")) {
            currentUser = parsed;
          }
        }
      } catch {}
    }

    if (!currentUser) {
      onOpenLoginModal?.();
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { id: userMsgId, role: "user", content: userText, images },
      { id: aiMsgId, role: "assistant", content: "" },
    ];

    setMessages(newHistory);
    setIsTyping(true);
    isSendingRef.current = true;
    soundManager.playSendSound();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const targetBotId = selectedAssistant?.id || "omni-assistant";

      const res = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: targetBotId,
          userId: currentUser?.id || currentUser?.email || activeUserId,
          userEmail: currentUser?.email,
          userName: currentUser?.displayName || currentUser?.username,
          conversationId,
          projectId: projectId || undefined,
          model: selectedModel,
          language,
          messages: newHistory
            .filter((m) => m.id !== aiMsgId)
            .map((m) => ({
              role: m.role,
              content: m.content,
              images: m.images,
            })),
        }),
      });

      if (res.status === 401) {
        onOpenLoginModal?.();
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        setIsTyping(false);
        return;
      }

      if (res.status === 403) {
        setIsRechargeModalOpen(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content:
                    "⚠️ **Tài khoản của bạn đã hết Credits.** Vui lòng nạp thêm để tiếp tục trò chuyện và sử dụng các tính năng AI thông minh!",
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

      const modelNameHeader = decodeURIComponent(res.headers.get("X-AI-Model") || "");
      if (modelNameHeader) {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, modelName: modelNameHeader } : m))
        );
      }

      // Cập nhật remaining credits
      const remainingCreditsHeader = res.headers.get("X-Remaining-Credits");
      if (remainingCreditsHeader !== null) {
        updateUserCredits(Number(remainingCreditsHeader));
      }

      const convIdHeader = res.headers.get("X-Conversation-Id");
      if (convIdHeader) {
        currentConvIdRef.current = convIdHeader;
        setConversationId(convIdHeader);

        const uid = currentUser?.id || currentUser?.email || activeUserId;
        if (uid) {
          try {
            const title = userText.slice(0, 30) || (images.length > 0 ? "Hình ảnh tải lên" : "Đoạn chat mới");
            const newSummary = {
              id: convIdHeader,
              title,
              botId: targetBotId,
              botName: selectedAssistant?.name || "Biết Tuốt AI",
              botAvatar: selectedAssistant?.avatar,
              messagesCount: newHistory.length,
              updatedAt: new Date().toISOString(),
            };
            const storageKey = `omni_recent_convs_${uid}`;
            const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
            const filtered = Array.isArray(existing) ? existing.filter((c: any) => c && c.id !== convIdHeader) : [];
            filtered.unshift(newSummary);
            localStorage.setItem(storageKey, JSON.stringify(filtered));
          } catch {}
        }

        if (!conversationId) {
          onConversationCreated?.(convIdHeader);
          setConversationTitle(userText.slice(0, 30) || (images.length > 0 ? "Hình ảnh tải lên" : "Đoạn chat mới"));
        }
      }

      // Đọc Stream
      if (!res.body) throw new Error("Không có response body");

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
            msg.id === aiMsgId ? { ...msg, content: accumulated } : msg
          )
        );
      }

      soundManager.playReceiveSound();
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.log("Người dùng đã dừng phản hồi AI");
        return;
      }
      console.error("Lỗi chat trực tiếp:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content:
                  "Xin lỗi, đã xảy ra lỗi trong quá trình kết nối với AI. Vui lòng thử lại!",
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  // Auto-scroll effect respecting user settings
  useEffect(() => {
    const autoScrollEnabled =
      typeof window !== "undefined"
        ? localStorage.getItem("omni_auto_scroll") !== "false"
        : true;
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. Khởi chạy câu hỏi ban đầu nếu có
  useEffect(() => {
    if (
      (initialPrompt || (initialImages && initialImages.length > 0)) &&
      !isInitialSent.current &&
      !propConversationId
    ) {
      isInitialSent.current = true;
      sendChatMessage([], initialPrompt || "", initialImages || []);
    }
  }, [initialPrompt, initialImages, propConversationId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const sendMode =
      typeof window !== "undefined"
        ? localStorage.getItem("omni_send_mode")
        : "enter";

    if (sendMode === "ctrl_enter") {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleFormSubmit();
      }
    } else {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleFormSubmit();
      }
    }
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputValue.trim() && attachedImages.length === 0) || isTyping) return;

    const rawText = inputValue.trim();
    // Tự động kết hợp tiền tố công cụ nếu người dùng đang chọn chế độ công cụ
    let text = rawText;
    if (activeTool && rawText) {
      text = `${activeTool.promptPrefix}${rawText}`;
    }

    const imgs = [...attachedImages];
    setInputValue("");
    setActiveTool(null);
    setAttachedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendChatMessage(messages, text, imgs);
  };

  return (
    <div className="w-full flex flex-col h-full min-h-0 relative">
      {/* Top Bar: Model info + Conversation Title + New Chat Button */}
      <div className="shrink-0 z-20 py-2 sm:py-2.5 px-3 sm:px-4 lg:pr-[370px] bg-[#f8fafc]/90 dark:bg-[#07080d]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-indigo-950/60 flex items-center justify-between transition-colors mb-2 rounded-2xl w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/30 shrink-0">
            ✦
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                {conversationTitle}
              </span>

              {/* Interactive Model Selector Dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#131522] hover:bg-slate-200 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-indigo-950/70 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                  title="Chọn bộ não AI: ⚡ Suy nghĩ nhanh, 🧠 Suy luận sâu, 🎨 Sáng tạo"
                >
                  <span>{AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.icon || "⚡"}</span>
                  <span>{AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name || "Suy nghĩ nhanh"}</span>
                  <span className="text-[8px] text-slate-400">▼</span>
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 p-1.5 bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60 mb-1 flex items-center justify-between">
                      <span>Bộ não AI</span>
                      <span className="text-[9px] text-cyan-500 font-semibold">Tối ưu & Thông minh</span>
                    </div>
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          localStorage.setItem("omni_pref_model", m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          selectedModel === m.id
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{m.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {selectedModel === m.id && (
                                <span className="text-[10px] text-indigo-500 font-bold">✓</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {m.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ml-1">
                          {m.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {selectedAssistant ? selectedAssistant.name : "Trợ lý trí tuệ nhân tạo toàn năng"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Nút lọc lời thoại / Xem đầy đủ miêu tả cử chỉ */}
          <button
            type="button"
            onClick={() => setHideActionNotes((prev) => !prev)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              !hideActionNotes
                ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-cyan-300 ring-1 ring-indigo-500/20"
                : "bg-slate-100 dark:bg-[#131522] border-slate-200 dark:border-indigo-950/70 text-slate-600 dark:text-slate-400"
            }`}
            title={
              hideActionNotes
                ? "Đang lọc chỉ hiện lời thoại. Bấm để hiển thị đầy đủ toàn bộ nội dung & miêu tả."
                : "Đang hiển thị đầy đủ toàn bộ câu trả lời. Bấm nếu chỉ muốn rút gọn câu thoại."
            }
          >
            <span>{!hideActionNotes ? "📜" : "💬"}</span>
            <span className="hidden sm:inline">
              {!hideActionNotes ? "Đầy đủ nội dung" : "Chỉ lời thoại"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                !hideActionNotes ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsRechargeModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-500 dark:text-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Bấm để nạp thêm credits"
          >
            <span>🪙</span>
            <span>{user?.role === "ADMIN" ? "∞ Credits" : `${user?.credits ?? 0} Credits`}</span>
            {user?.role !== "ADMIN" && (
              <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-black">
                +Nạp
              </span>
            )}
          </button>

          {/* Nút Xuất Cuộc Trò Chuyện */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportChat}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-[#131522] hover:bg-slate-200 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-indigo-950/70 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Tải xuống toàn bộ cuộc trò chuyện dạng file Markdown (.md)"
            >
              <span>📥</span>
              <span className="hidden md:inline">Xuất chat</span>
            </button>
          )}

          {/* Nút Xóa/Làm mới nhanh */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-500 dark:text-rose-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Làm mới và xóa cuộc trò chuyện này"
            >
              <span>🗑️</span>
              <span className="hidden md:inline">Xóa</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewChat}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131522] hover:bg-slate-200 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-indigo-950/70 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>+</span>
            <span className="hidden sm:inline">Đoạn chat mới</span>
          </button>
        </div>
      </div>

      {/* Messages Stream (ChatGPT style) - Vùng cuộn tin nhắn tràn viền */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 sm:px-4 lg:px-6 space-y-6 pb-4 scrollbar-thin w-full">
        {isLoadingHistory && messages.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-slate-400">Đang tải lịch sử tin nhắn...</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`w-full flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "user" ? (
                /* User Bubble & Inline Edit */
                editingMsgId === m.id ? (
                  <div className="w-full max-w-[85%] sm:max-w-[75%] p-3.5 rounded-3xl bg-white dark:bg-[#131522] border border-indigo-400 dark:border-cyan-400 shadow-xl space-y-2.5 animate-in fade-in duration-150">
                    <div className="text-[11px] font-bold text-indigo-600 dark:text-cyan-300 flex items-center gap-1.5">
                      <span>✏️</span>
                      <span>Chỉnh sửa tin nhắn của bạn</span>
                    </div>
                    <textarea
                      rows={3}
                      value={editInputText}
                      onChange={(e) => setEditInputText(e.target.value)}
                      className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-[#0c0e17] text-slate-900 dark:text-white text-xs sm:text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAndResend(m.id)}
                        disabled={!editInputText.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-1"
                      >
                        <span>Lưu & Gửi lại</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative max-w-[85%] sm:max-w-[75%] flex flex-col items-end">
                    <div className="w-full px-5 py-3.5 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/20 leading-relaxed">
                      {m.images && m.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2.5">
                          {m.images.map((imgSrc, idx) => (
                            <div
                              key={idx}
                              className="relative rounded-2xl overflow-hidden border border-white/30 shadow-md max-w-xs group cursor-pointer"
                              onClick={() => window.open(imgSrc, "_blank")}
                              title="Bấm để xem ảnh phóng to"
                            >
                              <img
                                src={imgSrc}
                                alt={`Ảnh đính kèm ${idx + 1}`}
                                className="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {m.content && <div>{m.content}</div>}
                    </div>

                    {/* Quick Action Button for User Message (Edit & Copy) */}
                    {!isTyping && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5 mt-1 pr-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(m)}
                          className="p-1 px-2 rounded-lg bg-slate-200/80 dark:bg-[#1a1c2d] hover:bg-slate-300 dark:hover:bg-indigo-900/50 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Chỉnh sửa câu hỏi này và gửi lại"
                        >
                          <span>✏️</span>
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.id, m.content)}
                          className="p-1 px-2 rounded-lg bg-slate-200/80 dark:bg-[#1a1c2d] hover:bg-slate-300 dark:hover:bg-indigo-900/50 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Sao chép nội dung"
                        >
                          <span>{copiedMsgId === m.id ? "✓" : "📋"}</span>
                          <span>{copiedMsgId === m.id ? "Đã chép" : "Chép"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* AI Response Container */
                <div className="w-full flex gap-3.5 sm:gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/30 mt-0.5">
                    ✦
                  </div>

                  <div
                    className={`flex-1 min-w-0 p-5 rounded-3xl transition-all duration-300 ${
                      glassStyle === "ultra_clear"
                        ? "bg-white/70 dark:bg-[#0c0e17]/75 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-lg"
                        : glassStyle === "deep_solid"
                        ? "bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-800 shadow-sm"
                        : "bg-white/90 dark:bg-[#0c0e17]/95 border border-slate-200/90 dark:border-indigo-950/70 shadow-sm backdrop-blur-md"
                    }`}
                  >
                    {/* Header: Assistant Name and Model Badge */}
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedAssistant ? selectedAssistant.name : "Biết Tuốt AI"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-300 font-semibold border border-indigo-200/50 dark:border-indigo-800/50">
                          {selectedModel === "deep" ? "🧠 Suy luận sâu" : selectedModel === "creative" ? "🎨 Sáng tạo" : "⚡ Suy nghĩ nhanh"}
                        </span>
                      </div>
                    </div>

                    {m.content ? (
                      <div>
                        <MarkdownRenderer content={m.content} hideActionNotes={hideActionNotes} />
                        {m.content.includes("hết Credits") && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => setIsRechargeModalOpen(true)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                            >
                              <span>⚡</span>
                              <span>Nạp Credits Ngay (Từ 10.000đ)</span>
                              <span>➔</span>
                            </button>
                          </div>
                        )}
                        {isTyping && m.id === messages[messages.length - 1]?.id && (
                          <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse rounded-xs align-middle" />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-xs text-slate-400 ml-1">
                          {selectedModel === "deep"
                            ? "Đang suy luận, vui lòng chờ..."
                            : "Đang tạo câu trả lời, vui lòng chờ..."}
                        </span>
                      </div>
                    )}

                    {/* Action Toolbar under AI Response */}
                    {m.content && (
                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/70 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m.id, m.content)}
                            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] font-medium"
                            title="Sao chép câu trả lời"
                          >
                            <span>{copiedMsgId === m.id ? "✓" : "📋"}</span>
                            <span>{copiedMsgId === m.id ? "Đã sao chép!" : "Sao chép"}</span>
                          </button>

                          {/* Speech Synthesis Button & Voice Selector */}
                          <div className="relative flex items-center gap-1" ref={voiceDropdownRef}>
                            <button
                              type="button"
                              onClick={() => handleToggleSpeech(m.id, m.content)}
                              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] font-medium ${
                                speakingMsgId === m.id
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 font-bold shadow-2xs"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                              }`}
                              title={
                                speakingMsgId === m.id
                                  ? "Dừng đọc"
                                  : `Đọc to bằng giọng: ${VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.label || "Nam thần lồng tiếng"}`
                              }
                            >
                              <span>{speakingMsgId === m.id ? "⏹" : "🔊"}</span>
                              <span>{speakingMsgId === m.id ? "Dừng đọc" : "Đọc to"}</span>
                            </button>

                            {/* Dropdown switch voice */}
                            <button
                              type="button"
                              onClick={() => setIsVoiceDropdownOpen((prev) => !prev)}
                              className="px-1.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer border border-slate-200/60 dark:border-slate-800"
                              title="Đổi giọng đọc AI (Nam thần lồng tiếng / Nữ truyền cảm)"
                            >
                              <span>{VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.icon || "🎬"}</span>
                              <span className="hidden sm:inline font-semibold">
                                {VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.label.split(" ")[0] || "Nam thần"}
                              </span>
                              <span className="text-[8px] opacity-70">▼</span>
                            </button>

                            {isVoiceDropdownOpen && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 p-1.5 bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                                  <span>Giọng Đọc Neural</span>
                                  <span className="text-[9px] text-cyan-400 font-normal">Chuẩn phim</span>
                                </div>
                                {VOICE_OPTIONS.map((vo) => (
                                  <button
                                    key={vo.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedVoice(vo.id);
                                      localStorage.setItem("omni_pref_voice", vo.id);
                                      setIsVoiceDropdownOpen(false);
                                      if (speakingMsgId === m.id) {
                                        stopVietnameseTTS();
                                        handleToggleSpeech(m.id, m.content, vo.id);
                                      }
                                    }}
                                    className={`w-full flex items-start gap-2 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                                      selectedVoice === vo.id
                                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-300 font-medium"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    <span className="text-base mt-0.5">{vo.icon}</span>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold flex items-center gap-1">
                                        <span>{vo.label}</span>
                                        {selectedVoice === vo.id && (
                                          <span className="text-[10px] text-indigo-500 font-bold">✓</span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                                        {vo.desc}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Regenerate Button (on last message) */}
                          {m.id === messages[messages.length - 1]?.id && !isTyping && (
                            <button
                              type="button"
                              onClick={handleRegenerate}
                              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] font-medium"
                              title="Tạo lại câu trả lời"
                            >
                              <span>↻</span>
                              <span>Tạo lại</span>
                            </button>
                          )}

                          {/* Thumbs Up / Down */}
                          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-2 ml-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleFeedback(m.id, "up")}
                              className={`p-1 px-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                                messageFeedback[m.id] === "up"
                                  ? "text-emerald-500 bg-emerald-500/10 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                              }`}
                              title="Câu trả lời hữu ích"
                            >
                              👍
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(m.id, "down")}
                              className={`p-1 px-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                                messageFeedback[m.id] === "down"
                                  ? "text-rose-500 bg-rose-500/10 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                              }`}
                              title="Chưa đúng ý"
                            >
                              👎
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Smart Follow-Up Suggestions */}
        {!isTyping && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
          <div className="pt-2 pb-1 pl-11 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <span>✨ Gợi ý câu hỏi tiếp theo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "💡 Giải thích chi tiết hơn kèm ví dụ thực tế",
                "⚖️ Phân tích sâu các ưu và nhược điểm cốt lõi",
                "🚀 Các bước triển khai thực tế tiếp theo là gì?",
                "🔍 Có giải pháp hoặc phương án nào thay thế không?",
              ].map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => sendChatMessage(messages, suggestion)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121422] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/90 dark:border-indigo-950 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-300 transition-all shadow-2xs cursor-pointer flex items-center gap-1 hover:border-indigo-300 dark:hover:border-cyan-500/40 hover:scale-[1.01]"
                >
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isTyping && messages[messages.length - 1]?.role === "user" && (
          <div className="w-full flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/30">
              ✦
            </div>
            <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#0c0e17]/95 border border-slate-200 dark:border-indigo-950/70 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-1">
                {selectedModel === "deep"
                  ? "Đang suy luận, vui lòng chờ..."
                  : "Đang tạo câu trả lời, vui lòng chờ..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pinned Bottom Input Bar (ChatGPT Style) - Luôn ghim cố định ở đáy màn hình */}
      <div className="shrink-0 z-30 w-full pt-1.5 pb-2 sm:pb-3 px-2 sm:px-4 lg:px-6">
        {/* Floating Stop Generating Button */}
        {isTyping && (
          <div className="flex justify-center mb-2 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={handleStopGenerating}
              className="px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white dark:bg-[#171a2a] dark:hover:bg-[#20243b] dark:text-slate-200 border border-slate-700/60 dark:border-indigo-900/80 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-98"
            >
              <span className="w-2 h-2 rounded-xs bg-rose-500 animate-pulse" />
              <span>Dừng tạo câu trả lời</span>
            </button>
          </div>
        )}
        {/* Quick Tool Helpers (Gợi ý ẩn placeholder - Không điền chữ cứng vào khung chat) */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none px-1">
          <span className="text-[11px] text-slate-400 font-bold shrink-0">⚡ Công cụ:</span>
          {[
            {
              id: "image_gen",
              label: "🎨 Tạo hình ảnh",
              promptPrefix: "Vẽ một bức tranh nghệ thuật tuyệt đẹp về: ",
              placeholder: "Mô tả bức tranh bạn muốn vẽ (VD: Hoàng hôn trên biển, anime 3D, Cyberpunk)...",
              isImageGen: true,
              isHighlight: true,
            },
            {
              id: "image_edit",
              label: "🖌️ Sửa hình ảnh",
              promptPrefix: "Hãy chỉnh sửa hình ảnh đính kèm theo phong cách: ",
              placeholder: "Đính kèm ảnh và mô tả cách bạn muốn sửa (VD: đổi nền, phong cách Anime)...",
              isImageEdit: true,
              isHighlight: true,
            },
            {
              id: "compare",
              label: "📊 So sánh đa chiều",
              promptPrefix: "Hãy lập bảng so sánh chi tiết và toàn diện giữa các phương án sau:\n",
              placeholder: "Nhập các phương án hoặc đối tượng cần so sánh đối chiếu...",
            },
            {
              id: "summary",
              label: "📝 Tóm tắt ý chính",
              promptPrefix: "Hãy tóm tắt ngắn gọn, làm nổi bật các luận điểm cốt lõi của nội dung sau:\n",
              placeholder: "Dán bài viết hoặc văn bản dài bạn muốn AI tóm tắt các luận điểm cốt lõi...",
            },
            {
              id: "brainstorm",
              label: "💡 Brainstorm ý tưởng",
              promptPrefix: "Hãy đóng vai trò chuyên gia sáng tạo, brainstorm 7 ý tưởng độc đáo và đột phá nhất cho:\n",
              placeholder: "Nhập chủ đề bạn cần phát triển ý tưởng mới đột phá...",
            },
            {
              id: "code",
              label: "💻 Viết Code sạch",
              promptPrefix: "Hãy viết code sạch, tối ưu hiệu năng và giải thích chi tiết cho bài toán sau:\n",
              placeholder: "Mô tả bài toán lập trình hoặc đoạn code bạn cần tối ưu...",
            },
            {
              id: "translate",
              label: "🌐 Dịch thuật chuẩn",
              promptPrefix: "Hãy dịch chuẩn nghĩa và mượt mà sang tiếng Việt đoạn văn sau:\n",
              placeholder: "Dán đoạn văn bản cần dịch mượt mà sang tiếng Việt...",
            },
            {
              id: "rewrite",
              label: "✨ Viết lại chuyên nghiệp",
              promptPrefix: "Hãy trau chuốt và viết lại đoạn văn sau theo văn phong lịch thiệp, sắc sảo:\n",
              placeholder: "Dán văn bản bạn muốn trau chuốt lại cho chuyên nghiệp, sắc bén...",
            },
          ].map((tool) => {
            const isSelected = activeTool?.id === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setActiveTool(null);
                  } else {
                    setActiveTool(tool);
                    if (tool.isImageEdit) {
                      fileInputRef.current?.click();
                    }
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all shadow-2xs cursor-pointer font-semibold flex items-center gap-1 ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400/50"
                    : tool.isHighlight
                    ? "bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-400/50 dark:border-cyan-400/50 text-indigo-600 dark:text-cyan-300 hover:scale-105"
                    : "bg-white/90 dark:bg-[#131522]/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-cyan-400"
                }`}
              >
                <span>{tool.label}</span>
                {isSelected && <span className="text-[10px] ml-0.5">✕</span>}
              </button>
            );
          })}
        </div>

        {/* Thanh báo chế độ công cụ đang kích hoạt */}
        {activeTool && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 dark:border-cyan-500/30 text-xs font-semibold text-indigo-700 dark:text-cyan-300 w-fit animate-in fade-in duration-150">
            <span>✨ Đang bật: <strong>{activeTool.label}</strong></span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
              — Khung chat đã chuyển sang gợi ý ẩn (Placeholder)
            </span>
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              className="ml-1 px-1.5 py-0.2 rounded-md hover:bg-rose-500 hover:text-white text-slate-400 text-xs transition-colors cursor-pointer"
              title="Hủy chế độ này"
            >
              ✕ Tắt
            </button>
          </div>
        )}

        {/* Attached Images Preview Tray */}
        {attachedImages.length > 0 && (
          <div className="mb-2 p-2.5 rounded-2xl bg-white/95 dark:bg-[#10121d]/95 backdrop-blur-xl border border-indigo-500/30 dark:border-cyan-500/30 flex flex-wrap items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
            {attachedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group w-14 h-14 rounded-xl overflow-hidden border border-indigo-500/40 dark:border-cyan-500/40 shadow-xs"
              >
                <img
                  src={img}
                  alt={`Ảnh đính kèm ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                  title="Xóa ảnh"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <span>📸</span> Đã đính kèm {attachedImages.length} ảnh
            </div>
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`relative p-2.5 sm:p-3 rounded-3xl transition-all duration-300 flex items-end gap-2 shadow-2xl ${
            glassStyle === "ultra_clear"
              ? "bg-white/80 dark:bg-[#0c0e17]/85 backdrop-blur-2xl border border-white/40 dark:border-white/20 shadow-indigo-950/25"
              : glassStyle === "deep_solid"
              ? "bg-white dark:bg-[#0c0e17] border border-slate-300 dark:border-slate-800"
              : "bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-2xl border border-slate-300 dark:border-indigo-950/80 shadow-indigo-950/30"
          }`}
        >
          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mb-1"
            title="Đính kèm hoặc dán hình ảnh (Ctrl+V)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Voice Input (Microphone Speech-to-Text) Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 mb-1 relative ${
              isListening
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse ring-2 ring-rose-400"
                : "text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={
              isListening
                ? "Đang lắng nghe tiếng Việt... Bấm để dừng"
                : "Nói bằng giọng nói tiếng Việt (Microphone)"
            }
          >
            {isListening ? (
              <span className="text-sm">🔴</span>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            rows={2}
            value={inputValue}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTool
                ? activeTool.placeholder
                : typeof window !== "undefined" && localStorage.getItem("omni_send_mode") === "ctrl_enter"
                ? "Hỏi tiếp Biết Tuốt AI, dán ảnh (Ctrl+V)... (Ctrl+Enter để gửi)"
                : "Hỏi tiếp Biết Tuốt AI, dán ảnh (Ctrl+V)... (Enter để gửi)"
            }
            disabled={isTyping}
            className="flex-1 max-h-56 min-h-[54px] sm:min-h-[58px] py-2.5 px-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base leading-relaxed focus:outline-hidden resize-none scrollbar-thin"
          />

          {/* Prompt Enhancer (Magic Wand ✨) */}
          <button
            type="button"
            onClick={handlePromptEnhance}
            disabled={isTyping || isPromptEnhancing}
            className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 mb-1 border ${
              isPromptEnhancing
                ? "bg-indigo-600 text-white animate-spin border-transparent"
                : "border-indigo-500/30 dark:border-cyan-500/30 bg-indigo-500/10 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-300 hover:bg-indigo-500/20 hover:scale-105 shadow-xs"
            }`}
            title="Đũa thần ✨: Nâng cấp câu hỏi ngắn thành Prompt chuẩn chuyên sâu"
          >
            <span className="text-base">✨</span>
          </button>

          <button
            type="submit"
            disabled={(!inputValue.trim() && attachedImages.length === 0) || isTyping}
            className="h-11 px-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 disabled:opacity-30 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 mb-1"
          >
            <span>Gửi</span>
            <span>↑</span>
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
