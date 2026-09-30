import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppOrigin } from "@/lib/serverUrl";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  const sendResponseHtml = (
    success: boolean,
    user: Record<string, unknown> | null,
    errorMessage: string = ""
  ) => {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>Xác thực Facebook</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; }
            .spinner { width: 40px; height: 40px; border: 4px solid #1877f2; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="box">
            ${
              success
                ? `<div class="spinner"></div><p>Đăng nhập Facebook thành công! Đang chuyển hướng...</p>`
                : `<p style="color: #f43f5e;">⚠️ Lỗi: ${errorMessage}</p><button onclick="window.close()" style="background:#f43f5e;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;">Đóng</button>`
            }
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                provider: "facebook",
                user: ${user ? JSON.stringify(user) : "null"},
                error: "${errorMessage}"
              }, "*");
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = "/";
            }
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  };

  if (errorParam) {
    return sendResponseHtml(false, null, errorDesc || errorParam);
  }

  if (!code) {
    return sendResponseHtml(false, null, "Không nhận được mã xác thực từ Facebook");
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return sendResponseHtml(
      false,
      null,
      "Chưa cấu hình FACEBOOK_APP_ID hoặc FACEBOOK_APP_SECRET trên máy chủ"
    );
  }

  try {
    const origin = getAppOrigin(request);
    const redirectUri = `${origin}/api/auth/facebook/callback`;

    // 1. Trao đổi code lấy access_token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(
      appId
    )}&client_secret=${encodeURIComponent(appSecret)}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code=${encodeURIComponent(code)}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return sendResponseHtml(
        false,
        null,
        tokenData.error?.message || "Không thể lấy access token từ Facebook"
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Lấy thông tin user profile từ Facebook Graph API
    const userUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(
      accessToken
    )}`;

    const userRes = await fetch(userUrl);
    if (!userRes.ok) {
      return sendResponseHtml(false, null, "Không thể lấy thông tin người dùng từ Facebook API");
    }

    const fbUser = await userRes.json();

    const email =
      fbUser.email ||
      `${fbUser.id}@facebook.users.omni.ai`;
    const name = fbUser.name || `Facebook User ${fbUser.id}`;
    const avatar =
      fbUser.picture?.data?.url ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

    // 3. Lưu hoặc cập nhật người dùng vào SQLite dev.db
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        name: name,
        avatar: avatar,
      },
      create: {
        email: email.toLowerCase().trim(),
        name: name,
        avatar: avatar,
        credits: 10,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        credits: true,
        role: true,
      },
    });

    return sendResponseHtml(true, {
      id: user.id,
      email: user.email,
      username: user.email.split("@")[0],
      displayName: user.name || user.email.split("@")[0],
      avatar: user.avatar,
      credits: user.credits,
      role: user.role,
    });
  } catch (err) {
    console.error("Lỗi xử lý callback Facebook:", err);
    return sendResponseHtml(false, null, "Đã xảy ra lỗi hệ thống khi đăng nhập Facebook");
  }
}
