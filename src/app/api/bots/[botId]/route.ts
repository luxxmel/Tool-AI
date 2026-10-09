import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await context.params;

    let bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        avatar: true,
        description: true,
        systemPrompt: true,
        createdAt: true,
      },
    });

    if (!bot) {
      const { ALL_ASSISTANTS_MAP } = await import("@/data/aiData");
      const staticBot = ALL_ASSISTANTS_MAP[botId];
      if (staticBot) {
        bot = await prisma.bot.upsert({
          where: { id: botId },
          update: {
            name: staticBot.name,
            avatar: staticBot.avatar,
            description: staticBot.description,
            systemPrompt: staticBot.systemPrompt || staticBot.description,
          },
          create: {
            id: staticBot.id,
            name: staticBot.name,
            avatar: staticBot.avatar,
            description: staticBot.description,
            systemPrompt: staticBot.systemPrompt || staticBot.description,
          },
          select: {
            id: true,
            name: true,
            avatar: true,
            description: true,
            systemPrompt: true,
            createdAt: true,
          },
        });
      }
    }

    if (!bot) {
      return NextResponse.json(
        { error: `Không tìm thấy thông tin bot: ${botId}` },
        { status: 404 }
      );
    }

    const { ALL_ASSISTANTS_MAP } = await import("@/data/aiData");
    const staticBot = ALL_ASSISTANTS_MAP[botId];

    return NextResponse.json({
      ...bot,
      name: staticBot?.name || bot.name,
      avatar: staticBot?.avatar || bot.avatar,
      description: staticBot?.description || bot.description,
      badge: staticBot?.badge || "Trợ lý AI",
      personality: staticBot?.personality || "",
      tagline: staticBot?.tagline || "",
      greeting: staticBot?.greeting || `Xin chào! Tôi là ${staticBot?.name || bot.name}. Tôi có thể giúp gì cho bạn hôm nay?`,
      suggestedPrompts: staticBot?.suggestedPrompts || [
        `Xin chào ${staticBot?.name || bot.name}, bạn có thể giúp gì cho tôi?`,
        "Hãy giới thiệu về bản thân và phong cách của bạn",
        "Cho tôi một lời khuyên hữu ích hôm nay",
      ],
      category: staticBot?.category,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin bot:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải thông tin bot" },
      { status: 500 }
    );
  }
}

// PATCH: Admin cập nhật thông tin bot (name, description, systemPrompt, avatar)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await context.params;
    const body = await request.json();
    const { name, description, systemPrompt, avatar } = body;

    const updated = await prisma.bot.update({
      where: { id: botId },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(systemPrompt ? { systemPrompt } : {}),
        ...(avatar ? { avatar } : {}),
      },
    });

    return NextResponse.json({ success: true, bot: updated });
  } catch (error) {
    console.error("Lỗi cập nhật bot:", error);
    return NextResponse.json({ error: "Lỗi cập nhật bot" }, { status: 500 });
  }
}
