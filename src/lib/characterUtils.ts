import { TRENDING_CHARACTERS } from "@/data/aiData";

const STORY_CHARACTER_IDS = new Set<string>([
  ...TRENDING_CHARACTERS.map((c) => c.id),
  "char-tong-tai",
  "char-co-da-than",
  "char-tieu-viem",
  "char-lam-tuyet-dao",
]);

// Danh sách các ID đại diện cho khung chat chính Biết Tuốt AI ngoài trang chủ
export const MAIN_CHAT_BOT_IDS = new Set<string>([
  "omni-assistant",
  "biettuot-ai",
  "biettuot",
  "main",
  "default",
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
 * Kiểm tra xem botId có phải là khung chat chính Biết Tuốt AI hay không
 */
export function isMainChatBot(botId?: string | null): boolean {
  if (!botId) return true; // Mặc định không truyền botId là chat chính
  const bid = botId.toLowerCase().trim();
  return MAIN_CHAT_BOT_IDS.has(bid);
}

/**
 * Kiểm tra xem botId có phải là trợ lý riêng / nhân vật truyện (không phải chat chính) hay không
 */
export function isDedicatedBotOrCharacter(botId?: string | null): boolean {
  if (!botId) return false;
  const bid = botId.toLowerCase().trim();
  return !MAIN_CHAT_BOT_IDS.has(bid);
}
