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

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [];

const STORAGE_FILE = path.join(process.cwd(), "prisma", "announcements.json");

export function getStoredAnnouncements(): AnnouncementItem[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
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
