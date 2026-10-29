import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";
import { DEDICATED_BOT_IDS } from "@/lib/characterUtils";

// GET /api/conversations?userId=... - Lấy danh sách cuộc trò chuyện
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const botId = searchParams.get("botId");
    const excludeCharacters = searchParams.get("excludeCharacters") === "true";
    const all = searchParams.get("all") === "true";

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_") || userId === "null" || userId === "undefined") {
      return NextResponse.json([]);
    }

    // Tra cứu thông tin người dùng qua ensureUser để lấy danh sách ID / Email mở rộng
    const user = await ensureUser(userId);
    const possibleUserIds = Array.from(
      new Set([userId, user?.id, user?.email].filter((x): x is string => Boolean(x) && typeof x === "string"))
    );

    const whereClause: any = {
      userId: possibleUserIds.length === 1 ? possibleUserIds[0] : { in: possibleUserIds },
    };
    if (projectId) {
      whereClause.projectId = projectId;
    } else if (!all) {
      whereClause.projectId = null;
    }

    if (botId) {
      whereClause.botId = botId;
    } else if (excludeCharacters) {
      // Loại trừ các nhân vật truyện và các trợ lý chuyên môn riêng biệt khỏi danh sách "Đoạn chat gần đây" ở Sidebar chính
      whereClause.NOT = [
        { botId: { startsWith: "char-" } },
        { botId: { in: Array.from(DEDICATED_BOT_IDS) } },
      ];
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
      botName: c.bot?.name || "Biết Tuốt AI",
      botAvatar: c.bot?.avatar,
      projectId: c.projectId,
      messagesCount: c.messages.length,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn("Lỗi khi tải danh sách hội thoại (fallback rỗng):", error);
    return NextResponse.json([]);
  }
}

// POST /api/conversations - Tạo một cuộc trò chuyện/dự án mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, botId = "omni-assistant", title = "Cuộc trò chuyện mới", projectId = null } = body;

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_") || userId === "null" || userId === "undefined") {
      return NextResponse.json({ error: "Yêu cầu đăng nhập hợp lệ để lưu cuộc trò chuyện" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Đảm bảo bot tồn tại trong database
    const bot = await prisma.bot.upsert({
      where: { id: botId },
      update: {},
      create: {
        id: botId,
        name: "Biết Tuốt AI",
        category: "general",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
        description: "Trợ lý trí tuệ nhân tạo toàn năng",
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        botId: bot.id,
        title,
        projectId,
      },
      include: {
        bot: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo cuộc trò chuyện mới:", error);
    return NextResponse.json({ error: "Không thể tạo cuộc trò chuyện" }, { status: 500 });
  }
}
