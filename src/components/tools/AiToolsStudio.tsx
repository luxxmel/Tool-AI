"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import RechargeModal from "@/components/payment/RechargeModal";

export type ToolCategory = "all" | "pro" | "utility";

export type ToolType =
  // ⭐ BỘ CÔNG CỤ CHUYÊN NGHIỆP (PRO)
  | "tiktok_script"
  | "ad_copy"
  | "shopee_seo"
  | "seo_article"
  | "pod_prompt"
  | "digital_product"
  // 🛠️ TIỆN ÍCH VĂN PHÒNG & NỘI DUNG
  | "tts"
  | "summarize"
  | "rewrite"
  | "prompt_craft";

interface ToolMeta {
  id: ToolType;
  name: string;
  nameEn?: string;
  desc: string;
  descEn?: string;
  category: "pro" | "utility";
  icon: string;
  badge?: string;
  badgeEn?: string;
  badgeColor?: string;
  creditsCost: number;
  featureHighlight?: string;
  featureHighlightEn?: string;
}

const TOOLS_LIST: ToolMeta[] = [
  // --- PRO CREATOR & BUSINESS TOOLS ---
  {
    id: "tiktok_script",
    name: "Kịch Bản TikTok / Reels",
    nameEn: "TikTok / Reels Script",
    desc: "Viết kịch bản video ngắn triệu view với phân cảnh và 3s Hook giữ chân",
    descEn: "Craft viral short video scripts with 3s hooks and detailed scene storyboards",
    category: "pro",
    icon: "🎬",
    badge: "PRO • 2 Credits",
    badgeEn: "PRO • 2 Credits",
    badgeColor: "from-rose-500 to-pink-500",
    creditsCost: 2,
    featureHighlight: "Hook 3s giữ chân & Bảng kịch bản phân cảnh B-roll/SFX",
    featureHighlightEn: "3s High-Retention Hook & Storyboard with B-roll/SFX",
  },
  {
    id: "ad_copy",
    name: "Mẫu Quảng Cáo Đa Kênh (Ads)",
    nameEn: "Omnichannel Ad Copy",
    desc: "Viết bài quảng cáo Facebook, TikTok Ads theo chuẩn AIDA, PAS & FAB",
    descEn: "High-converting ad copy for Facebook, TikTok & Google Ads via AIDA, PAS & FAB",
    category: "pro",
    icon: "🛒",
    badge: "PRO • 2 Credits",
    badgeEn: "PRO • 2 Credits",
    badgeColor: "from-amber-500 to-orange-500",
    creditsCost: 2,
    featureHighlight: "3 Tiêu đề giật tít & Lời chào hàng không thể từ chối",
    featureHighlightEn: "3 Catchy Headlines & Irresistible Value Proposition",
  },
  {
    id: "shopee_seo",
    name: "SEO Sàn TMĐT (Shopee/TikTok)",
    nameEn: "E-Commerce SEO (Shopee/TikTok)",
    desc: "Tối ưu tiêu đề, 5 điểm nổi bật và mô tả chuẩn thuật toán sàn TMĐT",
    descEn: "Optimize listing titles, bullet points, and descriptions for marketplace algorithms",
    category: "pro",
    icon: "🛍️",
    badge: "PRO • 2 Credits",
    badgeEn: "PRO • 2 Credits",
    badgeColor: "from-emerald-500 to-teal-500",
    creditsCost: 2,
    featureHighlight: "Tiêu đề chuẩn SEO sàn & Bộ từ khóa LSI đẩy Top",
    featureHighlightEn: "Platform-optimized title & LSI keyword clusters to rank #1",
  },
  {
    id: "seo_article",
    name: "Bài Viết Chuẩn SEO Chuyên Sâu",
    nameEn: "Deep-Dive SEO Article",
    desc: "Tạo bài viết dài chuyên sâu, cấu trúc H2-H4, chuẩn On-Page 100 điểm",
    descEn: "Long-form in-depth articles, H2-H4 structure, 100-score On-Page SEO",
    category: "pro",
    icon: "✍️",
    badge: "PRO • 2 Credits",
    badgeEn: "PRO • 2 Credits",
    badgeColor: "from-blue-500 to-cyan-500",
    creditsCost: 2,
    featureHighlight: "Meta Description, Thẻ Heading & Đánh dấu vị trí Anchor Text",
    featureHighlightEn: "Meta Description, Headings & Anchor text placement notes",
  },
  {
    id: "pod_prompt",
    name: "Thiết Kế Đồ Họa POD & In Ấn",
    nameEn: "POD Graphic Design & Print",
    desc: "Prompt Midjourney v6 & DALL-E 3 chuyên nghiệp cho áo thun, quà tặng",
    descEn: "Midjourney v6 & DALL-E 3 prompts tailored for T-shirts, merch, and gifts",
    category: "pro",
    icon: "💡",
    badge: "PRO • 2 Credits",
    badgeEn: "PRO • 2 Credits",
    badgeColor: "from-purple-500 to-indigo-500",
    creditsCost: 2,
    featureHighlight: "Master Prompt Vector, Negative Prompt & 13 Tags SEO sàn quốc tế",
    featureHighlightEn: "Master Vector Prompt, Negative Prompts & 13 Marketplace SEO Tags",
  },
  {
    id: "digital_product",
    name: "Kế Hoạch Sản Phẩm Số (Blueprint)",
    nameEn: "Digital Product Blueprint",
    desc: "Bản kế hoạch chi tiết đóng gói Ebook, Khóa học mini và lộ trình ra mắt",
    descEn: "Comprehensive blueprint for eBooks, mini-courses, and 7-day launch strategies",
    category: "pro",
    icon: "📚",
    badge: "PRO • 2 Credits",
    badgeEn: "PRO • 2 Credits",
    badgeColor: "from-violet-500 to-fuchsia-500",
    creditsCost: 2,
    featureHighlight: "Định vị giá, Khung chương trình chi tiết & Kế hoạch ra mắt 7 ngày",
    featureHighlightEn: "Pricing strategy, curriculum framework & 7-day launch calendar",
  },

  // --- UTILITY TOOLS ---
  {
    id: "tts",
    name: "Giọng Nói AI (TTS)",
    nameEn: "AI Voice (TTS)",
    desc: "Chuyển văn bản thành giọng đọc tự nhiên hỗ trợ lồng tiếng",
    descEn: "Convert text to natural speech voiceovers in multiple languages",
    category: "utility",
    icon: "🎙️",
    badge: "Cơ bản • 1 Credit",
    badgeEn: "Basic • 1 Credit",
    badgeColor: "from-slate-500 to-slate-600",
    creditsCost: 1,
    featureHighlight: "Phát âm thanh mượt mà trực tiếp trên trình duyệt",
    featureHighlightEn: "Smooth audio playback directly in your browser",
  },
  {
    id: "summarize",
    name: "Tóm Tắt Ý Chính",
    nameEn: "Key Summary",
    desc: "Rút gọn tài liệu dài thành luận điểm cốt lõi trong 3 giây",
    descEn: "Condense lengthy documents and web links into key takeaways in seconds",
    category: "utility",
    icon: "📝",
    badge: "Cơ bản • 1 Credit",
    badgeEn: "Basic • 1 Credit",
    badgeColor: "from-slate-500 to-slate-600",
    creditsCost: 1,
    featureHighlight: "Hỗ trợ 3 chế độ: Gạch đầu dòng, Ngắn gọn, Danh sách việc cần làm",
    featureHighlightEn: "3 modes: Bullet points, Concise summary, Action items",
  },
  {
    id: "rewrite",
    name: "Nâng Tầm Văn Phong",
    nameEn: "Style & Tone Rewriter",
    desc: "Biến đổi câu chữ thành phong cách chuyên nghiệp, thuyết phục",
    descEn: "Transform writing style into professional, persuasive, or casual tone",
    category: "utility",
    icon: "✨",
    badge: "Cơ bản • 1 Credit",
    badgeEn: "Basic • 1 Credit",
    badgeColor: "from-slate-500 to-slate-600",
    creditsCost: 1,
    featureHighlight: "4 Phong cách: Trang trọng, Thuyết phục, Thân thiện, Súc tích",
    featureHighlightEn: "4 Tones: Professional, Persuasive, Casual, Concise",
  },
  {
    id: "prompt_craft",
    name: "Kỹ Sư Prompt Master",
    nameEn: "Prompt Craft Master",
    desc: "Biến ý tưởng thô thành Master Prompt chuẩn kỹ thuật AI",
    descEn: "Transform raw ideas into high-performing engineered Master Prompts",
    category: "utility",
    icon: "🎯",
    badge: "Cơ bản • 1 Credit",
    badgeEn: "Basic • 1 Credit",
    badgeColor: "from-slate-500 to-slate-600",
    creditsCost: 1,
    featureHighlight: "Cấu trúc 6 thành phần: Role, Context, Task, Constraints, Output",
    featureHighlightEn: "6-component architecture: Role, Context, Task, Constraints, Output",
  },
];

