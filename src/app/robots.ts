import { MetadataRoute } from "next";
import { ALL_ASSISTANTS_LIST } from "@/data/aiData";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://biettuot.io.vn";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/profile",
        ],
      },
      // Ưu tiên đặc biệt cho Googlebot & Google-InspectionTool
      {
        userAgent: ["Googlebot", "Googlebot-Image", "Google-InspectionTool"],
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/profile",
        ],
      },
      // Cấu hình riêng cho các AI crawler để trích xuất AI Overview & Knowledge Graph
      {
        userAgent: [
          "Google-Extended",       // Google Gemini & AI Overview Crawler
          "GPTBot",                // OpenAI ChatGPT Crawler
          "ChatGPT-User",          // OpenAI Live Browsing
          "PerplexityBot",         // Perplexity AI search engine
          "ClaudeBot",             // Anthropic Claude Crawler
          "anthropic-ai",          // Anthropic
          "Bytespider",            // ByteDance / TikTok AI
          "CCBot",                 // Common Crawl (nguồn huấn luyện AI toàn cầu)
          "cohere-ai",             // Cohere AI
        ],
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/profile",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
