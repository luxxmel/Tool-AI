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
    const userJson = user ? JSON.stringify(user) : "null";
    const userJsonEscaped = user ? encodeURIComponent(JSON.stringify(user)) : "";
    const response = new NextResponse(
      `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>Xác thực GitHub</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; max-width: 380px; padding: 24px; border-radius: 16px; background: #161926; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .spinner { width: 44px; height: 44px; border: 4px solid #f43f5e; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="box">
            ${
              success
                ? `<div class="spinner"></div><p style="font-size:16px;font-weight:500;">Đăng nhập GitHub thành công!</p><p style="color:#94a3b8;font-size:13px;">Đang đồng bộ phiên đăng nhập...</p>`
                : `<p style="color: #f43f5e; font-size:15px;">⚠️ Lỗi: ${errorMessage}</p><button onclick="window.close()" style="background:#f43f5e;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:500;">Đóng</button>`
            }
          </div>
          <script>
            try {
              var userObj = ${userJson};
              if (userObj) {
                try {
                  localStorage.setItem("tool_ai_auth_user", JSON.stringify(userObj));
                  document.cookie = "tool_ai_auth_user=" + "${userJsonEscaped}" + "; path=/; max-age=2592000; SameSite=Lax";
                } catch(e) {}
              }

              var sentToOpener = false;
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage({
                    type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                    provider: "github",
                    user: userObj,
                    error: "${errorMessage}"
                  }, "*");
                  sentToOpener = true;
                } catch(e) {}
              }

              try {
                if (window.BroadcastChannel) {
                  var bc = new BroadcastChannel("oauth_channel");
                  bc.postMessage({
                    type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                    provider: "github",
                    user: userObj,
                    error: "${errorMessage}"
                  });
                  setTimeout(function() { bc.close(); }, 1000);
                }
              } catch(e) {}

              setTimeout(function() {
                try { window.close(); } catch(e) {}
                if (!window.closed && !sentToOpener) {
                  window.location.replace("/");
                }
              }, 600);
            } catch(globalErr) {
              setTimeout(function() { window.location.replace("/"); }, 800);
            }
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

    if (success && user) {
      response.cookies.set("tool_ai_auth_user", JSON.stringify(user), {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }

    return response;
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
        "User-Agent": "Bi?t Tu?t AI-App",
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
            "User-Agent": "Bi?t Tu?t AI-App",
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

    // 4. Kiểm tra Admin (hoanglinhcntti@gmail.com) và cấp credit ban đầu
    const isAdminUser = email.toLowerCase().trim() === "hoanglinhcntti@gmail.com";
    const initialCredits = isAdminUser ? 999999 : 20;
    const initialRole = isAdminUser ? "ADMIN" : "USER";

    let dbUser: any = null;
    try {
      dbUser = await prisma.user.upsert({
        where: { email: email.toLowerCase().trim() },
        update: {
          name: name,
          avatar: avatar,
          ...(isAdminUser ? { role: "ADMIN", credits: 999999 } : {}),
        },
        create: {
          email: email.toLowerCase().trim(),
          name: name,
          avatar: avatar,
          credits: initialCredits,
          role: initialRole,
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
      id: email.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      name: name,
      avatar: avatar,
      credits: initialCredits,
      role: initialRole,
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
    console.error("Lỗi xử lý callback GitHub:", err);
    return sendResponseHtml(false, null, err?.message || "Đã xảy ra lỗi hệ thống khi đăng nhập GitHub");
  }
}
