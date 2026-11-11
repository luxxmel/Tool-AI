import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

// GET /api/stories/[id]: Chi tiết truyện & Tăng lượt xem (View Counter) + Kiểm tra thưởng Credits cho tác giả
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID truyện" }, { status: 400 });
    }

    // Tăng view counter
    const story = await prisma.publishedStory.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy truyện" }, { status: 404 });
    }

    // 🏆 Cơ chế thưởng Credits tự động cho Tác giả khi đạt mốc Viral:
    // Mốc 1: Đạt 100 views => Thưởng +2 Credits (nếu chưa nhận)
    // Mốc 2: Đạt 500 views => Thưởng +5 Credits (nếu chưa nhận)
    if (story.views >= 500 && story.rewardClaimedLevel < 2) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: story.authorId },
          data: { credits: { increment: 5 } },
        }),
        prisma.publishedStory.update({
          where: { id: story.id },
          data: { rewardClaimedLevel: 2 },
        }),
        prisma.storyNotification.create({
          data: {
            userId: story.authorId,
            title: `Thưởng nóng +5 Credits cho truyện "${story.title}"! 🚀`,
            content: `Tuyệt vời! Tác phẩm "${story.title}" của bạn đã vượt mốc 500 lượt đọc! Hệ thống đã thưởng ngay 5 Credits vào ví của bạn. Hãy tiếp tục sáng tác nhé!`,
            type: "REWARD",
          },
        }),
      ]);
    } else if (story.views >= 100 && story.rewardClaimedLevel < 1) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: story.authorId },
          data: { credits: { increment: 2 } },
        }),
        prisma.publishedStory.update({
          where: { id: story.id },
          data: { rewardClaimedLevel: 1 },
        }),
        prisma.storyNotification.create({
          data: {
            userId: story.authorId,
            title: `Thưởng +2 Credits cho truyện "${story.title}"! 🎉`,
            content: `Chúc mừng! Tác phẩm "${story.title}" của bạn đã đạt mốc 100 lượt đọc đầu tiên. Bạn được thưởng 2 Credits vào tài khoản!`,
            type: "REWARD",
          },
        }),
      ]);
    }

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Lỗi khi tải chi tiết truyện:", error);
    return NextResponse.json({ error: "Không thể tải truyện" }, { status: 500 });
  }
}

// POST /api/stories/[id]: Thả tim (Like) hoặc Bỏ thả tim truyện
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    let userId = body.userId;
    let userEmail = body.userEmail;
    let userName = body.userName;

    // Cookie fallback
    if (!userId || !userEmail) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (!userId && cookieUser?.id) userId = cookieUser.id;
          if (!userEmail && cookieUser?.email) userEmail = cookieUser.email;
        } catch {}
      }
    }

    const user = await ensureUser(userId, userEmail, userName);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thả tim truyện" }, { status: 401 });
    }

    // Kiểm tra đã like chưa
    const existing = await prisma.storyLike.findUnique({
      where: {
        storyId_userId: {
          storyId: id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Bỏ like
      await prisma.$transaction([
        prisma.storyLike.delete({ where: { id: existing.id } }),
        prisma.publishedStory.update({
          where: { id },
          data: { likes: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ isLiked: false, message: "Đã bỏ thích truyện" });
    } else {
      // Like
      await prisma.$transaction([
        prisma.storyLike.create({
          data: {
            storyId: id,
            userId: user.id,
          },
        }),
        prisma.publishedStory.update({
          where: { id },
          data: { likes: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ isLiked: true, message: "Đã thích truyện" });
    }
  } catch (error: any) {
    console.error("Lỗi khi like truyện:", error);
    return NextResponse.json({ error: "Không thể tương tác vào lúc này" }, { status: 500 });
  }
}

// DELETE /api/stories/[id]: Xóa truyện (chỉ tác giả hoặc Admin mới có quyền)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const story = await prisma.publishedStory.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Không tìm thấy truyện" }, { status: 404 });
    }

    // Xác thực quyền sở hữu
    if (userId !== story.authorId) {
      const user = await prisma.user.findUnique({ where: { id: userId || "" } });
      if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Bạn không có quyền xóa truyện này" }, { status: 403 });
      }
    }

    await prisma.publishedStory.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa truyện thành công" });
  } catch (error: any) {
    console.error("Lỗi khi xóa truyện:", error);
    return NextResponse.json({ error: "Không thể xóa truyện" }, { status: 500 });
  }
}
