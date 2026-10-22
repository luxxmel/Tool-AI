import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

import { parseMessageImages } from "@/lib/imageUtils";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_") || userId === "null" || userId === "undefined") {
      return NextResponse.json({
        conversationId: null,
        messages: [],
      });
    }

    // Tra cứu thông tin người dùng qua ensureUser để lấy danh sách ID / Email mở rộng
    const user = await ensureUser(userId);
    const possibleUserIds = Array.from(
      new Set([userId, user?.id, user?.email].filter((x): x is string => Boolean(x) && typeof x === "string"))
    );

    // Tìm cuộc hội thoại gần nhất của user với bot này
    const conversation = await prisma.conversation.findFirst({
      where: {
        userId: possibleUserIds.length === 1 ? possibleUserIds[0] : { in: possibleUserIds },
        botId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({
        conversationId: null,
        messages: [],
      });
    }

    return NextResponse.json({
      conversationId: conversation.id,
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
    console.error("Lỗi khi tải lịch sử tin nhắn:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải lịch sử tin nhắn" },
      { status: 500 }
    );
  }
}
