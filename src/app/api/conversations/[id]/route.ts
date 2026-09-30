import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { parseMessageImages } from "@/lib/imageUtils";

// GET /api/conversations/[id] - Lấy chi tiết cuộc trò chuyện và toàn bộ tin nhắn
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        bot: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Không tìm thấy cuộc trò chuyện" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      botId: conversation.botId,
      bot: conversation.bot,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map((m) => {
        const parsed = parseMessageImages(m.content);
        return {
          id: m.id,
          role: m.sender.toLowerCase() === "user" ? "user" : "assistant",
          content: parsed.text || (parsed.images.length > 0 ? "" : m.content),
          images: parsed.images,
          createdAt: m.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("Lỗi khi tải chi tiết cuộc trò chuyện:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải cuộc trò chuyện" },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Đổi tên tiêu đề cuộc trò chuyện
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề không hợp lệ" }, { status: 400 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Lỗi khi cập nhật tiêu đề cuộc trò chuyện:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật tiêu đề" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Xóa cuộc trò chuyện
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa cuộc trò chuyện:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa cuộc trò chuyện" },
      { status: 500 }
    );
  }
}
