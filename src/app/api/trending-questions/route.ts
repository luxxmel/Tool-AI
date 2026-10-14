import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Lấy các bài viết (Post) được thả nhiều cảm xúc nhất
    const posts = await prisma.post.findMany({
      where: {
        status: "published",
      },
      include: {
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
        reactions: {
          select: {
            type: true,
          },
        },
      },
      take: 50,
    });

    if (posts.length > 0) {
      // Tính tổng điểm cảm xúc (hoặc số lượt thả reactions)
      const rankedPosts = posts
        .map((p) => {
          const reactionCount = p._count.reactions || p.reactions.length || 0;
          const totalScore = reactionCount + (p.likes || 0);
          return {
            id: p.id,
            text: p.title || p.content.slice(0, 80),
            count: totalScore,
            category: p.categoryLabel || p.category,
            postId: p.id,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      return NextResponse.json({
        questions: rankedPosts.map((p) => ({
          text: p.text,
          count: p.count,
          postId: p.postId,
        })),
        isEmpty: false,
        period: "hot",
      });
    }

    // 2. Fallback: Nếu chưa có bài viết nào, lấy câu hỏi của user trong các cuộc hội thoại
    const messages = await prisma.message.findMany({
      where: { sender: "USER" },
      select: { content: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const freq: Record<string, { text: string; count: number }> = {};
    for (const msg of messages) {
      const raw = msg.content.trim();
      if (raw.length < 10 || raw.length > 200) continue;
      if (raw.startsWith("[") || raw.startsWith("{")) continue;
      const key = raw.toLowerCase().replace(/[?!.,;:…]+$/, "").trim();
      if (!freq[key]) freq[key] = { text: raw, count: 0 };
      freq[key].count++;
    }

    const sorted = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return NextResponse.json({
      questions: sorted.map((q) => ({
        text: q.text,
        count: q.count,
      })),
      isEmpty: sorted.length === 0,
      period: "24h",
    });
  } catch (err) {
    console.error("[trending-questions]", err);
    return NextResponse.json(
      { questions: [], isEmpty: true, period: "24h" },
      { status: 500 }
    );
  }
}
