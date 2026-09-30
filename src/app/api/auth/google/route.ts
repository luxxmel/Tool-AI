import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      credential,
      accessToken,
      email: inputEmail,
      name: inputName,
      avatar: inputAvatar,
    } = body;

    let email = inputEmail;
    let name = inputName;
    let avatar = inputAvatar;

    // 1. Nếu có accessToken từ Google OAuth2 popup flow
    if (accessToken) {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (userInfoRes.ok) {
          const payload = await userInfoRes.json();
          email = payload.email;
          name = payload.name || payload.email?.split("@")[0];
          avatar = payload.picture;
        } else {
          return NextResponse.json(
            { error: "Google access token không hợp lệ hoặc đã hết hạn" },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("Lỗi khi xác thực accessToken với Google:", err);
        return NextResponse.json(
          { error: "Không thể kết nối đến máy chủ Google để xác thực accessToken" },
          { status: 500 }
        );
      }
    } else if (credential) {
      // 2. Nếu có credential từ Google Identity Services (JWT ID Token)
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );

        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          name = payload.name || payload.email.split("@")[0];
          avatar = payload.picture;
        } else {
          return NextResponse.json(
            { error: "Token Google không hợp lệ hoặc đã hết hạn" },
            { status: 400 }
          );
        }
      } catch (verifyErr) {
        console.error("Lỗi khi xác thực token với Google:", verifyErr);
        return NextResponse.json(
          { error: "Không thể kết nối đến máy chủ Google để xác thực" },
          { status: 500 }
        );
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Thiếu thông tin email để đăng ký/đăng nhập" },
        { status: 400 }
      );
    }

    // 2. Đăng ký thật hoặc Đăng nhập User vào Database SQLite
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        name: name || undefined,
        avatar: avatar || undefined,
      },
      create: {
        email: email.toLowerCase().trim(),
        name: name || email.split("@")[0],
        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        credits: 10, // Tặng ngay 10 credits cho tài khoản mới
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        credits: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đăng nhập với Google thành công!",
      user: {
        id: user.id,
        email: user.email,
        username: user.email.split("@")[0],
        displayName: user.name || user.email.split("@")[0],
        avatar: user.avatar,
        credits: user.credits,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi trong API /api/auth/google:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi xử lý đăng nhập Google" },
      { status: 500 }
    );
  }
}
