import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biettuot.io";
  const now = new Date();

  // Danh sách các trang công khai chính
  const routes = [
    "",
    "/privacy",
    "/terms",
    "/typing",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Các bot/nhân vật phổ biến
  const popularBots = [
    "omni-assistant",
    "char-luc-ngang-thien",
    "char-co-da-than",
    "char-tieu-viem",
    "char-tong-tai",
    "love-advisor",
    "love-coach",
    "tu-vi-master",
    "tarot-reader",
    "math-solver",
    "english-teacher",
    "goc-chua-lanh",
  ].map((botId) => ({
    url: `${baseUrl}/chat/${botId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...routes, ...popularBots];
}