const SAMPLE_TEXTS = {
  tiktok_script: "Review tai nghe Bluetooth chụp tai chống ồn chủ động giá 299k, bass căng, pin 35 tiếng, kèm mic lọc ồn học online cho sinh viên",
  ad_copy: "Kem dưỡng ẩm phục hồi da mụn rau má B5, giảm đỏ sau 24h, bảo vệ hàng rào da, tặng kèm 1 chai sữa rửa mặt mini trị giá 99k",
  shopee_seo: "Bình giữ nhiệt inox 316 hiển thị nhiệt độ cảm ứng thông minh 500ml giữ nóng 12h giữ lạnh 24h chống rò rỉ",
  seo_article: "Top 7 công cụ AI tối ưu hóa năng suất và tự động hóa quy trình làm việc hiệu quả nhất năm 2026",
  pod_prompt: "Một chú mèo phi hành gia vintage uống trà boba ngoài không gian, phong cách retro vector 90s cho áo thun",
  digital_product: "Cẩm nang hướng dẫn xây kênh nội dung video ngắn từ 0 đến 100k người theo dõi và phát triển thương hiệu cá nhân",
  tts: "Chào mừng bạn đến với omni.ai! Đây là nền tảng trí tuệ nhân tạo thế hệ mới, hỗ trợ tối đa công việc sáng tạo và kinh doanh online.",
  summarize: "Trí tuệ nhân tạo (AI) đang phát triển với tốc độ chóng mặt, định hình lại cách con người làm việc và sáng tạo. Các mô hình ngôn ngữ lớn (LLM) ngày nay giúp người làm nội dung, chủ shop và lập trình viên nhân bản năng suất gấp 10 lần. Nắm bắt và ứng dụng các công cụ AI chuyên sâu sẽ là chìa khóa bứt phá hiệu suất công việc trong kỷ nguyên số.",
  rewrite: "Chào anh, bên em đã gửi báo giá qua mail rồi á, anh check giùm em nha. Có gì thắc mắc cứ nhắn lại em hỗ trợ liền cho anh nha.",
  prompt_craft: "Tạo kế hoạch marketing 30 ngày cho một quán cà phê phong cách vintage mới mở ở Đà Lạt",
};

