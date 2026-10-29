import { TRENDING_CHARACTERS } from "@/data/aiData";

const STORY_CHARACTER_IDS = new Set<string>([
  ...TRENDING_CHARACTERS.map((c) => c.id),
  "char-tong-tai",
  "char-co-da-than",
  "char-tieu-viem",
  "char-lam-tuyet-dao",
]);

// Danh sách các trợ lý AI chuyên môn và tính năng riêng biệt (Không thuộc đoạn chat chính ngoài trang chủ)
export const DEDICATED_BOT_IDS = new Set<string>([
  // Góc Chữa Lành
  "goc-chua-lanh",
  "healing-companion",
  // Trợ lý học tập & chuyên môn
  "cuppy",
  "math-solver",
  "english-teacher",
  "exam-prep",
  "doc-assistant",
  "physics-solver",
  "career-guide",
  "writing-assistant",
  "mindmap-creator",
  "ai-detector",
  "ai-artist",
  // Bói toán & Chiêm tinh
  "tu-vi-master",
  "tarot-reader",
  "cosmic-chart",
  "love-astrology",
  "love-coach",
  "love-advisor",
  "numerology",
  // Đời sống & giải trí
  "health-advice",
  "finance-advisor",
  "movie-assistant",
  "book-assistant",
  "youtube-summarizer",
]);

/**
 * Kiểm tra xem một botId có phải là nhân vật truyện / nhập vai hay không
 */
export function isCharacterStoryBot(botId?: string | null): boolean {
  if (!botId) return false;
  const bid = botId.toLowerCase().trim();
  if (bid.startsWith("char-")) return true;
  return STORY_CHARACTER_IDS.has(bid);
}

/**
 * Kiểm tra xem botId có phải là chat chính ngoài trang chủ (Biết Tuốt AI / omni-assistant) hay không.
 * Các trợ lý riêng (Tarot, Thầy Bói, Góc Chữa Lành, v.v...) hoặc nhân vật truyện không thuộc chat chính.
 */
export function isDedicatedBotOrCharacter(botId?: string | null): boolean {
  if (!botId) return false;
  const bid = botId.toLowerCase().trim();
  if (isCharacterStoryBot(bid)) return true;
  if (DEDICATED_BOT_IDS.has(bid)) return true;
  return false;
}
