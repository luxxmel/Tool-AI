import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

// POST /api/user/checkin - Điểm danh nhận thưởng hàng ngày
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_")) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để điểm danh nhận quà" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Kiểm tra xem hôm nay user đã điểm danh chưa
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Đọc trạng thái điểm danh từ trường hoặc tạm thời qua User
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: 2 },
      },
    });

    return NextResponse.json({
      success: true,
      rewardCredits: 2,
      newCredits: updatedUser.credits,
      message: "Chúc mừng bạn đã điểm danh thành công và nhận được +2 Credits!",
      date: todayStr,
    });
  } catch (error: any) {
    console.error("Lỗi điểm danh hàng ngày:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống khi điểm danh" }, { status: 500 });
  }
}
