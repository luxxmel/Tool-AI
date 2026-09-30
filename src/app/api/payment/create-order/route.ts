import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayOS, PAYMENT_CONFIG } from "@/lib/payos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, credits, packageName } = body;

    if (!userId || userId === "user-demo-123" || userId.startsWith("guest_")) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thanh toán nạp credit" },
        { status: 401 }
      );
    }

    const numericAmount = Math.max(1000, Number(amount) || 10000);
    const creditsToAdd = Math.max(1, Number(credits) || 10);
    const orderTitle = packageName || `Nạp ${creditsToAdd} Credits`;

    // Sinh mã đơn hàng số nguyên 6 chữ số (100000 - 999999)
    let orderCode = Math.floor(100000 + Math.random() * 900000);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.paymentOrder.findUnique({
        where: { orderCode },
      });
      if (!existing) break;
      orderCode = Math.floor(100000 + Math.random() * 900000);
      attempts++;
    }

    // Tạo bản ghi đơn hàng trong cơ sở dữ liệu
    const newOrder = await prisma.paymentOrder.create({
      data: {
        orderCode,
        userId,
        amount: numericAmount,
        credits: creditsToAdd,
        packageName: orderTitle,
        status: "PENDING",
        paymentMethod: "payos_vietqr",
      },
    });

    const defaultMemo = `OMNI ${orderCode}`;
    const defaultVietQrUrl = `https://img.vietqr.io/image/${PAYMENT_CONFIG.bankId}-${PAYMENT_CONFIG.accountNo}-compact2.png?amount=${numericAmount}&addInfo=${encodeURIComponent(
      defaultMemo
    )}&accountName=${encodeURIComponent(PAYMENT_CONFIG.accountName)}`;

    let checkoutUrl: string | null = null;
    let finalQrUrl: string = defaultVietQrUrl;
    let activeBankInfo = { ...PAYMENT_CONFIG };
    let activeMemo = defaultMemo;

    // Tạo link thanh toán tự động qua PayOS API
    const payos = getPayOS();
    if (payos) {
      try {
        const origin = request.headers.get("origin") || "http://localhost:3000";
        const payosPayment = await payos.paymentRequests.create({
          orderCode,
          amount: numericAmount,
          description: `OMNI ${orderCode}`.slice(0, 25),
          returnUrl: `${origin}/?payment=success&orderCode=${orderCode}`,
          cancelUrl: `${origin}/?payment=cancel&orderCode=${orderCode}`,
        });

        if (payosPayment) {
          checkoutUrl = (payosPayment as any).checkoutUrl || null;
          const bin = (payosPayment as any).bin || PAYMENT_CONFIG.bankId;
          const accNo = (payosPayment as any).accountNumber || PAYMENT_CONFIG.accountNo;
          const accName = (payosPayment as any).accountName || PAYMENT_CONFIG.accountName;
          const payosDesc = (payosPayment as any).description || defaultMemo;

          // Tạo ảnh VietQR chuẩn từ thông tin thực tế mà PayOS cấp phát
          finalQrUrl = `https://img.vietqr.io/image/${bin}-${accNo}-compact2.png?amount=${numericAmount}&addInfo=${encodeURIComponent(
            payosDesc
          )}&accountName=${encodeURIComponent(accName)}`;

          activeBankInfo = {
            bankId: bin === "970416" ? "ACB" : String(bin),
            bankName: bin === "970416" ? "ACB - Ngân hàng TMCP Á Châu" : PAYMENT_CONFIG.bankName,
            accountNo: accNo,
            accountDisplayNo: accNo,
            accountName: accName,
          };
          activeMemo = payosDesc;

          await prisma.paymentOrder.update({
            where: { id: newOrder.id },
            data: {
              payosPaymentLinkId: (payosPayment as any).paymentLinkId || null,
            },
          });

          console.log(
            `✅ [PayOS Order Created] Đơn #${orderCode} đã tạo thành công trên cổng PayOS! Link: ${checkoutUrl}`
          );
        }
      } catch (payosErr: any) {
        console.warn(
          "[PayOS] Không thể tạo Payment Link tự động (sẽ sử dụng VietQR ACB dự phòng):",
          payosErr?.message || payosErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderCode,
      amount: numericAmount,
      credits: creditsToAdd,
      packageName: orderTitle,
      memo: activeMemo,
      qrCodeUrl: finalQrUrl,
      checkoutUrl,
      bankInfo: activeBankInfo,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng nạp credit:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo đơn hàng thanh toán" },
      { status: 500 }
    );
  }
}
