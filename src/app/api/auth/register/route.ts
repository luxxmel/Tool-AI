import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, otp } = body;

    // 1. Kiểm tra đầu vào bắt buộc
    if (!username || !email || !password || !otp) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tất cả các trường thông tin và mã xác thực!" },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Kiểm tra định dạng username (chỉ chữ cái, số, gạch dưới, tối thiểu 3 ký tự)
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Tên đăng nhập chỉ được gồm 3-30 ký tự (chữ, số hoặc dấu gạch dưới), không dấu và không khoảng trắng!" },
        { status: 400 }
      );
    }

    // Kiểm tra email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Địa chỉ email không đúng định dạng!" },
        { status: 400 }
      );
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự!" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Mật khẩu xác nhận không khớp!" },
        { status: 400 }
      );
    }

    // 2. Xác thực mã OTP 6 chữ số
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: cleanEmail,
        otp: cleanOtp,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Mã xác nhận 6 chữ số không chính xác!" },
        { status: 400 }
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Mã xác nhận đã hết hạn (quá 10 phút). Vui lòng yêu cầu gửi lại mã mới!" },
        { status: 400 }
      );
    }

    // 3. Kiểm tra trùng lặp email hoặc username một lần nữa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail && existingUser.password) {
        return NextResponse.json(
          { error: "Email này đã có tài khoản. Vui lòng đăng nhập!" },
          { status: 409 }
        );
      }
      if (existingUser.username === cleanUsername) {
        return NextResponse.json(
          { error: "Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác!" },
          { status: 409 }
        );
      }
    }

    // 4. Băm mật khẩu an toàn với bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const isRootAdmin = cleanEmail === "hoanglinhcntti@gmail.com";

    // 5. Tạo hoặc cập nhật User
    const newUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        username: cleanUsername,
        name: username.trim(),
        password: hashedPassword,
        emailVerified: new Date(),
        status: "active",
        ...(isRootAdmin ? { role: "ADMIN", credits: 999999 } : {}),
      },
      create: {
        email: cleanEmail,
        username: cleanUsername,
        name: username.trim(),
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
        credits: isRootAdmin ? 999999 : 20,
        role: isRootAdmin ? "ADMIN" : "USER",
        status: "active",
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        credits: true,
        status: true,
      },
    });

    // 6. Xóa các mã OTP đã dùng
    await prisma.emailVerification.deleteMany({
      where: { email: cleanEmail },
    });

    // Tạo response và set cookie auth
    const response = NextResponse.json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username || cleanUsername,
        name: newUser.name,
        displayName: newUser.name,
        avatar: newUser.avatar,
        role: newUser.role,
        credits: newUser.credits,
        isVip: newUser.role === "VIP" || newUser.role === "ADMIN",
      },
    });

    response.cookies.set("tool_ai_auth_user", encodeURIComponent(JSON.stringify(newUser)), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Lỗi khi đăng ký tài khoản:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng ký tài khoản. Vui lòng thử lại!" },
      { status: 500 }
    );
  }
}
