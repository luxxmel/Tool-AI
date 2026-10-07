import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

// GET /api/projects?userId=... - Lấy danh sách tất cả dự án của người dùng
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_") || userId === "null" || userId === "undefined") {
      return NextResponse.json([]);
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        conversations: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
        },
      },
    });

    return NextResponse.json(Array.isArray(projects) ? projects : []);
  } catch (error) {
    console.warn("Lỗi khi tải danh sách dự án (fallback rỗng):", error);
    return NextResponse.json([]);
  }
}

// POST /api/projects - Tạo dự án mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, systemPrompt, icon, color, userId } = body;

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_")) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để tạo dự án" }, { status: 401 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên dự án không được để trống" }, { status: 400 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để tạo dự án" }, { status: 401 });
    }

    const newProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        systemPrompt: systemPrompt?.trim() || null,
        icon: icon || "📁",
        color: color || "indigo",
      },
    });

    return NextResponse.json(newProject);
  } catch (error) {
    console.error("Lỗi khi tạo dự án mới:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo dự án mới" },
      { status: 500 }
    );
  }
}
