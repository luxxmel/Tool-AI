import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stories/notifications: Lấy thông báo duyệt bài & thưởng credits của tác giả
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) userId = cookieUser.id;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.storyNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Lỗi khi tải thông báo tác giả:", error);
    return NextResponse.json({ notifications: [] });
  }
}

// POST /api/stories/notifications: Đánh dấu đã đọc
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    if (userId) {
      await prisma.storyNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
