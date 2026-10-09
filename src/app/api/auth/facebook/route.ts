import { NextRequest, NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/serverUrl";

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const origin = getAppOrigin(request);
  const redirectUri = `${origin}/api/auth/facebook/callback`;

  if (!appId) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>Cấu hình Facebook OAuth</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { max-width: 480px; background: #151722; border: 1px solid #2a2e3f; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
            h2 { color: #1877f2; margin-top: 0; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
            code { background: #0e1017; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-size: 13px; }
            button { margin-top: 20px; background: #1877f2; color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Chưa cấu hình Facebook OAuth</h2>
            <p>Để kích hoạt đăng nhập thật bằng Facebook, bạn hãy thêm <code>FACEBOOK_APP_ID</code> và <code>FACEBOOK_APP_SECRET</code> vào file <code>.env</code>.</p>
            <p>1. Vào <a href="https://developers.facebook.com" target="_blank" style="color: #38bdf8;">Meta for Developers</a> -> Tạo ứng dụng -> Thêm Facebook Login.<br>
               2. Redirect URI: <code>${redirectUri}</code></p>
            <button onclick="window.close()">Đóng cửa sổ này</button>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
    appId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile&response_type=code`;

  return NextResponse.redirect(facebookAuthUrl);
}
