import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách toàn bộ người dùng trong hệ thống (Chỉ dành cho ADMIN)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    if (!adminId) {
      return NextResponse.json(
        { error: "Thiếu định danh Quản trị viên (adminId)" },
        { status: 400 }
      );
    }

    // 1. Xác thực quyền Quản trị viên
    let adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!adminUser && adminId.includes("@")) {
      adminUser = await prisma.user.findUnique({
        where: { email: adminId.toLowerCase().trim() },
      });
    }

    const isRootAdmin =
      adminId.toLowerCase().includes("hoanglinhcntti") ||
      adminUser?.email?.toLowerCase() === "hoanglinhcntti@gmail.com";

    if (!isRootAdmin && (!adminUser || adminUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Từ chối truy cập: Chỉ Quản trị viên (ADMIN) mới có quyền truy cập!" },
        { status: 403 }
      );
    }

    // 2. Lấy danh sách người dùng
    const allUsers = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            conversations: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
      users: allUsers,
      total: allUsers.length,
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách người dùng admin:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi tải danh sách người dùng" },
      { status: 500 }
    );
  }
}

// POST: Admin phát / tặng / cấp credits cho tài khoản khác
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      adminId,
      targetUserId,
      targetEmail,
      amount = 10,
      mode = "add", // "add" | "set"
      role, // "USER" | "VIP" | "ADMIN"
    } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: "Thiếu định danh Quản trị viên (adminId)" },
        { status: 400 }
      );
    }

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ID hoặc Email người nhận" },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return NextResponse.json(
        { error: "Số lượng credits không hợp lệ" },
        { status: 400 }
      );
    }

    // 1. Xác thực quyền Quản trị viên
    let adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!adminUser && adminId.includes("@")) {
      adminUser = await prisma.user.findUnique({
        where: { email: adminId.toLowerCase().trim() },
      });
    }

    const isRootAdmin =
      adminId.toLowerCase().includes("hoanglinhcntti") ||
      adminUser?.email?.toLowerCase() === "hoanglinhcntti@gmail.com";

    if (!isRootAdmin && (!adminUser || adminUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Từ chối truy cập: Chỉ Quản trị viên (ADMIN) mới có quyền cấp phát credits!" },
        { status: 403 }
      );
    }

    // 2. Tìm người nhận
    let targetUser = null;
    if (targetUserId) {
      targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
    } else if (targetEmail) {
      targetUser = await prisma.user.findUnique({
        where: { email: targetEmail.trim().toLowerCase() },
      });
    }

    // Nếu không tìm thấy bằng Email, hỗ trợ tự động tạo tài khoản mới và nạp credit luôn
    if (!targetUser && targetEmail) {
      const cleanEmail = targetEmail.trim().toLowerCase();
      targetUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
          credits: Math.max(0, numAmount),
          role: role || "USER",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã tạo mới tài khoản ${cleanEmail} và cấp ngay ${targetUser.credits} credits!`,
        user: targetUser,
      });
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng nhận credits" },
        { status: 404 }
      );
    }

    // 3. Tính toán số credit mới
    let newCredits = targetUser.credits;
    if (mode === "set") {
      newCredits = Math.max(0, numAmount);
    } else {
      // mode "add"
      newCredits = Math.max(0, targetUser.credits + numAmount);
    }

    // Nếu targetUser là ADMIN thì số credits giữ vô hạn
    if (targetUser.role === "ADMIN" && !role) {
      newCredits = 999999;
    }

    // 4. Cập nhật User trong Database
    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        credits: newCredits,
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        credits: true,
        updatedAt: true,
      },
    });

    const prefix = numAmount >= 0 ? `+${numAmount}` : `${numAmount}`;
    const actionDesc = mode === "set" ? `đặt thành ${newCredits}` : `cộng ${prefix}`;

    return NextResponse.json({
      success: true,
      message: `Đã ${actionDesc} credits cho tài khoản ${updatedUser.name || updatedUser.email}! Số dư mới: ${updatedUser.credits} credits`,
      user: updatedUser,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
      },
    });
  } catch (error) {
    console.error("Lỗi trong API cấp phát credits admin:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi cấp phát credits" },
      { status: 500 }
    );
  }
}
