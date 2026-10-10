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
    const userJson = user ? JSON.stringify(user) : "null";
    const userJsonEscaped = user ? encodeURIComponent(JSON.stringify(user)) : "";
    const response = new NextResponse(
      `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>Xác thực Google</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; max-width: 380px; padding: 24px; border-radius: 16px; background: #161926; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .spinner { width: 44px; height: 44px; border: 4px solid #4285f4; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="box">
            ${
              success
                ? `<div class="spinner"></div><p style="font-size:16px;font-weight:500;">Đăng nhập Google thành công!</p><p style="color:#94a3b8;font-size:13px;">Đang đồng bộ phiên đăng nhập...</p>`
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

              // 1. Thử gửi qua window.opener
              var sentToOpener = false;
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage({
                    type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                    provider: "google",
                    user: userObj,
                    error: "${errorMessage}"
                  }, "*");
                  sentToOpener = true;
                } catch(e) {}
              }

              // 2. Thử gửi qua BroadcastChannel (hoạt động kể cả khi opener bị chặn cross-origin)
              try {
                if (window.BroadcastChannel) {
                  var bc = new BroadcastChannel("oauth_channel");
                  bc.postMessage({
                    type: "${success ? "OAUTH_AUTH_SUCCESS" : "OAUTH_AUTH_ERROR"}",
                    provider: "google",
                    user: userObj,
                    error: "${errorMessage}"
                  });
                  setTimeout(function() { bc.close(); }, 1000);
                }
              } catch(e) {}

              // 3. Tự động đóng popup hoặc chuyển hướng trang
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
      try {
        response.cookies.set("tool_ai_auth_user", encodeURIComponent(JSON.stringify(user)), {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "lax",
        });
      } catch (cookieErr) {
        console.error("Lỗi set cookie google callback:", cookieErr);
      }
    }

    return response;
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

    // 3. Kiểm tra xem có phải tài khoản Root Admin
    const cleanEmail = email.toLowerCase().trim();
    const isRootAdmin = cleanEmail === "hoanglinhcntti@gmail.com";
    const initialCredits = isRootAdmin ? 999999 : 20; // 20 token cho nick mới tạo, admin vô hạn
    const initialRole = isRootAdmin ? "ADMIN" : "USER";

    let dbUser: any = null;
    try {
      dbUser = await prisma.user.upsert({
        where: { email: email.toLowerCase().trim() },
        update: {
          name: name || undefined,
          avatar: avatar || undefined,
          ...(isRootAdmin ? { role: "ADMIN", credits: 999999 } : {}),
        },
        create: {
          email: email.toLowerCase().trim(),
          name: name || email.split("@")[0],
          avatar:
            avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
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
          status: true,
        },
      });
    } catch (dbErr) {
      console.warn("Lỗi lưu SQLite (dùng session user):", dbErr);
    }

    if (dbUser && dbUser.status === "banned" && !isRootAdmin) {
      return sendResponseHtml(false, null, "Tài khoản của bạn đã bị Quản trị viên khóa. Vui lòng liên hệ Admin!");
    }

    const finalUser = dbUser || {
      id: email.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      name: name || email.split("@")[0],
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      credits: initialCredits,
      role: initialRole,
      status: "active",
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
