import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách tin nhắn / yêu cầu hỗ trợ (Dành cho Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    if (adminId) {
      const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
      if (!adminUser || adminUser.role?.toUpperCase() !== "ADMIN") {
        return NextResponse.json({ error: "Từ chối truy cập" }, { status: 403 });
      }
    }

    // Lấy các cuộc trò chuyện thuộc về botId = "support-bot"
    const tickets = await prisma.conversation.findMany({
      where: {
        botId: "support-bot",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        user: t.user,
        title: t.title || "Yêu cầu hỗ trợ",
        messagesCount: t.messages.length,
        lastMessage: t.messages[t.messages.length - 1]?.content || "",
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
        messages: t.messages,
      })),
    });
  } catch (error) {
    console.error("Lỗi khi tải ticket hỗ trợ:", error);
    return NextResponse.json({ error: "Lỗi kết nối cơ sở dữ liệu" }, { status: 500 });
  }
}

// POST: Người dùng gửi yêu cầu hỗ trợ / Admin phản hồi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, conversationId, message, sender = "USER", subject } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Nội dung tin nhắn không được để trống" }, { status: 400 });
    }

    let convId = conversationId;

    // Nếu chưa có conversation hỗ trợ, đảm bảo Bot "support-bot" tồn tại và tạo conversation mới
    if (!convId) {
      if (!userId) {
        return NextResponse.json({ error: "Vui lòng đăng nhập để gửi yêu cầu hỗ trợ" }, { status: 401 });
      }

      await prisma.bot.upsert({
        where: { id: "support-bot" },
        update: {},
        create: {
          id: "support-bot",
          name: "Trung Tâm Hỗ Trợ OmniAI",
          avatar: "💬",
          description: "Kênh tiếp nhận và giải đáp trực tiếp từ Ban Quản Trị",
          systemPrompt: "Bạn là Trợ lý hỗ trợ khách hàng chính thức của OmniAI.",
        },
      });

      const newConv = await prisma.conversation.create({
        data: {
          userId,
          botId: "support-bot",
          title: subject || `Hỗ trợ: ${message.slice(0, 30)}...`,
        },
      });
      convId = newConv.id;
    }

    // Lưu tin nhắn vào DB
    const newMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        sender: sender.toUpperCase(), // "USER" | "ASSISTANT"
        content: message.trim(),
      },
    });

    // Cập nhật thời gian cho conversation
    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      conversationId: convId,
      message: newMsg,
    });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn hỗ trợ:", error);
    return NextResponse.json({ error: "Không thể gửi tin nhắn hỗ trợ" }, { status: 500 });
  }
}
