import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_") || userId === "null" || userId === "undefined") {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const user = await ensureUser(userId);

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({
        ...user,
        credits: 999999,
        isUnlimited: true,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin credit user:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải credit" },
      { status: 500 }
    );
  }
}

// Nạp thêm credit cho user (Mua tùy ý hoặc Mua theo gói)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_")) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để nạp credit" }, { status: 401 });
    }

    const amount = Math.max(1, Number(body.amount) || 10);
    const price = Number(body.price) || 0;
    const orderCode = body.orderCode || `OMNI${Date.now().toString().slice(-6)}`;
    const packageName = body.packageName || "Mua tùy ý";
    const paymentMethod = body.paymentMethod || "vietqr";

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: amount },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        credits: true,
        role: true,
      },
    });

    // Lưu hoặc cập nhật bản ghi đơn nạp / giao dịch
    try {
      const codeNum = typeof orderCode === "number" ? orderCode : parseInt(String(orderCode || "").replace(/\D/g, "")) || 0;
      if (codeNum) {
        await prisma.paymentOrder.upsert({
          where: { orderCode: codeNum },
          update: { status: "PAID" },
          create: {
            orderCode: codeNum,
            userId: user.id,
            amount: price || 0,
            credits: amount,
            packageName: packageName || null,
            paymentMethod: paymentMethod || "manual",
            status: "PAID",
          },
        });
      }
    } catch (e) {
      console.warn("[Credits API] Lỗi ghi nhận paymentOrder:", e);
    }

    return NextResponse.json({
      success: true,
      credits: user.role === "ADMIN" ? 999999 : user.credits,
      message: `Đã nạp thành công ${amount} credits!`,
      user,
    });
  } catch (error) {
    console.error("Lỗi khi nạp credit:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi nạp credit" },
      { status: 500 }
    );
  }
}
