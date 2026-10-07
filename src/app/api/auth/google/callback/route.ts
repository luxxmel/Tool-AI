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
          <title>Xác thực Google</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; }
            .spinner { width: 40px; height: 40px; border: 4px solid #4285f4; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="box">
            ${
              success
                ? `<div class="spinner"></div><p>Đăng nhập Google thành công! Đang chuyển hướng...</p>`
                : `<p style="color: #f43f5e;">⚠️ Lỗi: ${errorMessage}</p><button onclick="window.close()" style="background:#f43f5e;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;">Đóng</button>`
            }
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                provider: "google",
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
    return sendResponseHtml(false, null, "Không nhận được mã xác thực từ Google");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return sendResponseHtml(
      false,
      null,
      "Chưa cấu hình GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET trên máy chủ"
    );
  }

  try {
    const origin = getAppOrigin(request);
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Trao đổi code lấy access_token & id_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return sendResponseHtml(
        false,
        null,
        tokenData.error_description || tokenData.error || "Không thể lấy access token từ Google"
      );
    }

    // 2. Lấy thông tin user profile từ Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      return sendResponseHtml(false, null, "Không thể lấy thông tin người dùng từ Google");
    }

    const payload = await userInfoRes.json();
    const email = payload.email;
    const name = payload.name || payload.email?.split("@")[0];
    const avatar = payload.picture;

    if (!email) {
      return sendResponseHtml(false, null, "Không lấy được email từ tài khoản Google");
    }

    // 3. Lưu hoặc cập nhật user vào SQLite nếu có thể
    let dbUser: any = null;
    try {
      dbUser = await prisma.user.upsert({
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
    } catch (dbErr) {
      console.warn("Lỗi lưu SQLite (dùng session user):", dbErr);
    }

    const finalUser = dbUser || {
      id: `google_${Date.now()}`,
      email: email.toLowerCase().trim(),
      name: name || email.split("@")[0],
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      credits: 10,
      role: "USER",
    };

    return sendResponseHtml(true, {
      id: finalUser.id,
      email: finalUser.email,
      username: finalUser.email.split("@")[0],
      displayName: finalUser.name || finalUser.email.split("@")[0],
      avatar: finalUser.avatar,
      credits: finalUser.credits,
      role: finalUser.role,
    });
  } catch (err: any) {
    console.error("Lỗi xử lý callback Google:", err);
    return sendResponseHtml(false, null, err?.message || "Đã xảy ra lỗi hệ thống khi đăng nhập Google");
  }
}
