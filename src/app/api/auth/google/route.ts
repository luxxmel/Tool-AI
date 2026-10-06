import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppOrigin } from "@/lib/serverUrl";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const origin = getAppOrigin(request);
    const redirectUri = `${origin}/api/auth/google/callback`;

    if (!clientId) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="vi">
          <head>
            <meta charset="utf-8">
            <title>Cấu hình Google OAuth</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { max-width: 500px; background: #151722; border: 1px solid #2a2e3f; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
              h2 { color: #4285f4; margin-top: 0; }
              p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
              code { background: #0e1017; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-size: 13px; word-break: break-all; }
              button { margin-top: 20px; background: #4285f4; color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>⚠️ Chưa cấu hình Google OAuth</h2>
              <p>Để kích hoạt đăng nhập thật bằng Google, bạn hãy thêm <code>GOOGLE_CLIENT_ID</code> và <code>GOOGLE_CLIENT_SECRET</code> vào file <code>.env</code>.</p>
              <p style="text-align: left; font-size: 13px;">
                1. Vào <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: #38bdf8;">Google Cloud Console</a> &rarr; Credentials &rarr; Create OAuth client ID (Web application).<br><br>
                2. <strong>Authorized redirect URIs</strong>:<br>
                <code>${redirectUri}</code>
              </p>
              <button onclick="window.close()">Đóng cửa sổ này</button>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&access_type=offline`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Lỗi GET /api/auth/google:", error);
    return NextResponse.json({ error: "Lỗi kết nối máy chủ Google OAuth" }, { status: 500 });
  }
}

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
