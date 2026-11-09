import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/memories - Lấy danh sách ký ức của người dùng
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const cookieAuth = request.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) userId = cookieUser.id;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Chưa đăng nhập", memories: [] }, { status: 401 });
    }

    const memories = await (prisma as any).userMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ký ức:", error);
    return NextResponse.json({ error: "Lỗi hệ thống", memories: [] }, { status: 500 });
  }
}

// POST /api/user/memories - Thêm mới hoặc cập nhật ký ức
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { userId, key, content, category, isActive } = body;

    if (!userId) {
      const cookieAuth = request.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) userId = cookieUser.id;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Nội dung ký ức không được để trống" }, { status: 400 });
    }

    const newMemory = await (prisma as any).userMemory.create({
      data: {
        userId,
        key: key || "general",
        content: content.trim(),
        category: category || "general",
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, memory: newMemory });
  } catch (error) {
    console.error("Lỗi khi tạo ký ức mới:", error);
    return NextResponse.json({ error: "Không thể lưu ký ức" }, { status: 500 });
  }
}

// DELETE /api/user/memories - Xóa ký ức theo ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    let userId = searchParams.get("userId");

    if (!userId) {
      const cookieAuth = request.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) userId = cookieUser.id;
        } catch {}
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID ký ức cần xóa" }, { status: 400 });
    }

    await (prisma as any).userMemory.deleteMany({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });

    return NextResponse.json({ success: true, message: "Đã xóa ký ức thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa ký ức:", error);
    return NextResponse.json({ error: "Không thể xóa ký ức" }, { status: 500 });
  }
}
