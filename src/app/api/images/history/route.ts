import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/images/history?userId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ images: [] });
    }

    const images = await prisma.generatedImage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("[Images History GET] Lỗi:", error);
    return NextResponse.json({ error: "Lỗi tải lịch sử ảnh" }, { status: 500 });
  }
}

// DELETE /api/images/history?id=...&userId=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    if (id) {
      await prisma.generatedImage.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, deletedId: id });
    }

    // Nếu không truyền id thì xóa tất cả ảnh của user này
    await prisma.generatedImage.deleteMany({
      where: { userId },
    });
    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ ảnh" });
  } catch (error: any) {
    console.error("[Images History DELETE] Lỗi:", error);
    return NextResponse.json({ error: "Lỗi xóa ảnh" }, { status: 500 });
  }
}
