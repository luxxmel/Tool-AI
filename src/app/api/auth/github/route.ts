import { NextRequest, NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/serverUrl";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const origin = getAppOrigin(request);
  const redirectUri = `${origin}/api/auth/github/callback`;

  if (!clientId) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>Cấu hình GitHub OAuth</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1017; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { max-width: 480px; background: #151722; border: 1px border #2a2e3f; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
            h2 { color: #f43f5e; margin-top: 0; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
            code { background: #0e1017; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-size: 13px; }
            button { margin-top: 20px; background: #f43f5e; color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Chưa cấu hình GitHub OAuth</h2>
            <p>Để kích hoạt đăng nhập thật bằng GitHub, bạn hãy thêm <code>GITHUB_CLIENT_ID</code> và <code>GITHUB_CLIENT_SECRET</code> vào file <code>.env</code>.</p>
            <p>1. Vào <a href="https://github.com/settings/developers" target="_blank" style="color: #38bdf8;">GitHub Developer Settings</a> -> New OAuth App.<br>
               2. Callback URL: <code>${redirectUri}</code></p>
            <button onclick="window.close()">Đóng cửa sổ này</button>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&scope=read:user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(githubAuthUrl);
}
