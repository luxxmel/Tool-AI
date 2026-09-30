import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

// GET /api/conversations?userId=... - Lấy danh sách cuộc trò chuyện
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const all = searchParams.get("all") === "true";

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_") || userId === "null" || userId === "undefined") {
      return NextResponse.json([]);
    }

    const whereClause: any = { userId };
    if (projectId) {
      whereClause.projectId = projectId;
    } else if (!all) {
      whereClause.projectId = null;
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          select: { id: true },
        },
      },
    });

    const data = conversations.map((c) => ({
      id: c.id,
      title: c.title || "Cuộc trò chuyện mới",
      botId: c.botId,
      botName: c.bot?.name || "OmniAI",
      botAvatar: c.bot?.avatar,
      projectId: c.projectId,
      messagesCount: c.messages.length,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lỗi khi tải danh sách hội thoại:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách hội thoại" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Tạo một cuộc trò chuyện/dự án mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, botId, userId } = body;

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_")) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để tạo cuộc trò chuyện" },
        { status: 401 }
      );
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để tạo cuộc trò chuyện" },
        { status: 401 }
      );
    }

    const targetBotId = botId || "omni-assistant";

    const newConv = await prisma.conversation.create({
      data: {
        userId: user.id,
        botId: targetBotId,
        title: title || "Cuộc trò chuyện mới",
      },
      include: {
        bot: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(newConv);
  } catch (error) {
    console.error("Lỗi khi tạo cuộc hội thoại mới:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo cuộc hội thoại mới" },
      { status: 500 }
    );
  }
}
