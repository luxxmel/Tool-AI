import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id] - Lấy chi tiết dự án và toàn bộ các cuộc trò chuyện bên trong
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        conversations: {
          orderBy: { updatedAt: "desc" },
          include: {
            bot: {
              select: { id: true, name: true, avatar: true },
            },
            messages: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Lỗi khi tải chi tiết dự án:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải chi tiết dự án" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Cập nhật thông tin dự án
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, systemPrompt, icon, color } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(systemPrompt !== undefined ? { systemPrompt: systemPrompt?.trim() || null } : {}),
        ...(icon ? { icon } : {}),
        ...(color ? { color } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Lỗi khi cập nhật dự án:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật dự án" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Xóa dự án
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa dự án:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa dự án" },
      { status: 500 }
    );
  }
}
