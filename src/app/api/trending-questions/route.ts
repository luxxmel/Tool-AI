import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy tất cả bài viết của người dùng đã xuất bản
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
      take: 100,
    });

    if (posts && posts.length > 0) {
      // Tính tổng số lượt thả cảm xúc cho từng bài viết
      const rankedPosts = posts
        .map((p: any) => {
          const reactionCount = p._count?.reactions ?? p.reactions?.length ?? 0;
          const totalScore = reactionCount + (p.likes || 0);
          return {
            id: p.id,
            text: p.title || p.content.slice(0, 80),
            count: totalScore,
            category: p.categoryLabel || p.category,
            postId: p.id,
          };
        })
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5); // Xếp đúng 5 bài viết nhiều cảm xúc nhất

      return NextResponse.json({
        questions: rankedPosts.map((p: any) => ({
          text: p.text,
          count: p.count,
          postId: p.postId,
        })),
        isEmpty: false,
        period: "hot",
      });
    }

    // Nếu chưa có bài viết nào, trả về danh sách rỗng (không lấy tin nhắn hội thoại)
    return NextResponse.json({
      questions: [],
      isEmpty: true,
      period: "hot",
    });
  } catch (err) {
    console.error("[trending-questions]", err);
    return NextResponse.json(
      { questions: [], isEmpty: true, period: "hot" },
      { status: 500 }
    );
  }
}
