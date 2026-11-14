import { MetadataRoute } from "next";
import { ALL_ASSISTANTS_LIST } from "@/data/aiData";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/?tab=stories`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/?tab=tarot`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=tuvi`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=chiemtinh`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=battu`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=toan`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=english`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=card_scan`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
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

  // 2. Tự động crawl toàn bộ danh sách trợ lý AI và nhân vật
  const botRoutes: MetadataRoute.Sitemap = (ALL_ASSISTANTS_LIST || []).map((bot) => ({
    url: `${baseUrl}/chat/${encodeURIComponent(bot.id)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 3. Tự động lấy danh sách truyện đã xuất bản trong DB cho Googlebot & AI Overview
  let storyRoutes: MetadataRoute.Sitemap = [];
  try {
    const stories = await prisma.publishedStory.findMany({
      where: { status: "APPROVED" },
      select: { id: true, updatedAt: true },
      take: 100,
      orderBy: { updatedAt: "desc" },
    });
    storyRoutes = stories.map((s) => ({
      url: `${baseUrl}/?tab=stories&storyId=${s.id}`,
      lastModified: s.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));
  } catch (err) {
    console.warn("Sitemap: Failed to query stories", err);
  }

  // 4. Tự động lấy danh sách bài viết cộng đồng trong DB
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      select: { id: true, updatedAt: true },
      take: 100,
      orderBy: { updatedAt: "desc" },
    });
    postRoutes = posts.map((p) => ({
      url: `${baseUrl}/?tab=explore&postId=${p.id}`,
      lastModified: p.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Sitemap: Failed to query posts", err);
  }

  // Loại bỏ các URL trùng nếu có
  const uniqueUrls = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of [...staticRoutes, ...botRoutes, ...storyRoutes, ...postRoutes]) {
    if (!uniqueUrls.has(item.url)) {
      uniqueUrls.set(item.url, item);
    }
  }

  return Array.from(uniqueUrls.values());
}
