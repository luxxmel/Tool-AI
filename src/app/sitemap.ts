import { MetadataRoute } from "next";
import { ALL_ASSISTANTS_LIST } from "@/data/aiData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://biettuot.io.vn";
  const now = new Date();

  // 1. Các trang tĩnh và các tính năng cốt lõi
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?tab=explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=ai-apps`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=stories`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/typing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Tự động crawl toàn bộ danh sách trợ lý AI và nhân vật trong ALL_ASSISTANTS_LIST
  const botRoutes: MetadataRoute.Sitemap = (ALL_ASSISTANTS_LIST || []).map((bot) => ({
    url: `${baseUrl}/chat/${encodeURIComponent(bot.id)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Loại bỏ các URL trùng nếu có
  const uniqueUrls = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of [...staticRoutes, ...botRoutes]) {
    if (!uniqueUrls.has(item.url)) {
      uniqueUrls.set(item.url, item);
    }
  }

  return Array.from(uniqueUrls.values());
}