export default function AiToolsStudio() {
  const { user, updateUserCredits } = useAuth();
  const { language, t } = useLanguage();
  const { showError, showAlert } = usePopup();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("pro");
  const [activeTool, setActiveTool] = useState<ToolType>("tiktok_script");

  // State TikTok Script
  const [tiktokTopic, setTiktokTopic] = useState(SAMPLE_TEXTS.tiktok_script);
  const [tiktokNiche, setTiktokNiche] = useState<string>("ecommerce");
  const [tiktokTone, setTiktokTone] = useState<string>("relatable");
  const [tiktokResult, setTiktokResult] = useState<string>("");
  const [isGeneratingTiktok, setIsGeneratingTiktok] = useState(false);

  // State Ad Copy
  const [adText, setAdText] = useState(SAMPLE_TEXTS.ad_copy);
  const [adPlatform, setAdPlatform] = useState<string>("Facebook");
  const [adFramework, setAdFramework] = useState<string>("AIDA");
  const [adResult, setAdResult] = useState<string>("");
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);

  // State Shopee SEO
  const [shopeeProduct, setShopeeProduct] = useState(SAMPLE_TEXTS.shopee_seo);
  const [shopeePlatform, setShopeePlatform] = useState<string>("Shopee");
  const [shopeeResult, setShopeeResult] = useState<string>("");
  const [isGeneratingShopee, setIsGeneratingShopee] = useState(false);

  // State SEO Article
  const [seoKeyword, setSeoKeyword] = useState(SAMPLE_TEXTS.seo_article);
  const [seoType, setSeoType] = useState<string>("review_affiliate");
  const [seoResult, setSeoResult] = useState<string>("");
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

  // State POD Prompt
  const [podIdea, setPodIdea] = useState(SAMPLE_TEXTS.pod_prompt);
  const [podStyle, setPodStyle] = useState<string>("vintage_tshirt");
  const [podResult, setPodResult] = useState<string>("");
  const [isGeneratingPod, setIsGeneratingPod] = useState(false);

  // State Digital Product
  const [digTopic, setDigTopic] = useState(SAMPLE_TEXTS.digital_product);
  const [digFormat, setDigFormat] = useState<string>("ebook");
  const [digResult, setDigResult] = useState<string>("");
  const [isGeneratingDig, setIsGeneratingDig] = useState(false);

  // State TTS
  const [ttsText, setTtsText] = useState(SAMPLE_TEXTS.tts);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // State Summarizer
  const [summarizeText, setSummarizeText] = useState(SAMPLE_TEXTS.summarize);
  const [summarizeMode, setSummarizeMode] = useState<"bullets" | "short" | "action_items">("bullets");
  const [summarizeResult, setSummarizeResult] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // State Rewriter
  const [rewriteText, setRewriteText] = useState(SAMPLE_TEXTS.rewrite);
  const [rewriteTone, setRewriteTone] = useState<"professional" | "persuasive" | "casual" | "concise">("professional");
  const [rewriteResult, setRewriteResult] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState(false);

  // State Prompt Crafter
  const [promptIdea, setPromptIdea] = useState(SAMPLE_TEXTS.prompt_craft);
  const [targetAI, setTargetAI] = useState<string>("ChatGPT / Claude");
  const [promptResult, setPromptResult] = useState<string>("");
  const [isCrafting, setIsCrafting] = useState(false);

  // Progress bar loading state for tool generation
  const [progress, setProgress] = useState(0);

  const isAnyGenerating =
    isGeneratingTiktok ||
    isGeneratingAd ||
    isGeneratingShopee ||
    isGeneratingSeo ||
    isGeneratingPod ||
    isGeneratingDig ||
    isSummarizing ||
    isRewriting ||
    isCrafting;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnyGenerating) {
      setProgress(5);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return 92;
          const diff = Math.random() * 8 + 3;
          return Math.min(92, prev + diff);
        });
      }, 250);
    } else {
      if (progress > 0) {
        setProgress(100);
        const timer = setTimeout(() => {
          setProgress(0);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
    return () => clearInterval(interval);
  }, [isAnyGenerating]);

  // Persistent History State for each tool (stored in sessionStorage)
  interface HistoryItem {
    id: string;
    toolId: ToolType;
    input: string;
    result: string;
    timestamp: string;
  }
  const [toolHistory, setToolHistory] = useState<Record<string, HistoryItem[]>>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const storedHistory = sessionStorage.getItem("omni_tools_history");
      if (storedHistory) setToolHistory(JSON.parse(storedHistory));

      const storedResults = sessionStorage.getItem("omni_tools_results");
      if (storedResults) {
        const parsed = JSON.parse(storedResults);
        if (parsed.tiktok) setTiktokResult(parsed.tiktok);
        if (parsed.ad) setAdResult(parsed.ad);
        if (parsed.shopee) setShopeeResult(parsed.shopee);
        if (parsed.seo) setSeoResult(parsed.seo);
        if (parsed.pod) setPodResult(parsed.pod);
        if (parsed.dig) setDigResult(parsed.dig);
        if (parsed.summarize) setSummarizeResult(parsed.summarize);
        if (parsed.rewrite) setRewriteResult(parsed.rewrite);
        if (parsed.prompt) setPromptResult(parsed.prompt);
      }
    } catch (e) {
      console.error("Lỗi khi đọc lịch sử tool từ sessionStorage:", e);
    }
  }, []);

  // Helper save result & history to sessionStorage
  const saveToolResult = (toolId: ToolType, input: string, result: string) => {
    try {
      // Update sessionStorage results
      const storedResults = sessionStorage.getItem("omni_tools_results");
      const currentResults = storedResults ? JSON.parse(storedResults) : {};
      const keyMap: Record<string, string> = {
        tiktok_script: "tiktok",
        ad_copy: "ad",
        shopee_seo: "shopee",
        seo_article: "seo",
        pod_prompt: "pod",
        digital_product: "dig",
        summarize: "summarize",
        rewrite: "rewrite",
        prompt_craft: "prompt",
      };
      const key = keyMap[toolId] || toolId;
      currentResults[key] = result;
      sessionStorage.setItem("omni_tools_results", JSON.stringify(currentResults));

      // Update history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        toolId,
        input,
        result,
        timestamp: new Date().toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      setToolHistory((prev) => {
        const prevList = prev[toolId] || [];
        const updated = { ...prev, [toolId]: [newItem, ...prevList].slice(0, 20) };
        sessionStorage.setItem("omni_tools_history", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("Lỗi khi lưu lịch sử tool:", e);
    }
  };

  const clearCurrentToolResult = (toolId: ToolType) => {
    try {
      const storedResults = sessionStorage.getItem("omni_tools_results");
      if (storedResults) {
        const currentResults = JSON.parse(storedResults);
        const keyMap: Record<string, string> = {
          tiktok_script: "tiktok",
          ad_copy: "ad",
          shopee_seo: "shopee",
          seo_article: "seo",
          pod_prompt: "pod",
          digital_product: "dig",
          summarize: "summarize",
          rewrite: "rewrite",
          prompt_craft: "prompt",
        };
        delete currentResults[keyMap[toolId] || toolId];
        sessionStorage.setItem("omni_tools_results", JSON.stringify(currentResults));
      }
    } catch (e) {}

    if (toolId === "tiktok_script") setTiktokResult("");
    if (toolId === "ad_copy") setAdResult("");
    if (toolId === "shopee_seo") setShopeeResult("");
    if (toolId === "seo_article") setSeoResult("");
    if (toolId === "pod_prompt") setPodResult("");
    if (toolId === "digital_product") setDigResult("");
    if (toolId === "summarize") setSummarizeResult("");
    if (toolId === "rewrite") setRewriteResult("");
    if (toolId === "prompt_craft") setPromptResult("");
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyBtnLabel = (key: string, viLabel: string, enLabel: string = "Copy") => {
    if (copiedKey === key) return language === "en" ? "✓ Copied!" : "✓ Đã sao chép!";
    return language === "en" ? `📋 ${enLabel}` : `📋 ${viLabel}`;
  };

  // Helper generic API caller
  const callToolApi = async (action: string, text: string, options: any) => {
    const meta = TOOLS_LIST.find((t) => t.id === action);
    const cost = meta?.creditsCost ?? 1;

    if (user && user.role !== "ADMIN" && (user.credits ?? 0) < cost) {
      setIsRechargeOpen(true);
      throw new Error(
        language === "en"
          ? `You need at least ${cost} Credits to run this tool. Current balance: ${user.credits ?? 0} Credits. Please recharge!`
          : `Bạn cần ít nhất ${cost} Credits để thực hiện tác vụ này. Số dư hiện tại: ${user.credits ?? 0} Credits. Vui lòng nạp thêm!`
      );
    }

    const res = await fetch("/api/tools/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text, options, userId: user?.id, language }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "INSUFFICIENT_CREDITS") {
        setIsRechargeOpen(true);
      }
      throw new Error(data.error || "Không thể xử lý yêu cầu lúc này");
    }

    if (typeof data.remainingCredits === "number" && updateUserCredits) {
      updateUserCredits(data.remainingCredits);
    }

    return data.result;
  };

  // 1. TikTok Script Handler
  const handleGenerateTiktok = async () => {
    if (!tiktokTopic.trim() || isGeneratingTiktok) return;
    setIsGeneratingTiktok(true);
    try {
      const res = await callToolApi("tiktok_script", tiktokTopic, { niche: tiktokNiche, tone: tiktokTone });
      setTiktokResult(res);
      saveToolResult("tiktok_script", tiktokTopic, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsGeneratingTiktok(false);
    }
  };

  // 2. Ad Copy Handler
  const handleGenerateAd = async () => {
    if (!adText.trim() || isGeneratingAd) return;
    setIsGeneratingAd(true);
    try {
      const res = await callToolApi("ad_copy", adText, { platform: adPlatform, framework: adFramework });
      setAdResult(res);
      saveToolResult("ad_copy", adText, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsGeneratingAd(false);
    }
  };

  // 3. Shopee SEO Handler
  const handleGenerateShopee = async () => {
    if (!shopeeProduct.trim() || isGeneratingShopee) return;
    setIsGeneratingShopee(true);
    try {
      const res = await callToolApi("shopee_seo", shopeeProduct, { platform: shopeePlatform });
      setShopeeResult(res);
      saveToolResult("shopee_seo", shopeeProduct, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsGeneratingShopee(false);
    }
  };

  // 4. SEO Article Handler
  const handleGenerateSeo = async () => {
    if (!seoKeyword.trim() || isGeneratingSeo) return;
    setIsGeneratingSeo(true);
    try {
      const res = await callToolApi("seo_article", seoKeyword, { articleType: seoType });
      setSeoResult(res);
      saveToolResult("seo_article", seoKeyword, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  // 5. POD Prompt Handler
  const handleGeneratePod = async () => {
    if (!podIdea.trim() || isGeneratingPod) return;
    setIsGeneratingPod(true);
    try {
      const res = await callToolApi("pod_prompt", podIdea, { style: podStyle });
      setPodResult(res);
      saveToolResult("pod_prompt", podIdea, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsGeneratingPod(false);
    }
  };

  // 6. Digital Product Handler
  const handleGenerateDig = async () => {
    if (!digTopic.trim() || isGeneratingDig) return;
    setIsGeneratingDig(true);
    try {
      const res = await callToolApi("digital_product", digTopic, { productFormat: digFormat });
      setDigResult(res);
      saveToolResult("digital_product", digTopic, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsGeneratingDig(false);
    }
  };

  // 7. TTS Handlers
  const handlePlayTTS = () => {
    if (!("speechSynthesis" in window)) {
      showAlert("Trình duyệt không hỗ trợ Text-to-Speech", "Lưu ý", "warning");
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }
    window.speechSynthesis.cancel();
    if (!ttsText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTTS = () => {
    if ("speechSynthesis" in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStopTTS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // 8. Summarize Handler
  const handleSummarize = async () => {
    if (!summarizeText.trim() || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const res = await callToolApi("summarize", summarizeText, { mode: summarizeMode });
      setSummarizeResult(res);
      saveToolResult("summarize", summarizeText, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  // 9. Rewrite Handler
  const handleRewrite = async () => {
    if (!rewriteText.trim() || isRewriting) return;
    setIsRewriting(true);
    try {
      const res = await callToolApi("rewrite", rewriteText, { tone: rewriteTone });
      setRewriteResult(res);
      saveToolResult("rewrite", rewriteText, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsRewriting(false);
    }
  };

  // 10. Prompt Craft Handler
  const handleCraftPrompt = async () => {
    if (!promptIdea.trim() || isCrafting) return;
    setIsCrafting(true);
    try {
      const res = await callToolApi("prompt_craft", promptIdea, { targetAI });
      setPromptResult(res);
      saveToolResult("prompt_craft", promptIdea, res);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setIsCrafting(false);
    }
  };

  const filteredTools = TOOLS_LIST.filter((tool) => {
    if (activeCategory === "all") return true;
    return tool.category === activeCategory;
  });

  const activeToolMeta = TOOLS_LIST.find((t) => t.id === activeTool) || TOOLS_LIST[0];

  return (
    <div className="w-full max-w-[1100px] mx-auto flex flex-col pb-20 px-2 sm:px-4">
      {/* Studio Header & Navigation Bar */}
      <div className="w-full mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Title & Branding */}
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-600/20 ring-1 ring-white/20 shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {language === "en" ? "Creative & Business AI Studio" : "Studio Sáng Tạo & Doanh Nghiệp"}
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 tracking-wide uppercase">
                  PRO STUDIO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {language === "en"
                  ? "Specialized AI toolset for Content Creators, Sellers & Marketers"
                  : "Bộ công cụ AI chuyên sâu dành cho Content Creator, Nhà bán hàng & Marketer"}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Credits & Tabs */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* User Credits Status & Recharge Button */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-[#131525] border border-slate-200 dark:border-slate-800/90 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Credits:</span>
              <span className="text-xs font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                ⚡ {user ? (user.role === "ADMIN" ? (language === "en" ? "Unlimited" : "Vô hạn") : (user.credits ?? 0)) : 0}
              </span>
              <button
                onClick={() => setIsRechargeOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer ml-1 active:scale-95"
              >
                {language === "en" ? "+ Recharge" : "+ Nạp thêm"}
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-[#131525] border border-slate-200 dark:border-slate-800/90">
              <button
                onClick={() => setActiveCategory("pro")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === "pro"
                    ? "bg-white dark:bg-[#1c1f36] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-900/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "en" ? "Chuyên Nghiệp (6)" : "Chuyên Nghiệp (6)"}
              </button>
              <button
                onClick={() => setActiveCategory("utility")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === "utility"
                    ? "bg-white dark:bg-[#1c1f36] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-900/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "en" ? "Tiện Ích (4)" : "Tiện Ích (4)"}
              </button>
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-white dark:bg-[#1c1f36] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-indigo-900/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {language === "en" ? "Tất Cả (10)" : "Tất Cả (10)"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {filteredTools.map((tool) => {
          const isActive = activeTool === tool.id;
          const toolName = language === "en" && tool.nameEn ? tool.nameEn : tool.name;
          const toolDesc = language === "en" && tool.descEn ? tool.descEn : tool.desc;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isActive
                  ? "bg-white dark:bg-[#141728] border-indigo-500 dark:border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "bg-white/80 dark:bg-[#0c0e17]/80 hover:bg-white dark:hover:bg-[#131524] border-slate-200/90 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 group-hover:scale-105 transition-transform">
                    {tool.icon}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      tool.category === "pro"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tool.creditsCost} Credits
                  </span>
                </div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {toolName}
                </span>
              </div>

              <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 line-clamp-2 font-normal leading-relaxed">
                {toolDesc}
              </span>
            </button>
          );
        })}
      </div>

      {/* TOOL WORKBENCH CONTAINER */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e101c] backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl shadow-slate-950/5 relative overflow-hidden">
        {/* Animated Horizontal Loading Progress Bar */}
        {(isAnyGenerating || progress > 0) && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800/80 overflow-hidden z-20">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Active Tool Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-3 rounded-2xl bg-indigo-50 dark:bg-[#181b2e] border border-indigo-100 dark:border-indigo-950/50 shadow-2xs">
              {activeToolMeta.icon}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === "en" && activeToolMeta.nameEn ? activeToolMeta.nameEn : activeToolMeta.name}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                  {activeToolMeta.creditsCost} Credits / lượt
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === "en" && activeToolMeta.descEn ? activeToolMeta.descEn : activeToolMeta.desc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Lịch sử button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📜</span>
              <span>{language === "en" ? "History" : "Lịch sử công cụ"}</span>
              {toolHistory[activeTool]?.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold">
                  {toolHistory[activeTool].length}
                </span>
              )}
            </button>

            {/* Clear / New run button */}
            <button
              onClick={() => clearCurrentToolResult(activeTool)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title={language === "en" ? "Clear result & start new" : "Xóa kết quả hiện tại để tạo mới"}
            >
              <span>✨</span>
              <span>{language === "en" ? "Tạo mới" : "Tạo kết quả mới"}</span>
            </button>
          </div>
        </div>

        {/* 1. TIKTOK / REELS SCRIPT */}
        {activeTool === "tiktok_script" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ngách nội dung (Niche):
                </label>
                <select
                  value={tiktokNiche}
                  onChange={(e) => setTiktokNiche(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="ecommerce">🛒 Bán hàng Shopee / TikTok Shop</option>
                  <option value="review">⭐ Đánh giá & Review sản phẩm thực tế</option>
                  <option value="finance">📈 Quản lý tài chính & Đầu tư thông minh</option>
                  <option value="tips">💡 Mẹo vặt công nghệ & Cuộc sống</option>
                  <option value="story">🎭 Kể chuyện & Tình huống kịch tính</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phong cách / Giọng điệu:
                </label>
                <select
                  value={tiktokTone}
                  onChange={(e) => setTiktokTone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="relatable">🤝 Gần gũi, chân thật như người bạn</option>
                  <option value="humorous">😂 Hài hước, châm biếm duyên dáng</option>
                  <option value="expert">🧠 Chuyên gia sắc bén, số liệu tin cậy</option>
                  <option value="drama">🔥 Kịch tính, tò mò gây sốc từ đầu</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chủ đề hoặc Sản phẩm cần viết kịch bản:
                </label>
                <button
                  type="button"
                  onClick={() => setTiktokTopic(SAMPLE_TEXTS.tiktok_script)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                >
                  {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
                </button>
              </div>
              <textarea
                value={tiktokTopic}
                onChange={(e) => setTiktokTopic(e.target.value)}
                rows={3}
                placeholder="Nhập tên sản phẩm, các tính năng nổi bật, giá bán hoặc thông điệp chính..."
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {isGeneratingTiktok ? (
                <div className="flex-1 w-full bg-slate-100 dark:bg-[#131525] p-2.5 rounded-xl border border-indigo-500/30 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-500 dark:text-cyan-400 font-mono w-10 text-right">
                    {Math.round(progress)}%
                  </span>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleGenerateTiktok}
                disabled={isGeneratingTiktok || !tiktokTopic.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span>{isGeneratingTiktok ? "Đang xử lý..." : "🎬 Sinh Kịch Bản Triệu View"}</span>
              </button>
            </div>

            {tiktokResult && (
              <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{language === "en" ? "✨ Generated Script:" : "✨ Kịch bản hoàn chỉnh:"}</span>
                  </h3>
                  <button
                    onClick={() => handleCopy(tiktokResult, "tiktok")}
                    className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                  >
                    {copyBtnLabel("tiktok", "Sao chép kịch bản", "Copy Script")}
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#131522] border border-slate-200/80 dark:border-slate-800/80 max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={tiktokResult} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. AD COPYWRITER */}
        {activeTool === "ad_copy" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nền tảng chạy Ads:
                </label>
                <select
                  value={adPlatform}
                  onChange={(e) => setAdPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Facebook">📘 Facebook Ads (Đầy đủ tiêu đề & bài viết dài)</option>
                  <option value="TikTok">🎵 TikTok Ads (Ngắn gọn, kích thích hành động ngay)</option>
                  <option value="Google">🔍 Google Search Ads (Tập trung từ khóa & lợi ích)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô hình Copywriting:
                </label>
                <select
                  value={adFramework}
                  onChange={(e) => setAdFramework(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="AIDA">⚡ AIDA (Attention - Interest - Desire - Action)</option>
                  <option value="PAS">🎯 PAS (Problem - Agitate - Solution)</option>
                  <option value="BAB">🌉 BAB (Before - After - Bridge)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thông tin sản phẩm, ưu đãi và cam kết:
                </label>
                <button
                  type="button"
                  onClick={() => setAdText(SAMPLE_TEXTS.ad_copy)}
                  className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
                </button>
              </div>
              <textarea
                value={adText}
                onChange={(e) => setAdText(e.target.value)}
                rows={3}
                placeholder="Nhập tên sản phẩm, công dụng, quà tặng kèm, giá giảm hoặc đối tượng khách hàng..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateAd}
                disabled={isGeneratingAd || !adText.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isGeneratingAd ? "Đang viết mẫu quảng cáo..." : "🛒 Viết Mẫu Quảng Cáo Ra Đơn"}</span>
              </button>
            </div>

            {adResult && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-indigo-950/70">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === "en" ? "🎯 High-Converting Ad Copy Collection:" : "🎯 Bộ mẫu bài quảng cáo chuyển đổi cao:"}
                  </h3>
                  <button
                    onClick={() => handleCopy(adResult, "ad")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    {copyBtnLabel("ad", "Sao chép bài viết", "Copy Ad Copy")}
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={adResult} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SHOPEE & TIKTOK SHOP SEO */}
        {activeTool === "shopee_seo" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn sàn Thương mại điện tử:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Shopee", label: "🟠 Shopee Top 1", icon: "🛒" },
                  { id: "TikTok Shop", label: "🎵 TikTok Shop", icon: "📦" },
                  { id: "Lazada", label: "🔵 Lazada Mall", icon: "🏪" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShopeePlatform(s.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      shopeePlatform === s.id
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thông tin sản phẩm cần tối ưu:
                </label>
                <button
                  type="button"
                  onClick={() => setShopeeProduct(SAMPLE_TEXTS.shopee_seo)}
                  className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
                </button>
              </div>
              <textarea
                value={shopeeProduct}
                onChange={(e) => setShopeeProduct(e.target.value)}
                rows={3}
                placeholder="Nhập tên sản phẩm thô, thương hiệu, chất liệu, dung tích, quà tặng kèm..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateShopee}
                disabled={isGeneratingShopee || !shopeeProduct.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isGeneratingShopee ? "Đang tối ưu chuẩn SEO..." : "🛍️ Tối Ưu SEO & Tăng Đơn Sàn"}</span>
              </button>
            </div>

            {shopeeResult && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-indigo-950/70">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === "en" ? "🏷️ E-Commerce SEO Title & Description:" : "🏷️ Bộ tiêu đề & Mô tả sản phẩm chuẩn SEO:"}
                  </h3>
                  <button
                    onClick={() => handleCopy(shopeeResult, "shopee")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    {copyBtnLabel("shopee", "Sao chép mô tả", "Copy SEO Copy")}
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={shopeeResult} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SEO CONTENT & AFFILIATE ARTICLE */}
        {activeTool === "seo_article" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === "en" ? "Article Category:" : "Thể loại bài viết:"}
              </label>
              <select
                value={seoType}
                onChange={(e) => setSeoType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              >
                <option value="review_affiliate">⭐ {language === "en" ? "Product review with affiliate link placements" : "Đánh giá sản phẩm kèm vị trí link Affiliate"}</option>
                <option value="top_list">🏆 {language === "en" ? "Best-of listicle (High CTR)" : "Danh sách Top sản phẩm tốt nhất (High CTR)"}</option>
                <option value="how_to">📖 {language === "en" ? "Step-by-step actionable guide" : "Hướng dẫn chi tiết từng bước (Step-by-step)"}</option>
                <option value="deep_guide">💎 {language === "en" ? "Comprehensive A-Z beginner handbook" : "Cẩm nang toàn diện A-Z cho người mới"}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Primary Keyword & Topic:" : "Từ khóa chính (Primary Keyword) & Chủ đề:"}
                </label>
                <button
                  type="button"
                  onClick={() => setSeoKeyword(SAMPLE_TEXTS.seo_article)}
                  className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
                </button>
              </div>
              <textarea
                value={seoKeyword}
                onChange={(e) => setSeoKeyword(e.target.value)}
                rows={3}
                placeholder={language === "en" ? "Enter the target SEO keyword you want to rank on Google..." : "Nhập từ khóa SEO chính bạn muốn xếp hạng Top Google..."}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateSeo}
                disabled={isGeneratingSeo || !seoKeyword.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isGeneratingSeo ? (language === "en" ? "Writing SEO article..." : "Đang viết bài chuẩn SEO...") : (language === "en" ? "✍️ Generate In-Depth SEO Article" : "✍️ Tạo Bài Viết Chuẩn SEO Chuyên Sâu")}</span>
              </button>
            </div>

            {seoResult && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-indigo-950/70">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === "en" ? "📑 On-Page SEO Article:" : "📑 Bài viết chuẩn SEO On-page:"}
                  </h3>
                  <button
                    onClick={() => handleCopy(seoResult, "seo")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    {copyBtnLabel("seo", "Sao chép bài viết", "Copy Article")}
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={seoResult} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. PRINT ON DEMAND / MIDJOURNEY */}
        {activeTool === "pod_prompt" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === "en" ? "Graphic Style:" : "Phong cách đồ họa (Style):"}
              </label>
              <select
                value={podStyle}
                onChange={(e) => setPodStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              >
                <option value="vintage_tshirt">👕 {language === "en" ? "Vintage Retro 90s T-Shirt (Top Bestseller)" : "Vintage Retro 90s T-Shirt (Áo thun cổ điển bán chạy nhất)"}</option>
                <option value="chibi_sticker">✨ {language === "en" ? "3D Chibi Sticker (Cute character stickers)" : "3D Chibi Sticker (Miếng dán hình dễ thương)"}</option>
                <option value="vector_logo">🎯 {language === "en" ? "Vector Sharp Graphic (Isolated background)" : "Vector Sharp Graphic (Đồ họa nét mảnh tách nền)"}</option>
                <option value="watercolor">🎨 {language === "en" ? "Watercolor Art (Mugs & Canvas prints)" : "Watercolor Art (Tranh màu nước in cốc ly & tranh canvas)"}</option>
                <option value="cyberpunk">⚡ {language === "en" ? "Cyberpunk Neon Graphic (Vibrant futuristic)" : "Cyberpunk Neon Graphic (Đồ họa tương lai rực rỡ)"}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Print Design Concept:" : "Ý tưởng thiết kế hình in:"}
                </label>
                <button
                  type="button"
                  onClick={() => setPodIdea(SAMPLE_TEXTS.pod_prompt)}
                  className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
                </button>
              </div>
              <textarea
                value={podIdea}
                onChange={(e) => setPodIdea(e.target.value)}
                rows={3}
                placeholder={language === "en" ? "Enter subject, character, action, or slogan..." : "Nhập ý tưởng chủ thể, nhân vật, hành động, hoặc slogan..."}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGeneratePod}
                disabled={isGeneratingPod || !podIdea.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isGeneratingPod ? (language === "en" ? "Generating Prompt..." : "Đang tạo Prompt...") : (language === "en" ? "💡 Generate Midjourney POD Prompt" : "💡 Tạo Prompt Midjourney POD Bán Hàng")}</span>
              </button>
            </div>

            {podResult && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-indigo-950/70">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === "en" ? "🎨 Master Prompt & SEO Tags for Etsy / Amazon:" : "🎨 Master Prompt & SEO Tags cho Etsy / Amazon:"}
                  </h3>
                  <button
                    onClick={() => handleCopy(podResult, "pod")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    {copyBtnLabel("pod", "Sao chép Prompt", "Copy Prompt")}
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={podResult} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. DIGITAL PRODUCT & EBOOK BLUEPRINT */}
        {activeTool === "digital_product" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === "en" ? "Digital Product Format:" : "Định dạng sản phẩm số:"}
              </label>
              <select
                value={digFormat}
                onChange={(e) => setDigFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              >
                <option value="ebook">📖 {language === "en" ? "eBook (Pre-packaged PDF book)" : "Sách điện tử (Ebook PDF đóng gói sẵn)"}</option>
                <option value="mini_course">🎥 {language === "en" ? "5-Day Mini Course (High Value)" : "Khóa học Mini 5 ngày (High Value Mini-course)"}</option>
                <option value="notion_template">📋 {language === "en" ? "Notion Template Suite" : "Bộ Template Notion quản lý & quy trình"}</option>
                <option value="checklist_toolkit">🧰 {language === "en" ? "Checklist & Action Plan Toolkit" : "Bộ công cụ Checklist & Action Plan thực chiến"}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === "en" ? "Topic or Skill to Package & Monetize:" : "Chủ đề hoặc Kỹ năng bạn muốn đóng gói bán:"}
                </label>
                <button
                  type="button"
                  onClick={() => setDigTopic(SAMPLE_TEXTS.digital_product)}
                  className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
                </button>
              </div>
              <textarea
                value={digTopic}
                onChange={(e) => setDigTopic(e.target.value)}
                rows={3}
                placeholder={language === "en" ? "Enter your expertise, skills, or workflows..." : "Nhập kiến thức, kinh nghiệm hoặc kỹ năng bạn muốn đóng gói thành sản phẩm số..."}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white focus:border-violet-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateDig}
                disabled={isGeneratingDig || !digTopic.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isGeneratingDig ? (language === "en" ? "Drafting blueprint..." : "Đang lên khung sản phẩm...") : (language === "en" ? "📚 Generate Product Blueprint" : "📚 Lên Bản Thiết Kế Sản Phẩm Số")}</span>
              </button>
            </div>

            {digResult && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-indigo-950/70">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === "en" ? "📑 Detailed Blueprint & Launch Roadmap:" : "📑 Bản thiết kế chi tiết sản phẩm số & Lộ trình triển khai:"}
                  </h3>
                  <button
                    onClick={() => handleCopy(digResult, "dig")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    {copyBtnLabel("dig", "Sao chép đề cương", "Copy Blueprint")}
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={digResult} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. TEXT TO SPEECH (TTS) */}
        {activeTool === "tts" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chuyển văn bản thành giọng đọc (Text-to-Speech)
                </h3>
                <p className="text-xs text-slate-400">
                  Dùng để lồng tiếng video ngắn, tạo audio podcast hoặc nghe tài liệu
                </p>
              </div>

              {isSpeaking && (
                <div className="flex items-center gap-1 h-6">
                  {[12, 24, 16, 28, 20, 14].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              rows={4}
              placeholder="Nhập nội dung cần đọc..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none mb-3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Giọng đọc:
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950 text-xs text-slate-900 dark:text-white"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Tốc độ đọc:</span>
                  <span>{ttsRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Cao độ (Pitch):</span>
                  <span>{ttsPitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayTTS}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{isPaused ? "▶ Tiếp tục" : "▶ Đọc ngay"}</span>
              </button>
              {isSpeaking && (
                <button
                  type="button"
                  onClick={handlePauseTTS}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  ⏸ Tạm dừng
                </button>
              )}
              {(isSpeaking || isPaused) && (
                <button
                  type="button"
                  onClick={handleStopTTS}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
                >
                  ⏹ Dừng
                </button>
              )}
            </div>
          </div>
        )}

        {/* 8. SUMMARIZE */}
        {activeTool === "summarize" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {["bullets", "short", "action_items"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSummarizeMode(m as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      summarizeMode === m
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {m === "bullets"
                      ? (language === "en" ? "📑 Bullets" : "📑 Ý chính")
                      : m === "short"
                      ? (language === "en" ? "🎯 Concise" : "🎯 Ngắn gọn")
                      : (language === "en" ? "✅ Action Items" : "✅ Việc cần làm")}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSummarizeText(SAMPLE_TEXTS.summarize)}
                className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
              </button>
            </div>

            <textarea
              value={summarizeText}
              onChange={(e) => setSummarizeText(e.target.value)}
              rows={4}
              placeholder={language === "en" ? "Paste article, document, or report to summarize..." : "Dán bài báo, tài liệu, báo cáo cần tóm tắt..."}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSummarize}
                disabled={isSummarizing || !summarizeText.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSummarizing ? (language === "en" ? "Summarizing..." : "Đang tóm tắt...") : (language === "en" ? "⚡ Instant Summary" : "⚡ Tóm Tắt Siêu Tốc")}
              </button>
            </div>

            {summarizeResult && (
              <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === "en" ? "Summary Result:" : "Kết quả tóm tắt:"}</h4>
                  <button
                    onClick={() => handleCopy(summarizeResult, "sum")}
                    className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {copyBtnLabel("sum", "Sao chép", "Copy")}
                  </button>
                </div>
                <MarkdownRenderer content={summarizeResult} />
              </div>
            )}
          </div>
        )}

        {/* 9. REWRITE */}
        {activeTool === "rewrite" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[
                  { id: "professional", labelVi: "💼 Chuyên nghiệp", labelEn: "💼 Professional" },
                  { id: "persuasive", labelVi: "🎯 Thuyết phục", labelEn: "🎯 Persuasive" },
                  { id: "casual", labelVi: "🤝 Thân thiện", labelEn: "🤝 Friendly" },
                  { id: "concise", labelVi: "⚡ Súc tích", labelEn: "⚡ Concise" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRewriteTone(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rewriteTone === t.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {language === "en" ? t.labelEn : t.labelVi}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRewriteText(SAMPLE_TEXTS.rewrite)}
                className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
              </button>
            </div>

            <textarea
              value={rewriteText}
              onChange={(e) => setRewriteText(e.target.value)}
              rows={3}
              placeholder={language === "en" ? "Enter text you want to enhance or rephrase..." : "Nhập đoạn văn bản cần trau chuốt lại..."}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRewrite}
                disabled={isRewriting || !rewriteText.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isRewriting ? (language === "en" ? "Rewriting..." : "Đang hiệu đính...") : (language === "en" ? "✨ Enhance Writing Style" : "✨ Nâng Cấp Văn Phong")}
              </button>
            </div>

            {rewriteResult && (
              <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === "en" ? "Enhanced Content:" : "Văn bản sau khi nâng cấp:"}</h4>
                  <button
                    onClick={() => handleCopy(rewriteResult, "rew")}
                    className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {copyBtnLabel("rew", "Sao chép", "Copy")}
                  </button>
                </div>
                <MarkdownRenderer content={rewriteResult} />
              </div>
            )}
          </div>
        )}

        {/* 10. PROMPT CRAFTER */}
        {activeTool === "prompt_craft" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {["ChatGPT / Claude", "Midjourney", "Biết Tuốt Studio"].map((ai) => (
                  <button
                    key={ai}
                    type="button"
                    onClick={() => setTargetAI(ai)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetAI === ai
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {ai}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPromptIdea(SAMPLE_TEXTS.prompt_craft)}
                className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {language === "en" ? "Paste Sample" : "Dán mẫu thử"}
              </button>
            </div>

            <textarea
              value={promptIdea}
              onChange={(e) => setPromptIdea(e.target.value)}
              rows={3}
              placeholder={language === "en" ? "Enter your raw prompt concept..." : "Nhập ý tưởng thô của bạn..."}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCraftPrompt}
                disabled={isCrafting || !promptIdea.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isCrafting ? (language === "en" ? "Crafting prompt..." : "Đang tạo prompt...") : (language === "en" ? "🎯 Generate Master Prompt" : "🎯 Tạo Master Prompt")}
              </button>
            </div>

            {promptResult && (
              <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === "en" ? "Master Prompt Result:" : "Master Prompt hoàn chỉnh:"}</h4>
                  <button
                    onClick={() => handleCopy(promptResult, "prompt")}
                    className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {copyBtnLabel("prompt", "Sao chép", "Copy")}
                  </button>
                </div>
                <MarkdownRenderer content={promptResult} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#0d0f18] border border-slate-200 dark:border-indigo-950/80 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === "en" ? `History: ${activeToolMeta.nameEn || activeToolMeta.name}` : `Lịch sử: ${activeToolMeta.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === "en" ? "Saved runs from current browser session" : "Tự động lưu lại các kết quả đã tạo trong phiên truy cập"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {(!toolHistory[activeTool] || toolHistory[activeTool].length === 0) ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <p className="text-2xl mb-2">📭</p>
                  <p>{language === "en" ? "No history recorded for this tool yet." : "Chưa có lịch sử tạo nào cho công cụ này."}</p>
                </div>
              ) : (
                toolHistory[activeTool].map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131522] border border-slate-200 dark:border-indigo-950/60 space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                      <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                        #{toolHistory[activeTool].length - idx} · {item.timestamp}
                      </span>
                      <button
                        onClick={() => {
                          handleCopy(item.result, `hist-${item.id}`);
                          setShowHistoryModal(false);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer transition-colors"
                      >
                        {copyBtnLabel(`hist-${item.id}`, "Sao chép kết quả", "Copy Result")}
                      </button>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {language === "en" ? "Input Concept:" : "Nội dung đầu vào:"}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 italic">
                        "{item.input}"
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {language === "en" ? "Generated Result:" : "Kết quả AI tạo ra:"}
                      </span>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs max-h-60 overflow-y-auto">
                        <MarkdownRenderer content={item.result} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
