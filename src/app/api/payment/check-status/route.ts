import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayOS } from "@/lib/payos";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCodeStr = searchParams.get("orderCode");

    if (!orderCodeStr) {
      return NextResponse.json({ error: "Thiếu orderCode" }, { status: 400 });
    }

    const orderCode = parseInt(orderCodeStr, 10);
    if (isNaN(orderCode)) {
      return NextResponse.json({ error: "orderCode không hợp lệ" }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { orderCode },
      include: {
        user: {
          select: {
            id: true,
            credits: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // 1. Nếu đơn hàng đã hoàn tất (qua Webhook trước đó)
    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        status: "PAID",
        orderCode: order.orderCode,
        creditsAdded: order.credits,
        totalCredits: order.user.credits,
        packageName: order.packageName,
      });
    }

    // 2. Nếu vẫn đang PENDING, chủ động truy vấn PayOS API để đồng bộ trạng thái thực tế
    const payos = getPayOS();
    if (payos) {
      try {
        const paymentInfo = await payos.paymentRequests.get(orderCode);
        if (paymentInfo && (paymentInfo as any).status === "PAID") {
          // Cập nhật trạng thái thành PAID
          await prisma.paymentOrder.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });

          // Cộng credits cho user
          const updatedUser = await prisma.user.update({
            where: { id: order.userId },
            data: {
              credits: { increment: order.credits },
            },
            select: { credits: true },
          });

          console.log(
            `🎉 [Check Status] Phát hiện thanh toán thành công qua PayOS API cho đơn #${orderCode}! Đã cộng ${order.credits} credits.`
          );

          return NextResponse.json({
            success: true,
            status: "PAID",
            orderCode: order.orderCode,
            creditsAdded: order.credits,
            totalCredits: updatedUser.credits,
            packageName: order.packageName,
          });
        }
      } catch (err: any) {
        // Bỏ qua nếu chưa thanh toán hoặc lỗi tra cứu
      }
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      orderCode: order.orderCode,
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi kiểm tra trạng thái đơn hàng" },
      { status: 500 }
    );
  }
}
