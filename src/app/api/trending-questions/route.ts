import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ghi nhận tìm kiếm trong tab Khám phá
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawQuery = String(body?.query || "").trim();

    // Chỉ lưu các từ khóa/câu hỏi hợp lệ từ người dùng
    if (rawQuery.length >= 2 && rawQuery.length <= 150) {
      const normalized = rawQuery
        .toLowerCase()
        .replace(/[?!.,;:…]+$/, "")
        .trim();

      await prisma.exploreSearch.create({
        data: {
          query: rawQuery,
          normalizedQuery: normalized,
          createdAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[trending-questions POST]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Lấy danh sách câu hỏi / từ khóa tìm kiếm hot trong tab Khám phá
export async function GET() {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Lấy dữ liệu từ tìm kiếm trên thanh tìm kiếm của tab Khám phá
    let searchRecords = await prisma.exploreSearch.findMany({
      where: {
        createdAt: { gte: since24h },
      },
      take: 200,
    });

    let is7d = false;
    if (searchRecords.length < 5) {
      searchRecords = await prisma.exploreSearch.findMany({
        where: {
          createdAt: { gte: since7d },
        },
        take: 300,
      });
      is7d = true;
    }

    // 2. Lấy dữ liệu từ các bài viết (Post) và bình luận (Comment) chỉ trong Khám phá
    const posts = await prisma.post.findMany({
      where: {
        status: "published",
        createdAt: { gte: is7d ? since7d : since24h },
      },
      take: 100,
    });

    const comments = await prisma.comment.findMany({
      where: {
        createdAt: { gte: is7d ? since7d : since24h },
      },
      take: 100,
    });

    // Gom tần suất
    const freq: Record<string, { text: string; count: number }> = {};

    // A. Từ tìm kiếm trên thanh tìm kiếm của tab Khám phá (Trọng số ưu tiên cao)
    for (const item of searchRecords) {
      const q = String(item.query || "").trim();
      if (!q || q.length < 2 || q.length > 150) continue;
      const key = (item.normalizedQuery || q)
        .toLowerCase()
        .replace(/[?!.,;:…]+$/, "")
        .trim();

      if (!freq[key]) {
        freq[key] = { text: q, count: 0 };
      }
      freq[key].count += 1;
    }

    // B. Từ các bài đăng / tiêu đề trong Khám phá
    for (const p of posts) {
      const title = String(p.title || "").trim();
      if (title.length >= 3 && title.length <= 150) {
        const key = title
          .toLowerCase()
          .replace(/[?!.,;:…]+$/, "")
          .trim();
        if (!freq[key]) {
          freq[key] = { text: title, count: 0 };
        }
        freq[key].count += 1;
      }
    }

    // C. Từ các bình luận hỏi đáp trong bài viết Khám phá
    for (const c of comments) {
      const content = String(c.content || "").trim();
      if (
        content.length >= 5 &&
        content.length <= 120 &&
        (content.includes("?") ||
          content.toLowerCase().startsWith("làm sao") ||
          content.toLowerCase().startsWith("cho mình hỏi") ||
          content.toLowerCase().startsWith("prompt") ||
          content.toLowerCase().startsWith("cách"))
      ) {
        const key = content
          .toLowerCase()
          .replace(/[?!.,;:…]+$/, "")
          .trim();
        if (!freq[key]) {
          freq[key] = { text: content, count: 0 };
        }
        freq[key].count += 1;
      }
    }

    // Danh sách câu hỏi / chủ đề mặc định của tab Khám phá khi chưa có nhiều lượt tìm kiếm
    const fallbackExploreTopics = [
      { text: "Cách viết prompt AI tạo ảnh Anime sắc nét", count: 12 },
      { text: "Prompt lập trình web fullstack hiệu quả", count: 9 },
      { text: "Mẹo tối ưu hóa hội thoại cho trợ lý ảo", count: 7 },
      { text: "Công cụ AI chuyển giọng nói TTS tự nhiên", count: 6 },
      { text: "Cách tạo nhân vật Roleplay có cá tính", count: 5 },
      { text: "Prompt phân tích tài liệu và tóm tắt bài học", count: 4 },
    ];

    // Sắp xếp theo tần suất xuất hiện nhiều nhất
    const sorted = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Nếu dữ liệu tìm kiếm thực tế ít hơn 3 thì kết hợp với gợi ý của Khám phá
    let finalQuestions = sorted;
    if (finalQuestions.length < 3) {
      const existingKeys = new Set(finalQuestions.map((q) => q.text.toLowerCase()));
      for (const fallback of fallbackExploreTopics) {
        if (!existingKeys.has(fallback.text.toLowerCase()) && finalQuestions.length < 6) {
          finalQuestions.push(fallback);
        }
      }
    }

    return NextResponse.json({
      questions: finalQuestions.map((q) => ({
        text: q.text,
        count: q.count,
      })),
      isEmpty: false,
      period: is7d ? "7d" : "24h",
    });
  } catch (err) {
    console.error("[trending-questions GET]", err);
    return NextResponse.json(
      {
        questions: [
          { text: "Cách viết prompt AI tạo ảnh Anime sắc nét", count: 12 },
          { text: "Prompt lập trình web fullstack hiệu quả", count: 9 },
          { text: "Mẹo tối ưu hóa hội thoại cho trợ lý ảo", count: 7 },
          { text: "Công cụ AI chuyển giọng nói TTS tự nhiên", count: 6 },
        ],
        isEmpty: false,
        period: "24h",
      },
      { status: 200 }
    );
  }
}
