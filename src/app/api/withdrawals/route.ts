import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

// Tỷ giá quy đổi: 1 Credit = 600 VNĐ (Phí sàn nền tảng: 40%)
export const CREDIT_TO_VND_RATE = 600;
export const MIN_WITHDRAWAL_CREDITS = 100; // Tối thiểu 100 credits = 60.000 VNĐ

// GET: Lấy lịch sử yêu cầu rút tiền của tác giả hoặc toàn bộ yêu cầu (nếu là Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isAdminMode = searchParams.get("admin") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Người dùng không hợp lệ" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN" || user.email?.toLowerCase().trim() === "hoanglinhcntti@gmail.com";

    if (isAdminMode && !isAdmin) {
      return NextResponse.json({ error: "Từ chối truy cập: Chỉ Quản trị viên mới có quyền xem toàn bộ đơn rút tiền!" }, { status: 403 });
    }

    const where = isAdminMode && isAdmin ? {} : { userId: user.id };

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            credits: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      rate: CREDIT_TO_VND_RATE,
      minCredits: MIN_WITHDRAWAL_CREDITS,
      withdrawals,
    });
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách rút tiền:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải đơn rút tiền" }, { status: 500 });
  }
}

// POST: Tác giả tạo yêu cầu rút tiền mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      credits,
      bankCode,
      bankName,
      accountNo,
      accountName,
      note,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để rút tiền" }, { status: 401 });
    }

    const numCredits = Math.floor(Number(credits));
    if (isNaN(numCredits) || numCredits < MIN_WITHDRAWAL_CREDITS) {
      return NextResponse.json({
        error: `Số credits rút tối thiểu là ${MIN_WITHDRAWAL_CREDITS} Credits (tương đương ${(MIN_WITHDRAWAL_CREDITS * CREDIT_TO_VND_RATE).toLocaleString()} VNĐ)!`,
      }, { status: 400 });
    }

    if (!bankCode || !accountNo?.trim() || !accountName?.trim()) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ Tên Ngân hàng, Số tài khoản và Tên chủ thẻ!" }, { status: 400 });
    }

    // Kiểm tra số dư người dùng
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN" || user.email?.toLowerCase().trim() === "hoanglinhcntti@gmail.com";
    if (isAdmin) {
      return NextResponse.json({ error: "Tài khoản Quản trị viên (Admin) sở hữu vô hạn credits hệ thống nên không áp dụng rút tiền." }, { status: 400 });
    }

    if (user.credits < numCredits) {
      return NextResponse.json({
        error: `Số dư hiện tại của bạn (${user.credits} Credits) không đủ để rút ${numCredits} Credits!`,
      }, { status: 400 });
    }

    const amountVnd = numCredits * CREDIT_TO_VND_RATE;

    // 1. Khấu trừ credits trong tài khoản tác giả ngay lập tức để tránh gian lận dùng tiếp
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { decrement: numCredits },
      },
    });

    // 2. Tạo bản ghi đơn rút tiền
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: user.id,
        credits: numCredits,
        amountVnd,
        bankCode: bankCode.trim().toUpperCase(),
        bankName: bankName?.trim() || bankCode.trim().toUpperCase(),
        accountNo: accountNo.trim().replace(/\s+/g, ""),
        accountName: accountName.trim().toUpperCase(),
        note: note?.trim() || null,
        status: "PENDING",
      },
    });

    // 3. Tạo thông báo trong hệ thống cho tác giả
    try {
      await prisma.storyNotification.create({
        data: {
          userId: user.id,
          title: "Đã gửi yêu cầu rút tiền thành công",
          content: `Bạn đã yêu cầu rút ${numCredits.toLocaleString()} Credits (${amountVnd.toLocaleString()} VNĐ) về STK ${accountNo} (${bankCode}). Quản trị viên sẽ kiểm tra và chuyển khoản trong vòng 24h!`,
          type: "REWARD",
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Đã gửi yêu cầu rút ${numCredits.toLocaleString()} Credits (${amountVnd.toLocaleString()} VNĐ) thành công! Quản trị viên sẽ kiểm tra và duyệt chuyển khoản cho bạn sớm nhất.`,
      remainingCredits: updatedUser.credits,
      withdrawal,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo yêu cầu rút tiền:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi gửi yêu cầu rút tiền" }, { status: 500 });
  }
}

// PATCH: Quản trị viên Duyệt (Chuyển khoản thành công) hoặc Từ chối đơn rút tiền
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, withdrawalId, action, adminNote } = body; // action: "APPROVE" | "REJECT"

    if (!adminId || !withdrawalId || !action) {
      return NextResponse.json({ error: "Thiếu dữ liệu xác thực" }, { status: 400 });
    }

    const admin = await ensureUser(adminId);
    if (!admin || (admin.role !== "ADMIN" && admin.email?.toLowerCase().trim() !== "hoanglinhcntti@gmail.com")) {
      return NextResponse.json({ error: "Từ chối truy cập: Chỉ Quản trị viên mới có quyền duyệt đơn rút tiền!" }, { status: 403 });
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu rút tiền này" }, { status: 404 });
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json({ error: `Đơn này đã được xử lý trước đó (${withdrawal.status})` }, { status: 400 });
    }

    if (action === "APPROVE") {
      const updated = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: "APPROVED",
          adminNote: adminNote?.trim() || "Quản trị viên đã chuyển khoản thành công",
        },
      });

      // Gửi thông báo chúc mừng về tài khoản tác giả
      await prisma.storyNotification.create({
        data: {
          userId: withdrawal.userId,
          title: "🎉 Tiền đã về tài khoản ngân hàng của bạn!",
          content: `Quản trị viên đã duyệt và chuyển khoản ${withdrawal.amountVnd.toLocaleString()} VNĐ (${withdrawal.credits} Credits) về tài khoản ${withdrawal.bankCode} - ${withdrawal.accountNo}. Vui lòng kiểm tra biến động số dư ngân hàng!`,
          type: "REWARD",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã duyệt và đánh dấu thanh toán ${withdrawal.amountVnd.toLocaleString()} VNĐ cho tác giả ${withdrawal.user.name || withdrawal.user.email}!`,
        withdrawal: updated,
      });
    }

    if (action === "REJECT") {
      // Khi từ chối: HOÀN TRẢ LẠI 100% SỐ CREDITS VÀO VÍ CỦA TÁC GIẢ
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          credits: { increment: withdrawal.credits },
        },
      });

      const updated = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: "REJECTED",
          adminNote: adminNote?.trim() || "Thông tin tài khoản không chính xác hoặc vi phạm quy định",
        },
      });

      // Gửi thông báo lý do từ chối và hoàn tiền về ví
      await prisma.storyNotification.create({
        data: {
          userId: withdrawal.userId,
          title: "Đơn rút tiền bị từ chối - Đã hoàn trả credits",
          content: `Yêu cầu rút ${withdrawal.credits} Credits bị từ chối. Lý do: ${adminNote || "Thông tin ngân hàng không hợp lệ"}. Toàn bộ ${withdrawal.credits} Credits đã được hoàn trả về ví của bạn!`,
          type: "REJECTED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã từ chối đơn rút tiền và hoàn trả 100% (${withdrawal.credits} Credits) vào ví của tác giả!`,
        withdrawal: updated,
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    console.error("Lỗi khi duyệt đơn rút tiền:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật trạng thái rút tiền" }, { status: 500 });
  }
}
