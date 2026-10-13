import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

// POST /api/user/checkin - Điểm danh nhận thưởng theo chuỗi ngày (Streak)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;
    const clientStreak = Number(body.streak || 0);

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_")) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để điểm danh nhận quà" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const newStreak = clientStreak + 1;

    // Ngày 1 -> 7: thưởng tăng dần tương ứng với số ngày (Ngày 1: +1, Ngày 2: +2, ..., Ngày 7: +7)
    // Từ ngày thứ 8 trở đi: duy trì đều đặn 2 credits / ngày
    let rewardCredits = 2;
    if (newStreak <= 7) {
      rewardCredits = newStreak;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: rewardCredits },
      },
    });

    return NextResponse.json({
      success: true,
      streak: newStreak,
      rewardCredits,
      newCredits: updatedUser.credits,
      message:
        newStreak <= 7
          ? `Điểm danh ngày ${newStreak}/7! Bạn nhận được +${rewardCredits} Credits.`
          : `Chuỗi điểm danh ngày ${newStreak}! Bạn nhận được +2 Credits.`,
      date: todayStr,
    });
  } catch (error: any) {
    console.error("Lỗi điểm danh hàng ngày:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống khi điểm danh" }, { status: 500 });
  }
}
