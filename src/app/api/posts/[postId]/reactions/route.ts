import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const body = await request.json();
    const { userId, type = "like" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bày tỏ cảm xúc" },
        { status: 401 }
      );
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validReactionTypes = ["like", "love", "fire", "haha", "insight"];
    const reactionType = validReactionTypes.includes(type) ? type : "like";

    // Tìm reaction hiện tại của user trên post này
    const existing = await prisma.postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    let newUserReaction: string | null = reactionType;

    if (existing) {
      if (existing.type === reactionType) {
        // Bấm lại reaction cũ -> Hủy bày tỏ cảm xúc
        await prisma.postReaction.delete({
          where: { id: existing.id },
        });
        newUserReaction = null;
      } else {
        // Đổi sang reaction khác
        await prisma.postReaction.update({
          where: { id: existing.id },
          data: { type: reactionType },
        });
        newUserReaction = reactionType;
      }
    } else {
      // Thêm reaction mới
      await prisma.postReaction.create({
        data: {
          postId,
          userId: user.id,
          type: reactionType,
        },
      });
      newUserReaction = reactionType;
    }

    // Tính lại tổng số lượng cảm xúc
    const allReactions = await prisma.postReaction.findMany({
      where: { postId },
    });

    const reactionCounts: Record<string, number> = {
      like: 0,
      love: 0,
      fire: 0,
      haha: 0,
      insight: 0,
    };

    for (const r of allReactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    }

    const totalLikes = allReactions.length;

    // Cập nhật lại post.likes
    await prisma.post.update({
      where: { id: postId },
      data: { likes: totalLikes },
    });

    return NextResponse.json({
      success: true,
      userReaction: newUserReaction,
      totalLikes,
      reactions: reactionCounts,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý bày tỏ cảm xúc:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi xử lý cảm xúc" },
      { status: 500 }
    );
  }
}
