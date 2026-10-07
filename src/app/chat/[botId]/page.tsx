"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { ALL_ASSISTANTS_MAP } from "@/data/aiData";
import {
  extractImagesFromClipboard,
  extractImagesFromFileList,
  extractImagesFromDrop,
} from "@/lib/imageUtils";
import RechargeModal from "@/components/payment/RechargeModal";
import LoginForm from "@/components/auth/LoginForm";
import WorkspaceBackgroundLayer from "@/components/theme/WorkspaceBackgroundLayer";
import { useWorkspaceBackground } from "@/context/WorkspaceBackgroundContext";
import { playVietnameseTTS, stopVietnameseTTS } from "@/lib/ttsAudio";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";

interface BotData {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  badge?: string;
  personality?: string;
  tagline?: string;
  greeting?: string;
  suggestedPrompts?: string[];
  category?: string;
}

interface QuickToolItem {
  id: string;
  label: string;
  promptPrefix: string;
  placeholder: string;
  isImageGen?: boolean;
  isImageEdit?: boolean;
  isHighlight?: boolean;
}

function getBotQuickTools(botId: string, category?: string): QuickToolItem[] {
  // 1. Họa sĩ AI · Tạo & Sửa ảnh
  if (botId === "ai-artist") {
    return [
      {
        id: "ai_art_gen",
        label: "🎨 Tạo ảnh từ mô tả",
        promptPrefix: "Vẽ một bức tranh nghệ thuật tuyệt đẹp về: ",
        placeholder: "Mô tả chi tiết bức tranh (VD: Thành phố Cyberpunk dưới mưa, chân dung anime 3D)...",
        isImageGen: true,
        isHighlight: true,
      },
      {
        id: "ai_art_edit",
        label: "🖌️ Chỉnh sửa ảnh đính kèm",
        promptPrefix: "Hãy chỉnh sửa hình ảnh đính kèm theo phong cách: ",
        placeholder: "Đính kèm ảnh và mô tả cách bạn muốn sửa (đổi nền, màu tóc, trang phục)...",
        isImageEdit: true,
        isHighlight: true,
      },
      {
        id: "ai_art_anime",
        label: "🌸 Sang Anime 3D",
        promptPrefix: "Chuyển đổi hình ảnh này sang phong cách Anime 3D Makoto Shinkai lung linh: ",
        placeholder: "Đính kèm ảnh để chuyển sang phong cách Anime 3D...",
        isImageEdit: true,
      },
      {
        id: "ai_art_upgrade",
        label: "🌟 Nâng cấp 4K & Chi tiết",
        promptPrefix: "Tạo lại bức tranh này với độ phân giải siêu nét 4K, tăng chi tiết ánh sáng và độ tương phản: ",
        placeholder: "Mô tả thêm các chi tiết bạn muốn tinh chỉnh hoặc nâng cấp...",
        isImageGen: true,
      },
    ];
  }

  // 2. Toán học / Casio
  if (botId === "math-solver" || botId === "exam-prep") {
    return [
      {
        id: "math_step",
        label: "📐 Giải từng bước",
        promptPrefix: "Hãy giải bài toán này chi tiết từng bước, kèm công thức và lý giải rõ ràng:\n",
        placeholder: "Nhập đề bài toán (Đại số, Hình học, Giải tích, Đạo hàm, Tích phân)...",
        isHighlight: true,
      },
      {
        id: "math_casio",
        label: "🔢 Bấm máy Casio",
        promptPrefix: "Hãy hướng dẫn các bước bấm máy tính Casio (fx-580VNX / fx-880BTG) để giải nhanh câu này:\n",
        placeholder: "Nhập biểu thức hoặc bài toán trắc nghiệm cần bấm máy tính...",
        isHighlight: true,
      },
      {
        id: "math_trap",
        label: "⚠️ Bẫy sai lầm cần tránh",
        promptPrefix: "Chỉ ra các bẫy toán học và sai lầm học sinh dễ mắc phải nhất với dạng bài này:\n",
        placeholder: "Nhập dạng toán hoặc bài toán bạn muốn biết các bẫy cần tránh...",
      },
      {
        id: "math_formula",
        label: "⚡ Tóm tắt công thức",
        promptPrefix: "Hãy tóm tắt toàn bộ công thức và định lý cốt lõi cần nhớ để giải dạng bài:\n",
        placeholder: "Nhập chủ đề kiến thức toán cần tổng hợp công thức...",
      },
    ];
  }

  // 3. Vật lý
  if (botId === "physics-solver") {
    return [
      {
        id: "phys_step",
        label: "📐 Giải chi tiết & Đơn vị",
        promptPrefix: "Hãy giải chi tiết bài toán Vật lý này, kèm sơ đồ minh họa ascii và chú ý đổi đơn vị:\n",
        placeholder: "Nhập đề bài Cơ, Điện, Quang, Nhiệt, Hạt nhân...",
        isHighlight: true,
      },
      {
        id: "phys_nature",
        label: "⚡ Bản chất hiện tượng",
        promptPrefix: "Hãy giải thích hiện tượng vật lý trong đời thực và bản chất của bài toán này:\n",
        placeholder: "Nhập hiện tượng hoặc câu hỏi Vật lý cần giải thích...",
      },
      {
        id: "phys_trick",
        label: "💡 Mẹo trắc nghiệm nhanh",
        promptPrefix: "Hướng dẫn công thức tính nhanh và mẹo loại trừ đáp án trắc nghiệm Vật lý cho dạng:\n",
        placeholder: "Nhập dạng bài hoặc đề trắc nghiệm Vật lý...",
      },
    ];
  }

  // 4. Tiếng Anh (English Teacher)
  if (botId === "english-teacher") {
    return [
      {
        id: "eng_correct",
        label: "🗣️ Sửa ngữ pháp & Phát âm",
        promptPrefix: "Hãy sửa lỗi ngữ pháp, chỉ ra lỗi dùng từ và cung cấp phiên âm IPA cho câu sau:\n",
        placeholder: "Nhập câu tiếng Anh bạn muốn cô Emily sửa lỗi...",
        isHighlight: true,
      },
      {
        id: "eng_ielts",
        label: "🎯 Luyện IELTS Speaking",
        promptPrefix: "Hãy đóng vai giám khảo IELTS phỏng vấn và chấm điểm câu trả lời của tôi về chủ đề:\n",
        placeholder: "Nhập chủ đề Speaking hoặc câu trả lời của bạn...",
        isHighlight: true,
      },
      {
        id: "eng_idioms",
        label: "💎 5 Idioms nâng band",
        promptPrefix: "Cho em 5 idioms hoặc collocations cực tự nhiên chuẩn người bản xứ để nói về:\n",
        placeholder: "Nhập chủ đề bạn muốn nâng cấp từ vựng...",
      },
      {
        id: "eng_trans",
        label: "✨ Dịch tự nhiên chuẩn Native",
        promptPrefix: "Dịch đoạn văn này sang tiếng Anh tự nhiên, mượt mà chuẩn người bản ngữ:\n",
        placeholder: "Nhập đoạn văn tiếng Việt cần dịch chuẩn bản xứ...",
      },
    ];
  }

  // 5. Tử Vi
  if (botId === "tu-vi-master") {
    return [
      {
        id: "tuvi_laso",
        label: "🔮 Lập & Luận giải lá số",
        promptPrefix: "Hãy luận giải lá số Tử Vi chi tiết dựa trên thông tin ngày giờ sinh:\n",
        placeholder: "Nhập Giới tính, Ngày tháng năm sinh (Dương/Âm) và Giờ sinh...",
        isHighlight: true,
      },
      {
        id: "tuvi_vanhan",
        label: "⭐ Vận hạn & Tài lộc năm nay",
        promptPrefix: "Xin Thầy xem giúp vận hạn, sao chiếu mệnh và đường tài lộc trong năm nay:\n",
        placeholder: "Nhập tuổi hoặc năm sinh và điều bạn muốn hỏi về công danh, tài lộc...",
        isHighlight: true,
      },
      {
        id: "tuvi_hoagiai",
        label: "🌿 Hóa giải xung khắc & An tâm",
        promptPrefix: "Thầy cho con lời khuyên hóa giải xung khắc và hướng tới bình an trong:\n",
        placeholder: "Nhập vấn đề bạn đang lo lắng, xung khắc mệnh hoặc trắc trở gặp phải...",
      },
    ];
  }

  // 6. Tarot
  if (botId === "tarot-reader") {
    return [
      {
        id: "tarot_3cards",
        label: "🃏 Trải bài 3 lá kinh điển",
        promptPrefix: "Hãy bốc và luận giải trải bài Tarot 3 lá (Quá khứ - Hiện tại - Tương lai) cho câu hỏi:\n",
        placeholder: "Nhập câu hỏi bạn đang băn khoăn (công việc, tình cảm, bước ngoặt mới)...",
        isHighlight: true,
      },
      {
        id: "tarot_love",
        label: "💖 Tình cảm & Mối quan hệ",
        promptPrefix: "Xin thông điệp Tarot về chuyện tình cảm và định hướng mối quan hệ của tôi:\n",
        placeholder: "Mô tả trạng thái mối quan hệ hiện tại của bạn và đối phương...",
        isHighlight: true,
      },
      {
        id: "tarot_universe",
        label: "✨ Thông điệp vũ trụ hôm nay",
        promptPrefix: "Vũ trụ có lời khuyên và thông điệp gì dành cho tôi ngay lúc này?\n",
        placeholder: "Nhập tâm trạng hoặc năng lượng bạn đang cảm nhận hôm nay...",
      },
    ];
  }

  // 7. Tinh Vân · Bản đồ sao / Thần số học / Bói tình duyên
  if (botId === "cosmic-chart" || botId === "numerology" || botId === "love-astrology") {
    return [
      {
        id: "astro_chart",
        label: "🌌 Bản đồ sao & Thần số",
        promptPrefix: "Hãy phân tích chi tiết bản đồ sao / con số chủ đạo dựa trên thông tin:\n",
        placeholder: "Nhập ngày tháng năm sinh (và giờ sinh, nơi sinh nếu có)...",
        isHighlight: true,
      },
      {
        id: "astro_love",
        label: "💞 Độ hòa hợp tình cảm",
        promptPrefix: "Phân tích độ hòa hợp trong tình cảm và tính cách giữa 2 người:\n",
        placeholder: "Nhập ngày sinh hoặc cung hoàng đạo của 2 bạn...",
        isHighlight: true,
      },
      {
        id: "astro_future",
        label: "🔮 Chu kỳ vận mệnh sắp tới",
        promptPrefix: "Dự báo chu kỳ năng lượng và các bài học phát triển cá nhân trong giai đoạn tới cho:\n",
        placeholder: "Nhập điều bạn muốn khai phá cho tương lai...",
      },
    ];
  }

  // 8. Tóm tắt Youtube / Văn bản tài liệu
  if (botId === "youtube-summarizer" || botId === "doc-assistant") {
    return [
      {
        id: "yt_30s",
        label: "⚡ Tóm tắt 30 giây",
        promptPrefix: "Tóm tắt siêu tốc nội dung cốt lõi của link / tài liệu này trong 30 giây:\n",
        placeholder: "Dán đường link YouTube (https://youtube.com/watch?v=...) hoặc dán văn bản...",
        isHighlight: true,
      },
      {
        id: "yt_timeline",
        label: "📌 Mốc thời gian (Timestamps)",
        promptPrefix: "Phân tích các mốc thời gian quan trọng và nội dung tương ứng của video:\n",
        placeholder: "Dán link YouTube cần chia timeline chi tiết...",
        isHighlight: true,
      },
      {
        id: "yt_takeaways",
        label: "💡 Actionable Takeaways",
        promptPrefix: "Trích xuất các bài học thực tiễn và hành động cụ thể có thể áp dụng ngay từ nội dung:\n",
        placeholder: "Dán link YouTube hoặc tài liệu để rút ra bài học thực tiễn...",
      },
    ];
  }

  // 9. Hướng nghiệp & Tuyển dụng (Career Guide)
  if (botId === "career-guide") {
    return [
      {
        id: "career_cv",
        label: "📄 Sửa CV chuẩn ATS",
        promptPrefix: "Hãy soi và tối ưu lại đoạn kinh nghiệm làm việc này theo công thức Google XYZ và chuẩn ATS:\n",
        placeholder: "Dán đoạn mô tả kinh nghiệm hoặc CV của bạn vào đây...",
        isHighlight: true,
      },
      {
        id: "career_star",
        label: "🎯 Luyện phỏng vấn STAR",
        promptPrefix: "Hãy hướng dẫn trả lời phỏng vấn theo mô hình STAR (Situation, Task, Action, Result) cho câu hỏi:\n",
        placeholder: "Nhập câu hỏi phỏng vấn hóc búa bạn cần luyện tập...",
        isHighlight: true,
      },
      {
        id: "career_salary",
        label: "📈 Lộ trình thăng tiến & Lương",
        promptPrefix: "Tư vấn lộ trình thăng tiến và cách đàm phán lương hiệu quả cho vị trí:\n",
        placeholder: "Nhập vị trí công việc, số năm kinh nghiệm và mức lương kỳ vọng...",
      },
    ];
  }

  // 10. Trợ lý viết (Writing Assistant)
  if (botId === "writing-assistant") {
    return [
      {
        id: "write_email",
        label: "✉️ Soạn Email chuyên nghiệp",
        promptPrefix: "Hãy viết một email ngoại giao lịch thiệp, chuyên nghiệp cho tình huống:\n",
        placeholder: "Nhập bối cảnh email (từ chối, đề xuất hợp tác, xin phép, khiếu nại)...",
        isHighlight: true,
      },
      {
        id: "write_pas",
        label: "🎯 Viết bài PAS / AIDA",
        promptPrefix: "Viết bài PR/Marketing thuyết phục theo công thức PAS (Problem - Agitate - Solution) về:\n",
        placeholder: "Nhập sản phẩm/dịch vụ và đối tượng khách hàng mục tiêu...",
        isHighlight: true,
      },
      {
        id: "write_polish",
        label: "✨ Đánh bóng câu từ cuốn hút",
        promptPrefix: "Chỉnh sửa đoạn văn này cho bay bổng, truyền cảm hứng và cuốn hút hơn:\n",
        placeholder: "Dán đoạn văn bạn muốn nâng cấp ngữ điệu...",
      },
    ];
  }

  // 11. Sơ đồ tư duy (Mindmap Creator)
  if (botId === "mindmap-creator") {
    return [
      {
        id: "mm_tree",
        label: "🌳 Cây sơ đồ 3 cấp",
        promptPrefix: "Hãy chuyển đổi nội dung sau thành cây sơ đồ tư duy phân nhánh 3 cấp logic có icon minh họa:\n",
        placeholder: "Dán nội dung hoặc đề tài cần vẽ sơ đồ...",
        isHighlight: true,
      },
      {
        id: "mm_mermaid",
        label: "📊 Sơ đồ quy trình Mermaid",
        promptPrefix: "Vẽ sơ đồ luồng quy trình (Flowchart Mermaid) chuẩn markdown cho quy trình:\n",
        placeholder: "Mô tả các bước của quy trình bạn muốn vẽ...",
        isHighlight: true,
      },
      {
        id: "mm_summary",
        label: "📌 Bóc tách 5 trụ cột chính",
        promptPrefix: "Bóc tách 5 trụ cột quan trọng nhất của chủ đề sau dưới dạng bullet points trực quan:\n",
        placeholder: "Nhập chủ đề hoặc tài liệu cần bóc tách trụ cột...",
      },
    ];
  }

  // 12. Phát hiện AI (AI Detector)
  if (botId === "ai-detector") {
    return [
      {
        id: "aid_check",
        label: "🔍 Thẩm định % do AI viết",
        promptPrefix: "Hãy phân tích độ bối rối (Perplexity) và burstiness để thẩm định tỷ lệ % do AI tạo ra của văn bản này:\n",
        placeholder: "Dán văn bản bạn nghi ngờ do AI viết...",
        isHighlight: true,
      },
      {
        id: "aid_humanize",
        label: "✨ Humanize (Nhân hóa câu chữ)",
        promptPrefix: "Hãy viết lại đoạn văn này theo văn phong người thật 100%, tự nhiên, giàu cảm xúc và xóa sạch dấu vết AI:\n",
        placeholder: "Dán đoạn văn cần nhân hóa và viết lại...",
        isHighlight: true,
      },
      {
        id: "aid_signals",
        label: "⚠️ Chỉ ra dấu hiệu máy móc",
        promptPrefix: "Liệt kê các từ ngữ sáo rỗng và cấu trúc câu rập khuôn tố cáo đoạn văn này do AI tạo:\n",
        placeholder: "Dán đoạn văn cần phân tích dấu hiệu nhận diện...",
      },
    ];
  }

  // 13. Góc chữa lành (Tâm An)
  if (botId === "goc-chua-lanh" || botId === "healing-companion") {
    return [
      {
        id: "heal_vent",
        label: "🌿 Trút bỏ áp lực & Buồn phiền",
        promptPrefix: "Mình đang cảm thấy rất mệt mỏi và áp lực về:\n",
        placeholder: "Viết ra bất cứ điều gì đang đè nặng trong lòng bạn, không cần giấu giếm...",
        isHighlight: true,
      },
      {
        id: "heal_hug",
        label: "☕ Cần một lời an ủi ấm áp",
        promptPrefix: "Hôm nay mình đã trải qua một chuyện buồn, Tâm An có thể lắng nghe và ôm mình một cái không?\n",
        placeholder: "Chia sẻ câu chuyện buồn của bạn, Tâm An luôn ở đây lắng nghe...",
        isHighlight: true,
      },
      {
        id: "heal_breathe",
        label: "🕊️ Bài tập thở thư giãn 3 phút",
        promptPrefix: "Hướng dẫn mình bài tập hít thở và thả lỏng cơ thể để lấy lại bình an trong tâm trí ngay lúc này.",
        placeholder: "Bấm gửi để bắt đầu bài tập thở nhẹ nhàng...",
      },
    ];
  }

  // 14. Nhân vật truyện nhập vai / Tổng tài / Thiếu gia / Tiên tôn / Danh môn
  const isVipStoryChar = [
    "char-tong-tai",
    "char-co-da-than",
    "char-tieu-viem",
    "char-lam-tuyet-dao",
    "char-luna",
    "char-mira",
    "char-zen",
    "char-alex",
  ].includes(botId);

  if (isVipStoryChar) {
    return [
      {
        id: "story_talk",
        label: "💬 Lời thoại trực tiếp",
        promptPrefix: "",
        placeholder: "Nói chuyện trực tiếp với nhân vật (VD: Em nhớ anh, Hôm nay em mệt quá)...",
        isHighlight: true,
      },
      {
        id: "story_surprise",
        label: "🌹 Tình huống lãng mạn",
        promptPrefix: "[Tình huống bất ngờ]: ",
        placeholder: "Tạo một tình huống bất ngờ (trời mưa, đi dạo cùng nhau, chạm mắt)...",
        isHighlight: true,
      },
      {
        id: "story_tease",
        label: "🔥 Hờn dỗi / Thử lòng",
        promptPrefix: "[Hờn dỗi nhẹ]: ",
        placeholder: "Nhập lời hờn dỗi hoặc trêu chọc xem phản ứng của nhân vật...",
      },
      {
        id: "story_comfort",
        label: "✨ Cần được vỗ về",
        promptPrefix: "[Cần được dỗ dành]: ",
        placeholder: "Nói cho người ấy biết bạn đang yếu lòng và cần được cưng chiều...",
      },
    ];
  }

  // 15. Mặc định cho các bot khác
  return [
    {
      id: "deep_explain",
      label: "💡 Giải thích sâu",
      promptPrefix: "Hãy giải thích chi tiết và phân tích cặn kẽ cho tôi về:\n",
      placeholder: "Nhập khái niệm, hiện tượng hoặc bài toán bạn cần phân tích cặn kẽ...",
      isHighlight: true,
    },
    {
      id: "code",
      label: "💻 Viết Code chuẩn",
      promptPrefix: "Hãy viết code chuẩn và tối ưu cho bài toán:\n",
      placeholder: "Mô tả bài toán lập trình hoặc tính năng bạn muốn viết code...",
    },
    {
      id: "image_gen",
      label: "🎨 Tạo ảnh AI",
      promptPrefix: "Vẽ một bức tranh nghệ thuật tuyệt đẹp về: ",
      placeholder: "Mô tả bức tranh bạn muốn vẽ (VD: Hoàng hôn trên biển, anime 3D, Cyberpunk)...",
      isImageGen: true,
    },
    {
      id: "rewrite",
      label: "✨ Sửa văn phong",
      promptPrefix: "Hãy viết lại đoạn sau cho mượt mà, cảm xúc hơn:\n",
      placeholder: "Dán đoạn văn bạn muốn viết lại cho mượt mà và cảm xúc hơn...",
    },
    {
      id: "summary",
      label: "📌 Tóm tắt ý chính",
      promptPrefix: "Tóm tắt các ý chính và hành động cốt lõi của nội dung sau:\n",
      placeholder: "Dán nội dung bạn muốn tóm tắt...",
    },
  ];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  createdAt?: string;
}

