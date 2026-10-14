import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email hoặc tên đăng nhập" },
        { status: 400 }
      );
    }

    const rawInput = email.trim();
    const isEmailFormat = rawInput.includes("@");
    const cleanEmail = isEmailFormat
      ? rawInput.toLowerCase()
      : `${rawInput.toLowerCase()}@biettuot.io`;
    const cleanUsername = rawInput.toLowerCase();
    const isRootAdmin = cleanEmail === "hoanglinhcntti@gmail.com";

    // 1. Tìm user trong database bằng email HOẶC username
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    // 2. Nếu người dùng có mật khẩu trong DB, kiểm tra mật khẩu
    if (user && user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Tài khoản này đã thiết lập mật khẩu. Vui lòng nhập mật khẩu để đăng nhập!" },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mật khẩu không chính xác!" },
          { status: 401 }
        );
      }
    } else if (!user) {
      // Nếu chưa có tài khoản và là đăng nhập nhanh (không có mật khẩu)
      if (password) {
        return NextResponse.json(
          { error: "Tài khoản hoặc email này chưa được đăng ký. Vui lòng chọn Đăng ký!" },
          { status: 404 }
        );
      }
      // Đăng nhập nhanh tự tạo tài khoản
      const cleanName = name?.trim() || rawInput.split("@")[0];
      try {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            username: isEmailFormat ? cleanEmail.split("@")[0] : cleanUsername,
            name: cleanName,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
            credits: isRootAdmin ? 999999 : 20,
            role: isRootAdmin ? "ADMIN" : "USER",
            status: "active",
          },
        });
      } catch (dbErr) {
        console.warn("Lỗi lưu DB login:", dbErr);
      }
    }

    if (user && user.status === "banned" && !isRootAdmin) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị Quản trị viên khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ!" },
        { status: 403 }
      );
    }

    const finalUser = user || {
      id: isRootAdmin ? "cmuchyzaf0000tar86bsjbasb" : cleanEmail,
      email: cleanEmail,
      username: isEmailFormat ? cleanEmail.split("@")[0] : cleanUsername,
      name: name?.trim() || rawInput.split("@")[0],
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      credits: isRootAdmin ? 999999 : 20,
      role: isRootAdmin ? "ADMIN" : "USER",
      status: "active",
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: finalUser.id,
        email: finalUser.email,
        username: (finalUser as any).username || finalUser.email.split("@")[0],
        displayName: finalUser.name || finalUser.email.split("@")[0],
        avatar: finalUser.avatar,
        credits: finalUser.role === "ADMIN" ? 999999 : finalUser.credits,
        role: finalUser.role,
        isVip: finalUser.role === "VIP" || finalUser.role === "ADMIN",
      },
    });

    response.cookies.set("tool_ai_auth_user", encodeURIComponent(JSON.stringify(finalUser)), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng nhập" },
      { status: 500 }
    );
  }
}
