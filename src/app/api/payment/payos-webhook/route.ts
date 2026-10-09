import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayOS } from "@/lib/payos";

// GET endpoint để kiểm tra trạng thái webhook hoặc cho PayOS ping test
export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "PayOS VietQR PRO",
    message: "Biết Tuốt AI PayOS Webhook Endpoint is ready and listening",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "No payload provided" }, { status: 400 });
    }

    console.log("[PayOS Webhook] Nhận dữ liệu webhook:", JSON.stringify(body));

    // Thử xác thực chữ ký PayOS nếu có cấu hình
    const payos = getPayOS();
    let isSignatureValid = false;

    if (payos && body.signature) {
      try {
        const verifiedData = await payos.webhooks.verify(body);
        if (verifiedData) {
          isSignatureValid = true;
        }
      } catch (err: any) {
        console.warn("[PayOS Webhook] Xác thực chữ ký bằng SDK thất bại:", err?.message || err);
      }
    }

    const transactionData = body.data || body;
    const rawOrderCode = transactionData.orderCode;
    const description = String(transactionData.description || "");
    const transferAmount = Number(transactionData.amount) || 0;
    const reference = transactionData.reference || null;

    // Tìm orderCode từ trường orderCode hoặc từ nội dung chuyển khoản "OMNI 123456"
    let targetOrderCode: number | null = null;

    if (typeof rawOrderCode === "number" && rawOrderCode > 0) {
      targetOrderCode = rawOrderCode;
    } else {
      const match = description.match(/OMNI\s*(\d{5,7})/i);
      if (match && match[1]) {
        targetOrderCode = parseInt(match[1], 10);
      }
    }

    if (!targetOrderCode) {
      console.warn("[PayOS Webhook] Không tìm thấy mã đơn hàng hợp lệ trong dữ liệu webhook:", description);
      return NextResponse.json({
        success: true,
        message: "No matching order code found, acknowledged",
      });
    }

    // Tìm đơn hàng trong cơ sở dữ liệu
    const order = await prisma.paymentOrder.findUnique({
      where: { orderCode: targetOrderCode },
    });

    if (!order) {
      console.warn(`[PayOS Webhook] Không tìm thấy đơn hàng #${targetOrderCode} trong hệ thống`);
      return NextResponse.json({
        success: true,
        message: "Order not found in database, acknowledged",
      });
    }

    // Nếu đơn hàng đã được xử lý thanh toán trước đó
    if (order.status === "PAID") {
      console.log(`[PayOS Webhook] Đơn hàng #${targetOrderCode} đã được cộng credits trước đó.`);
      return NextResponse.json({
        success: true,
        message: "Order already fulfilled",
      });
    }

    // Cập nhật trạng thái đơn hàng thành PAID
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        transactionId: reference,
      },
    });

    // Cộng Credits / Token tự động cho người dùng
    const updatedUser = await prisma.user.update({
      where: { id: order.userId },
      data: {
        credits: { increment: order.credits },
      },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
      },
    });

    console.log(
      `🎉 [PayOS Webhook] THANH TOÁN THÀNH CÔNG! Đã tự động cộng ${order.credits} credits cho user ${updatedUser.email || updatedUser.id}. Số dư mới: ${updatedUser.credits} credits.`
    );

    return NextResponse.json({
      success: true,
      orderCode: order.orderCode,
      creditsAdded: order.credits,
      newTotalCredits: updatedUser.credits,
    });
  } catch (error) {
    console.error("[PayOS Webhook] Lỗi khi xử lý webhook thanh toán:", error);
    // Luôn trả về 200 để cổng thanh toán không spam retry vô hạn khi lỗi nội bộ
    return NextResponse.json(
      { success: false, error: "Internal processing error" },
      { status: 200 }
    );
  }
}
