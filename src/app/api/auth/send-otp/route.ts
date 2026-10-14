import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationOtpEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Địa chỉ email không hợp lệ" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? String(username).trim().toLowerCase() : "";

    // 1. Kiểm tra xem email đã được đăng ký tài khoản chưa
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail && existingEmail.password) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập!" },
        { status: 409 }
      );
    }

    // 2. Kiểm tra xem username đã tồn tại chưa
    if (cleanUsername) {
      const existingUser = await prisma.user.findFirst({
        where: { username: cleanUsername },
      });
      if (existingUser && existingUser.email !== cleanEmail) {
        return NextResponse.json(
          { error: "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác!" },
          { status: 409 }
        );
      }
    }

    // 3. Tạo mã OTP ngẫu nhiên 6 chữ số (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Xóa các mã OTP cũ của email này nếu có
    await prisma.emailVerification.deleteMany({
      where: { email: cleanEmail },
    });

    // Lưu mã OTP mới vào database
    await prisma.emailVerification.create({
      data: {
        email: cleanEmail,
        otp,
        expiresAt,
      },
    });

    // Gửi email xác thực
    const sendResult = await sendVerificationOtpEmail(cleanEmail, otp, cleanUsername || cleanEmail.split("@")[0]);

    return NextResponse.json({
      success: true,
      message: "Đã gửi mã xác nhận 6 chữ số đến email của bạn",
      simulated: (sendResult as any).simulated || false,
      devOtp: (sendResult as any).simulated ? otp : undefined, // Tiện lợi test khi chưa setup SMTP
    });
  } catch (error) {
    console.error("Lỗi khi gửi mã OTP:", error);
    return NextResponse.json(
      { error: "Không thể gửi mã xác nhận lúc này. Vui lòng thử lại sau!" },
      { status: 500 }
    );
  }
}