export default function BotChatPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params?.botId as string;

  const { user, updateUserCredits } = useAuth();
  const activeUserId = user?.id || user?.email || null;
  const { language, t } = useLanguage();
  const { showAlert } = usePopup();

  const [bot, setBot] = useState<BotData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  // State công cụ nhanh được chọn (Dạng ẩn placeholder)
  const [activeTool, setActiveTool] = useState<QuickToolItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [botLoading, setBotLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(user?.credits ?? null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { bgType } = useWorkspaceBackground();

  useEffect(() => {
    if (user?.credits !== undefined && user?.credits !== null) {
      setCredits(user.credits);
    }
  }, [user?.credits]);

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [hideActionNotes, setHideActionNotes] = useState<boolean>(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "up" | "down">>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // States nâng cấp
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("tong_tai");
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isPromptEnhancing, setIsPromptEnhancing] = useState(false);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

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

  const handleToggleSpeech = (msgId: string, text: string, forcedVoice?: string) => {
    if (speakingMsgId === msgId) {
      stopVietnameseTTS();
      setSpeakingMsgId(null);
      return;
    }
    const botName = (bot?.name || "").toLowerCase();
    const isTongTai =
      ["char-tong-tai", "char-co-da-than", "char-tieu-viem"].includes(botId as string) ||
      botName.includes("tổng tài") ||
      botName.includes("lục cận phong") ||
      botName.includes("thiếu gia") ||
      botName.includes("tiên tôn") ||
      botName.includes("cố dạ thần") ||
      botName.includes("tiêu viêm") ||
      botName.includes("nam chính");
    const isMale = isTongTai || ["alex", "master-zen"].includes(botId as string);
    const defaultVoice = isTongTai || isMale ? "tong_tai" : "female";
    const voice = forcedVoice || selectedVoice || defaultVoice;

    setSpeakingMsgId(msgId);
    playVietnameseTTS(msgId, text, {
      voice,
      onStart: () => setSpeakingMsgId(msgId),
      onEnd: () => setSpeakingMsgId(null),
    });
  };

  // 1. Nhập giọng nói tiếng Việt (Microphone STT)
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      showAlert("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp.", "Thông báo", "warning");
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
        if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
        setIsListening(false);
        return;
      }

      const rec = new SpeechRecClass();
      rec.lang = language === "en" ? "en-US" : "vi-VN";
      rec.continuous = false;
      rec.interimResults = false;
      speechRecognitionRef.current = rec;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
            textareaRef.current.focus();
          }
        }, 50);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Lỗi mic:", err);
      setIsListening(false);
    }
  };

  // 2. Xuất cuộc trò chuyện dạng Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const charName = bot?.name || "Nhan-vat-AI";
    let markdown = `# Cuộc Trò Chuyện Với ${charName}\n\n`;
    markdown += `*Được xuất từ OmniAI Platform vào ${new Date().toLocaleString("vi-VN")}*\n\n---\n\n`;

    messages.forEach((m) => {
      const sender = m.role === "user" ? "👤 **Bạn**" : `🎭 **${charName}**`;
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
    a.download = `chat-${charName.toLowerCase().replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 3. Chỉnh sửa tin nhắn người dùng inline
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

    setEditingMsgId(null);
    setEditInputText("");
    // Cắt lịch sử tin nhắn tới trước tin này và gửi lại
    setMessages((prev) => prev.slice(0, targetIdx));
    handleSendMessage(undefined, newText, originalMsg.images || []);
  };

  // 4. Auto-growing textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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
    setIsLoading(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 1. Tải thông tin Bot và Credit của User
  useEffect(() => {
    if (!botId) return;

    if (botId === "tarot-reader") {
      router.replace("/?tab=tarot");
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        setBotLoading(true);

        const staticBot = ALL_ASSISTANTS_MAP[botId];

        // Fetch Bot info
        const botRes = await fetch(`/api/bots/${botId}`);
        if (botRes.ok) {
          const botData = await botRes.json();
          if (isMounted) {
            setBot({
              ...botData,
              badge: botData.badge || staticBot?.badge,
              personality: botData.personality || staticBot?.personality,
              tagline: botData.tagline || staticBot?.tagline,
              greeting: botData.greeting || staticBot?.greeting,
              suggestedPrompts: botData.suggestedPrompts || staticBot?.suggestedPrompts,
              category: botData.category || staticBot?.category,
            });
          }
        } else if (staticBot && isMounted) {
          setBot(staticBot as unknown as BotData);
        } else {
          console.error("Không tìm thấy bot");
        }

        // Fetch User Credits & Chat History (chỉ khi đã đăng nhập)
        if (activeUserId) {
          const userRes = await fetch(`/api/user/credits?userId=${activeUserId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            if (isMounted) {
              setCredits(userData.credits);
              updateUserCredits(userData.credits);
            }
          }

          const historyRes = await fetch(`/api/chat/history/${botId}?userId=${activeUserId}`);
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            if (isMounted) {
              setConversationId(historyData.conversationId);
              if (historyData.messages && historyData.messages.length > 0) {
                setMessages(historyData.messages);
              }
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chat:", err);
      } finally {
        if (isMounted) setBotLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [botId, activeUserId]);

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

  // 2. Xử lý Gửi tin nhắn và Streaming
  const handleSendMessage = async (
    e?: React.FormEvent,
    customPrompt?: string,
    customImages?: string[]
  ) => {
    if (e) e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    let userText = (customPrompt !== undefined ? customPrompt : input).trim();
    if (!customPrompt && activeTool && userText) {
      userText = `${activeTool.promptPrefix}${userText}`;
    }
    const imagesToSend = customImages !== undefined ? customImages : [...attachedImages];
    if ((!userText && imagesToSend.length === 0) || isLoading) return;

    // Phân loại chi phí credit
    const isFreeHealing = botId === "goc-chua-lanh" || botId === "healing-companion";
    const isVipStory = [
      "char-tong-tai",
      "char-co-da-than",
      "char-tieu-viem",
      "char-lam-tuyet-dao",
    ].includes(botId);
    const requiredCost = isFreeHealing ? 0 : (isVipStory ? 2 : 1);

    // Kiểm tra credit trước khi gửi ở frontend (Admin được miễn phí và vô hạn)
    if (user?.role !== "ADMIN" && requiredCost > 0 && credits !== null && credits < requiredCost) {
      setShowCreditModal(true);
      return;
    }

    if (!customPrompt) {
      setInput("");
      setActiveTool(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
    setAttachedImages([]);

    // Tạo tin nhắn User tức thời trên giao diện (Optimistic update)
    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, role: "user", content: userText, images: imagesToSend },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    // Chuẩn bị khung tin nhắn của AI
    const aiMsgId = `ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: "assistant", content: "" },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          userId: activeUserId,
          conversationId,
          language,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            images: m.images,
          })),
        }),
      });

      // 3. Xử lý mã lỗi 401 Chưa đăng nhập & 403 Hết Credit
      if (response.status === 401) {
        setShowLoginModal(true);
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        setIsLoading(false);
        return;
      }

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        setCredits(0);
        updateUserCredits(0);
        setShowCreditModal(true);
        // Xóa khung tin nhắn tạm của AI
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Cập nhật remaining credits từ header nếu có
      const remainingCreditsHeader = response.headers.get("X-Remaining-Credits");
      if (user?.role === "ADMIN") {
        setCredits(999999);
      } else if (remainingCreditsHeader !== null) {
        const val = Number(remainingCreditsHeader);
        setCredits(val);
        updateUserCredits(val);
      } else if (credits !== null) {
        const val = Math.max(0, (credits ?? 1) - 1);
        setCredits(val);
        updateUserCredits(val);
      }

      const convIdHeader = response.headers.get("X-Conversation-Id");
      if (convIdHeader) {
        setConversationId(convIdHeader);
      }

      // Đọc Streaming Response
      if (!response.body) {
        throw new Error("Không nhận được response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Cập nhật nội dung tin nhắn AI đang stream
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.log("Người dùng đã dừng phản hồi AI");
        return;
      }
      console.error("Lỗi khi gửi tin nhắn:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content:
                  "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý phản hồi. Vui lòng thử lại!",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 4. Xử lý Nạp thêm Credit Demo
  const handleRechargeCredit = async (amount: number = 10) => {
    try {
      setIsRecharging(true);
      const res = await fetch("/api/user/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          amount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCredits(data.user.credits);
        updateUserCredits(data.user.credits);
        setShowCreditModal(false);
      }
    } catch (error) {
      console.error("Lỗi khi nạp credit:", error);
    } finally {
      setIsRecharging(false);
    }
  };

  // Xử lý phím Enter để gửi (Shift+Enter để xuống dòng)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (botLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {language === "en" ? "Connecting, please wait..." : "Đang kết nối, vui lòng chờ..."}
        </p>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl font-bold mb-4">
          !
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Không tìm thấy Trợ lý
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          Trợ lý bạn yêu cầu không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors shadow-sm"
        >
          Quay lại Trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${
        bgType === "default" ? "bg-slate-50 dark:bg-[#090a0f]" : "bg-[#090a0f]"
      } text-slate-900 dark:text-slate-100 overflow-hidden relative`}
    >
      <WorkspaceBackgroundLayer />
      {/* 1. Header Trợ Lý & Credit */}
      <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#111218]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Quay lại"
          >
            ←
          </Link>

          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
            <img
              src={bot.avatar}
              alt={bot.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
              }}
            />
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111218]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {bot.name}
              </h1>
              {bot.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 to-cyan-500/15 text-indigo-600 dark:text-cyan-300 border border-indigo-500/20 dark:border-cyan-500/30 whitespace-nowrap">
                  {bot.badge}
                </span>
              )}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
              {bot.tagline || bot.description || "Trợ lý AI thông minh"}
            </p>
          </div>
        </div>

        {/* Credit Counter & Recharge Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {botId === "goc-chua-lanh" || botId === "healing-companion" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-2xs">
              <span>🕊️</span>
              <span>Miễn phí 100% (0 Credit)</span>
            </div>
          ) : (
            <>
              {/* Nút bật/tắt ẩn ghi chú cử chỉ (Chỉ hiện khi là nhân vật truyện / nhập vai) */}
              {[
                "char-tong-tai",
                "char-co-da-than",
                "char-tieu-viem",
                "char-lam-tuyet-dao",
                "char-luna",
                "char-mira",
                "char-zen",
                "char-alex",
              ].includes(botId) && (
                <button
                  type="button"
                  onClick={() => setHideActionNotes((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    hideActionNotes
                      ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-cyan-300 ring-1 ring-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                  title={
                    hideActionNotes
                      ? (language === "en" ? "Hiding action notes (Dialogue only). Click to show all." : "Đang ẩn ghi chú cử chỉ (Chỉ hiện lời thoại). Bấm để xem đầy đủ.")
                      : (language === "en" ? "Showing full description. Click to show dialogue only." : "Đang hiện đầy đủ cả miêu tả. Bấm để chỉ xem lời thoại.")
                  }
                >
                  <span>{hideActionNotes ? "💬" : "🎭"}</span>
                  <span className="hidden sm:inline">
                    {hideActionNotes ? (language === "en" ? "Dialogue Only" : "Chỉ lời thoại") : (language === "en" ? "Show Action Notes" : "Hiện cả ghi chú")}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hideActionNotes ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                </button>
              )}

              {["char-tong-tai", "char-co-da-than", "char-tieu-viem", "char-lam-tuyet-dao"].includes(botId) && (
                <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                  <span>👑 VIP</span>
                </div>
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  user?.role === "ADMIN"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : credits !== null && credits <= 2
                    ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400"
                    : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                }`}
              >
                <span>🪙</span>
                <span>
                  {user?.role === "ADMIN" ? (
                    <span className="flex items-center gap-1 font-bold">
                      <span>{language === "en" ? "∞ Unlimited" : "∞ Vô hạn"}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-extrabold">
                        ADMIN
                      </span>
                    </span>
                  ) : credits !== null ? (
                    `${credits} Credits`
                  ) : (
                    "..."
                  )}
                </span>
              </div>

              {/* Nút Xuất Cuộc Trò Chuyện */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportChat}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title={language === "en" ? "Download conversation history (.md)" : "Tải xuống kịch bản trò chuyện (.md)"}
                >
                  <span>📥</span>
                  <span className="hidden md:inline">{language === "en" ? "Export Chat" : "Xuất chat"}</span>
                </button>
              )}

              <button
                onClick={() => setShowCreditModal(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white font-medium text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>+</span>
                <span className="hidden sm:inline">
                  {user?.role === "ADMIN" ? (language === "en" ? "Manage Credits" : "Quản lý Credits") : (language === "en" ? "Recharge" : "Nạp thêm")}
                </span>
              </button>

              {!user ? (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>{language === "en" ? "Sign In" : "Đăng nhập"}</span>
                </button>
              ) : (
                <div
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-indigo-500/50 transition-colors"
                  title={language === "en" ? `Signed in as: ${user.displayName} (Click to switch)` : `Đang đăng nhập: ${user.displayName} (Bấm để đổi nick)`}
                >
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 max-w-[80px] truncate hidden md:inline px-1">
                    {user.displayName}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* 2. Danh Sách Tin Nhắn */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 my-auto max-w-2xl mx-auto animate-in fade-in duration-300">
            {/* Bot Avatar with Glow & Badge */}
            <div className="relative mb-3 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-indigo-500/40 dark:border-cyan-500/40 shadow-xl shadow-indigo-500/15 bg-slate-100 dark:bg-slate-800 transition-all duration-300 group-hover:scale-105">
                <img
                  src={bot.avatar}
                  alt={bot.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
                  }}
                />
              </div>
              {bot.badge && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md whitespace-nowrap">
                  {bot.badge}
                </span>
              )}
            </div>

            {/* Name */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <span>{bot.name}</span>
            </h2>

            {/* Personality Capsule */}
            {bot.personality && (
              <div className="text-xs font-medium text-indigo-600 dark:text-cyan-300 bg-indigo-50 dark:bg-cyan-950/40 border border-indigo-200/60 dark:border-cyan-800/40 px-3.5 py-1 rounded-full mb-3 max-w-md">
                🎭 {bot.personality}
              </div>
            )}

            {/* Catchphrase / Tagline */}
            {bot.tagline && (
              <div className="relative max-w-lg mx-auto mb-4 px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-[#131522] border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic shadow-xs">
                <span className="text-indigo-500 dark:text-cyan-400 font-serif text-lg leading-none mr-1">“</span>
                {bot.tagline}
                <span className="text-indigo-500 dark:text-cyan-400 font-serif text-lg leading-none ml-1">”</span>
              </div>
            )}

            {/* In-character Greeting Card */}
            {bot.greeting && (
              <div className="w-full max-w-lg mx-auto mb-6 p-4 rounded-2xl bg-white/90 dark:bg-[#11131e]/90 border border-slate-200 dark:border-indigo-950/70 shadow-sm text-left relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <span>💬</span> {language === "en" ? `Roleplay greeting from ${bot.name}:` : `Lời chào nhập vai từ ${bot.name}:`}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal italic">
                  "{bot.greeting}"
                </p>
              </div>
            )}

            {/* Suggested Prompts based on Bot's Personality */}
            <div className="w-full max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 text-center">
                💡 {language === "en" ? "Start conversation with suggested questions:" : "Bắt đầu trò chuyện với gợi ý câu hỏi:"}
              </p>
              <div className="flex flex-col gap-2">
                {(bot.suggestedPrompts || [
                  language === "en" ? `Hello ${bot.name}, how can you help me today?` : `Xin chào ${bot.name}, bạn có thể giúp gì cho tôi?`,
                  language === "en" ? "Introduce yourself and your specialty" : "Hãy giới thiệu về bản thân và phong cách của bạn",
                  language === "en" ? "Give me a useful tip for today" : "Cho tôi một lời khuyên hữu ích hôm nay",
                ]).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, suggestion)}
                    className="text-xs px-4 py-3 rounded-xl bg-white dark:bg-[#141624] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all text-left shadow-xs hover:-translate-y-0.5 cursor-pointer flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className="text-indigo-500 dark:text-cyan-400 text-sm group-hover:scale-110 transition-transform">
                        💬
                      </span>
                      <span className="truncate">{suggestion}</span>
                    </span>
                    <span className="text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-cyan-400 text-xs shrink-0 ml-2 font-medium">
                      {language === "en" ? "Send →" : "Gửi →"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} items-start`}
              >
                {/* Avatar của Assistant */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 mt-1 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={bot.avatar}
                      alt={bot.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                )}

                {/* Nội dung Bubble */}
                {isUser && editingMsgId === msg.id ? (
                  <div className="w-full max-w-[85%] sm:max-w-[75%] p-3.5 rounded-3xl bg-white dark:bg-[#131522] border border-indigo-400 dark:border-cyan-400 shadow-xl space-y-2.5 animate-in fade-in duration-150">
                    <div className="text-[11px] font-bold text-indigo-600 dark:text-cyan-300 flex items-center gap-1.5">
                      <span>✏️</span>
                      <span>{language === "en" ? "Edit your message" : "Chỉnh sửa lời thoại của bạn"}</span>
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
                        {language === "en" ? "Cancel" : "Hủy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAndResend(msg.id)}
                        disabled={!editInputText.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-1"
                      >
                        <span>{language === "en" ? "Save & Resend" : "Lưu & Gửi lại"}</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed group ${
                      isUser
                        ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20 font-medium"
                        : "bg-white dark:bg-[#0c0e17]/95 border border-slate-200 dark:border-indigo-950/70 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-sm backdrop-blur-md"
                    }`}
                  >
                    {isUser && msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2.5">
                        {msg.images.map((imgSrc, idx) => (
                          <div
                            key={idx}
                            className="relative rounded-2xl overflow-hidden border border-white/30 shadow-md max-w-xs group cursor-pointer"
                            onClick={() => window.open(imgSrc, "_blank")}
                            title={language === "en" ? "Click to view full image" : "Bấm để xem ảnh phóng to"}
                          >
                            <img
                              src={imgSrc}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {isUser ? (
                      <div>
                        <div>{msg.content}</div>
                        {!isLoading && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5 mt-1.5 pt-1 border-t border-white/20">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(msg)}
                              className="px-2 py-0.5 rounded-lg bg-black/30 hover:bg-black/50 text-[10px] text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title={language === "en" ? "Edit message" : "Sửa tin nhắn"}
                            >
                              <span>✏️ {language === "en" ? "Edit" : "Sửa"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="px-2 py-0.5 rounded-lg bg-black/30 hover:bg-black/50 text-[10px] text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title={language === "en" ? "Copy" : "Chép"}
                            >
                              <span>{copiedMsgId === msg.id ? (language === "en" ? "✓ Copied" : "✓ Đã chép") : (language === "en" ? "📋 Copy" : "📋 Chép")}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : msg.content ? (
                      <div>
                        <MarkdownRenderer content={msg.content} hideActionNotes={hideActionNotes} />
                        {/* Action Toolbar under AI Response */}
                        <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/70 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-medium"
                              title={language === "en" ? "Copy" : "Sao chép"}
                            >
                              <span>{copiedMsgId === msg.id ? "✓" : "📋"}</span>
                              <span>{copiedMsgId === msg.id ? (language === "en" ? "Copied" : "Đã chép") : (language === "en" ? "Copy" : "Sao chép")}</span>
                            </button>

                            {/* Voice Reading Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleSpeech(msg.id, msg.content)}
                              className={`px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-medium ${
                                speakingMsgId === msg.id
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                              }`}
                              title={speakingMsgId === msg.id ? (language === "en" ? "Stop reading" : "Dừng đọc") : (language === "en" ? "Read aloud with Neural voice" : "Đọc to bằng giọng nói Neural chuẩn phim")}
                            >
                              <span>{speakingMsgId === msg.id ? "⏹" : "🔊"}</span>
                              <span>{speakingMsgId === msg.id ? (language === "en" ? "Stop" : "Dừng") : (language === "en" ? "Read aloud" : "Đọc to")}</span>
                            </button>
                          </div>

                          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, "up")}
                              className={`p-1 rounded-md transition-colors cursor-pointer text-xs ${
                                messageFeedback[msg.id] === "up"
                                  ? "text-emerald-500 bg-emerald-500/10 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                              }`}
                              title={language === "en" ? "Helpful" : "Hữu ích"}
                            >
                              👍
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, "down")}
                              className={`p-1 rounded-md transition-colors cursor-pointer text-xs ${
                                messageFeedback[msg.id] === "down"
                                  ? "text-rose-500 bg-rose-500/10 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                              }`}
                              title={language === "en" ? "Needs improvement" : "Chưa đúng ý"}
                            >
                              👎
                            </button>
                          </div>
                        </div>
                      </div>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400 py-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  )}
                </div>
                )}

                {/* Avatar của User */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 border border-indigo-400/40 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 overflow-hidden shadow-xs shadow-indigo-500/30">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.displayName?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Stop Generating Button */}
      {isLoading && (
        <div className="flex justify-center -mb-3 z-20 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={handleStopGenerating}
            className="px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white dark:bg-[#171a2a] dark:hover:bg-[#20243b] dark:text-slate-200 border border-slate-700/60 dark:border-indigo-900/80 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-98"
          >
            <span className="w-2 h-2 rounded-xs bg-rose-500 animate-pulse" />
            <span>{language === "en" ? "Stop generating response" : "Dừng tạo câu trả lời"}</span>
          </button>
        </div>
      )}

      {/* 3. Khung Nhập Tin Nhắn */}
      <div className="px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-8 bg-white/80 dark:bg-[#111218]/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 shrink-0">
        {/* Attached Images Preview Tray */}
        {attachedImages.length > 0 && (
          <div className="max-w-4xl mx-auto mb-2.5 p-2.5 rounded-2xl bg-white/95 dark:bg-[#10121d]/95 backdrop-blur-xl border border-indigo-500/30 dark:border-cyan-500/30 flex flex-wrap items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
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
                  title={language === "en" ? "Remove image" : "Xóa ảnh"}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-bold text-indigo-600 dark:text-cyan-400 flex items-center gap-1">
                <span>📸</span> {language === "en" ? `Attached ${attachedImages.length} image(s)` : `Đã đính kèm ${attachedImages.length} hình ảnh`}
              </span>
              <span className="text-[10px]">{language === "en" ? "Assistant will observe and respond based on images" : "Trợ lý sẽ quan sát và phản hồi theo hình ảnh"}</span>
            </div>
          </div>
        )}

        {/* Quick Tool Helpers (Gợi ý ẩn placeholder - Không điền chữ cứng vào khung chat) */}
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-bold shrink-0">{language === "en" ? "⚡ Tools:" : "⚡ Công cụ:"}</span>
          {getBotQuickTools(botId, bot?.category).map((tool) => {
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
                    textareaRef.current?.focus();
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all shadow-2xs cursor-pointer font-semibold flex items-center gap-1 ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400/50"
                    : tool.isHighlight
                    ? "bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-400/50 dark:border-cyan-400/50 text-indigo-600 dark:text-cyan-300 hover:scale-105"
                    : "bg-white/90 dark:bg-[#181a24]/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-cyan-400"
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
          <div className="max-w-4xl mx-auto flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 dark:border-cyan-500/30 text-xs font-semibold text-indigo-700 dark:text-cyan-300 w-fit animate-in fade-in duration-150">
            <span>✨ {language === "en" ? "Active:" : "Đang bật:"} <strong>{activeTool.label}</strong></span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
              — {language === "en" ? "Chat input switched to helper prompt (Placeholder)" : "Khung chat đã chuyển sang gợi ý ẩn (Placeholder)"}
            </span>
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              className="ml-1 px-1.5 py-0.2 rounded-md hover:bg-rose-500 hover:text-white text-slate-400 text-xs transition-colors cursor-pointer"
              title={language === "en" ? "Disable mode" : "Hủy chế độ này"}
            >
              ✕ {language === "en" ? "Off" : "Tắt"}
            </button>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="max-w-4xl mx-auto relative flex items-end gap-2.5"
        >
          {/* Attach Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[52px] sm:h-[56px] w-12 text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] mb-0.5"
            title={language === "en" ? "Attach or paste image (Ctrl+V)" : "Đính kèm hoặc dán hình ảnh (Ctrl+V)"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Voice Input (Microphone Speech-to-Text) Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`h-[52px] sm:h-[56px] w-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] mb-0.5 ${
              isListening
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse ring-2 ring-rose-400"
                : "text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={
              isListening
                ? language === "en" ? "Listening... Click to stop" : "Đang lắng nghe... Bấm để dừng"
                : language === "en" ? "Voice input (Microphone)" : "Nói bằng giọng nói (Microphone)"
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

          <div className="relative flex-1 rounded-2xl bg-slate-100 dark:bg-[#181a24] border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder={
                activeTool
                  ? activeTool.placeholder
                  : language === "en"
                  ? `Message ${bot?.name || "AI assistant"}, paste image (Ctrl+V)... (Enter to send)`
                  : `Nhắn tin cho ${bot?.name || "trợ lý AI"}, dán ảnh (Ctrl+V)... (Enter để gửi)`
              }
              rows={2}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent resize-none text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden max-h-56 min-h-[58px] sm:min-h-[64px] leading-relaxed scrollbar-thin"
            />
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
            className="h-[52px] sm:h-[56px] px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 disabled:opacity-40 disabled:hover:opacity-40 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed mb-0.5"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{language === "en" ? "Send →" : "Gửi →"}</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-2">
          {botId === "goc-chua-lanh" || botId === "healing-companion"
            ? language === "en"
              ? "🕊️ Completely free chat (0 Credit). Empathetic, sincere and warm."
              : "🕊️ Trò chuyện hoàn toàn miễn phí (0 Credit). Phản hồi chân thành, thấu cảm và ấm áp."
            : ["char-tong-tai", "char-co-da-than", "char-tieu-viem", "char-lam-tuyet-dao"].includes(botId)
            ? language === "en"
              ? "👑 VIP Story Character (2 Credits / message). Immersive roleplay dialogue."
              : "👑 Nhân vật truyện VIP (2 Credits / tin nhắn). Nhập vai đối thoại sống động."
            : language === "en"
            ? "✨ Each message costs 1 Credit. AI responses tailored to specialized persona."
            : "✨ Mỗi tin nhắn tiêu tốn 1 Credit. Phản hồi được sinh bởi AI theo đúng vai trò chuyên biệt."}
        </p>
      </div>

      {/* 4. Modal Hết Credit / Nạp Thêm (RechargeModal) */}
      <RechargeModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
      />

      {/* 5. Modal Đăng nhập (LoginForm) */}
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
    </div>
  );
}
