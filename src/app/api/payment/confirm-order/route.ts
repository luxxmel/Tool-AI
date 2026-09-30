import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayOS } from "@/lib/payos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderCode: rawOrderCode } = body;

    if (!rawOrderCode) {
      return NextResponse.json({ error: "Thiếu orderCode" }, { status: 400 });
    }

    const orderCode = Number(rawOrderCode);
    if (isNaN(orderCode)) {
      return NextResponse.json({ error: "orderCode không hợp lệ" }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { orderCode },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            credits: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // 1. Nếu đơn hàng đã hoàn tất trước đó
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

    // 2. Bắt buộc phải xác minh giao dịch thực tế qua PayOS / Ngân hàng
    const payos = getPayOS();
    if (!payos) {
      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          error:
            "Cổng thanh toán PayOS chưa được cấu hình chính xác (Mã Checksum Key chưa đúng 64 ký tự). Chưa thể xác thực giao dịch tự động.",
        },
        { status: 400 }
      );
    }

    try {
      const paymentInfo = await payos.paymentRequests.get(orderCode);
      if (paymentInfo && (paymentInfo as any).status === "PAID") {
        // Chỉ duyệt và cộng tiền khi PayOS xác nhận ĐÃ NHẬN TIỀN THẬT
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            transactionId: (paymentInfo as any).reference || `PAYOS-${orderCode}`,
          },
        });

        const updatedUser = await prisma.user.update({
          where: { id: order.userId },
          data: {
            credits: { increment: order.credits },
          },
          select: {
            id: true,
            email: true,
            credits: true,
          },
        });

        console.log(
          `🎉 [Xác nhận thực tế PayOS] Đơn #${orderCode} đã thanh toán thành công! +${order.credits} credits cho user ${updatedUser.email}. Tổng số dư: ${updatedUser.credits}.`
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
      console.warn(`[PayOS Check Error] Đơn #${orderCode}:`, err?.message || err);
    }

    // Nếu PayOS chưa ghi nhận tiền về ngân hàng
    return NextResponse.json(
      {
        success: false,
        status: "PENDING",
        error: "Ngân hàng chưa ghi nhận tiền vào tài khoản cho đơn hàng này. Vui lòng kiểm tra lại giao dịch!",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Lỗi khi xác nhận đơn hàng thanh toán:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi kiểm tra thanh toán" },
      { status: 500 }
    );
  }
}
