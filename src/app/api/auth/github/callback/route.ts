import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          <title>Xác thực GitHub</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; }
            .spinner { width: 40px; height: 40px; border: 4px solid #f43f5e; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="box">
            ${
              success
                ? `<div class="spinner"></div><p>Đăng nhập GitHub thành công! Đang chuyển hướng...</p>`
                : `<p style="color: #f43f5e;">⚠️ Lỗi: ${errorMessage}</p><button onclick="window.close()" style="background:#f43f5e;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;">Đóng</button>`
            }
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                provider: "github",
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
    return sendResponseHtml(false, null, "Không nhận được mã xác thực từ GitHub");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return sendResponseHtml(
      false,
      null,
      "Chưa cấu hình GITHUB_CLIENT_ID hoặc GITHUB_CLIENT_SECRET trên máy chủ"
    );
  }

  try {
    // 1. Trao đổi code lấy access_token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return sendResponseHtml(
        false,
        null,
        tokenData.error_description || tokenData.error || "Không thể lấy access token từ GitHub"
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Lấy thông tin user profile từ GitHub API
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "OmniAI-App",
      },
    });

    if (!userRes.ok) {
      return sendResponseHtml(false, null, "Không thể lấy thông tin người dùng từ GitHub API");
    }

    const githubUser = await userRes.json();

    let email = githubUser.email;

    // 3. Nếu email null (do user đặt private trên GitHub), lấy từ endpoint /user/emails
    if (!email) {
      try {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "OmniAI-App",
          },
        });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          const primaryEmailObj = emails.find(
            (e: { primary: boolean; verified: boolean; email: string }) => e.primary && e.verified
          );
          email = primaryEmailObj?.email || emails[0]?.email;
        }
      } catch (err) {
        console.error("Lỗi khi lấy email từ GitHub:", err);
      }
    }

    if (!email) {
      email = `${githubUser.login}@users.noreply.github.com`;
    }

    const name = githubUser.name || githubUser.login;
    const avatar =
      githubUser.avatar_url ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

    // 4. Lưu hoặc cập nhật người dùng vào SQLite dev.db
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
    console.error("Lỗi xử lý callback GitHub:", err);
    return sendResponseHtml(false, null, "Đã xảy ra lỗi hệ thống khi đăng nhập GitHub");
  }
}
