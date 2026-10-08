import fs from "fs";
import path from "path";

export interface AnnouncementItem {
  id: string | number;
  type: "new_feature" | "event" | "tip" | "update";
  emoji: string;
  tag: string;
  tagEn?: string;
  tagColor?: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  cta: string;
  ctaEn?: string;
  ctaHref?: string;
  bg?: string;
  accent?: string;
  image?: string;
  createdAt?: string;
}

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-1",
    type: "new_feature",
    emoji: "✨",
    tag: "Tính năng mới",
    tagEn: "New Feature",
    tagColor: "from-violet-600 to-indigo-600",
    title: "Ra mắt TTS Neural tiếng Việt chuẩn phim!",
    titleEn: "Cinema-Grade Neural TTS Voice is Live!",
    desc: "Giọng đọc AI Neural cực kỳ tự nhiên, hỗ trợ 3 giọng: Tổng tài, Nữ truyền cảm, Nữ ngọt ngào. Thử ngay trong khung chat!",
    descEn: "Ultra-natural AI Neural voice reader with 3 expressive tones. Try it out right in the chat room!",
    cta: "Thử ngay →",
    ctaEn: "Try Now →",
    ctaHref: "#",
    bg: "from-violet-950/80 via-indigo-950/80 to-slate-950/90",
    accent: "border-violet-500/40",
    image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ann-2",
    type: "event",
    emoji: "🎉",
    tag: "Sự kiện tháng 10",
    tagEn: "October Event",
    tagColor: "from-rose-600 to-orange-500",
    title: "Thử thách Prompt AI — Giải thưởng 500K VND!",
    titleEn: "AI Prompt Contest — Win 500K VND Prizes!",
    desc: "Tham gia cuộc thi tạo prompt sáng tạo nhất trong tháng 10. Bài tốt nhất được ghim trang chủ và nhận thưởng từ đội ngũ Biết Tuốt AI.",
    descEn: "Participate in the most creative AI prompt contest. Top submissions will be featured on homepage with rewards.",
    cta: "Đăng bài dự thi →",
    ctaEn: "Submit Entry →",
    ctaHref: "#",
    bg: "from-rose-950/80 via-orange-950/70 to-slate-950/90",
    accent: "border-rose-500/40",
    image: "https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?w=400&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ann-3",
    type: "tip",
    emoji: "💡",
    tag: "Mẹo hay",
    tagEn: "Pro Tip",
    tagColor: "from-amber-500 to-yellow-500",
    title: "Dùng Magic Wand ✨ để nâng cấp prompt của bạn",
    titleEn: "Use Magic Wand ✨ to Enhance Your Prompts",
    desc: "Chức năng Magic Wand tự động cải thiện câu hỏi của bạn thành prompt chuyên nghiệp, giúp AI hiểu đúng ý hơn. Thử trong khung chat bây giờ!",
    descEn: "Magic Wand automatically rewrites basic questions into professional prompts for sharper AI outputs. Try it now!",
    cta: "Xem hướng dẫn →",
    ctaEn: "View Guide →",
    ctaHref: "#",
    bg: "from-amber-950/80 via-yellow-950/70 to-slate-950/90",
    accent: "border-amber-500/40",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_FILE = path.join(process.cwd(), "prisma", "announcements.json");

export function getStoredAnnouncements(): AnnouncementItem[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Lỗi khi đọc announcements.json:", e);
  }
  return DEFAULT_ANNOUNCEMENTS;
}

export function saveStoredAnnouncements(list: AnnouncementItem[]): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Lỗi khi lưu announcements.json:", e);
  }
}
