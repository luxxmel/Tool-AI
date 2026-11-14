import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/user/keys - Lấy danh sách API keys của user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Ẩn bớt ký tự khóa API vì lý do bảo mật, chỉ chừa 8 ký tự đầu và 4 ký tự cuối
    const maskedKeys = keys.map((k) => ({
      id: k.id,
      name: k.name,
      maskedKey: `${k.key.slice(0, 10)}...${k.key.slice(-4)}`,
      fullKey: k.key, // Trả về để user copy lúc quản lý
      status: k.status,
      tokensUsed: k.tokensUsed,
      creditsUsed: k.creditsUsed,
      rateLimit: k.rateLimit,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));

    return NextResponse.json({ success: true, keys: maskedKeys });
  } catch (err: any) {
    console.error("GET API Keys error:", err);
    return NextResponse.json({ error: "Lỗi tải danh sách API Keys" }, { status: 500 });
  }
}

// POST /api/user/keys - Tạo API key mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });
    }

    // Giới hạn tối đa 5 API Keys cho mỗi tài khoản để chống spam
    const existingCount = await prisma.apiKey.count({
      where: { userId, status: "ACTIVE" },
    });

    if (existingCount >= 5 && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bạn đã tạo tối đa 5 khóa API. Vui lòng thu hồi khóa cũ trước khi tạo mới!" },
        { status: 400 }
      );
    }

    // Sinh API Key chuẩn tiền tố 'btk-' (BietTuot Key) bảo mật cao
    const randomHex = crypto.randomBytes(24).toString("hex");
    const generatedKey = `btk-${randomHex}`;

    const newKey = await prisma.apiKey.create({
      data: {
        userId,
        name: (name || "Khóa API Biết Tuốt").trim().slice(0, 50),
        key: generatedKey,
        status: "ACTIVE",
        rateLimit: user.role === "VIP" || user.role === "ADMIN" ? 120 : 60,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo khóa API thành công!",
      key: newKey,
    });
  } catch (err: any) {
    console.error("POST API Key error:", err);
    return NextResponse.json({ error: "Không thể tạo API Key" }, { status: 500 });
  }
}

// PATCH /api/user/keys - Thu hồi hoặc đổi tên API Key
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId, userId, action, name } = body;

    if (!keyId || !userId) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.userId !== userId) {
      return NextResponse.json({ error: "Không tìm thấy khóa hoặc không có quyền" }, { status: 403 });
    }

    if (action === "REVOKE") {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: "REVOKED" },
      });
      return NextResponse.json({ success: true, message: "Đã thu hồi khóa API thành công!" });
    }

    if (action === "RENAME" && name) {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { name: name.trim().slice(0, 50) },
      });
      return NextResponse.json({ success: true, message: "Đã đổi tên khóa API!" });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH API Key error:", err);
    return NextResponse.json({ error: "Lỗi cập nhật API Key" }, { status: 500 });
  }
}

// DELETE /api/user/keys - Xóa hẳn API Key
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("keyId");
    const userId = searchParams.get("userId");

    if (!keyId || !userId) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.userId !== userId) {
      return NextResponse.json({ error: "Không có quyền xóa khóa này" }, { status: 403 });
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ success: true, message: "Đã xóa khóa API vĩnh viễn!" });
  } catch (err: any) {
    console.error("DELETE API Key error:", err);
    return NextResponse.json({ error: "Lỗi xóa khóa API" }, { status: 500 });
  }
}
