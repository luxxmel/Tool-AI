import { TRENDING_CHARACTERS } from "@/data/aiData";

const STORY_CHARACTER_IDS = new Set<string>([
  ...TRENDING_CHARACTERS.map((c) => c.id),
  "char-tong-tai",
  "char-co-da-than",
  "char-tieu-viem",
  "char-lam-tuyet-dao",
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
