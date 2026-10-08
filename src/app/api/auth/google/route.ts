import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppOrigin } from "@/lib/serverUrl";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const origin = getAppOrigin(request);
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Nếu có cấu hình GOOGLE_CLIENT_ID, chuyển hướng trực tiếp đến trang chọn tài khoản chính thức của Google
    if (clientId) {
      const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      googleAuthUrl.searchParams.set("client_id", clientId);
      googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("prompt", "select_account"); // Bắt buộc Google luôn hiện danh sách các tài khoản Google để chọn
      googleAuthUrl.searchParams.set("access_type", "offline");

      return NextResponse.redirect(googleAuthUrl.toString());
    }

    // Dự phòng khi chưa có Google Client ID
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng nhập bằng tài khoản Google - Biết Tuốt AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #090a0f;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .card {
      background: #12141e;
      border: 1px solid #1f2333;
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      text-align: center;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #181b29;
      margin-bottom: 16px;
      border: 1px solid #282d42;
    }
    h2 { font-size: 19px; font-weight: 700; margin-bottom: 6px; }
    p.sub { font-size: 13px; color: #94a3b8; margin-bottom: 22px; }
    .account-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      background: #181b28;
      border: 1px solid #292e44;
      border-radius: 14px;
      padding: 12px 14px;
      cursor: pointer;
      margin-bottom: 12px;
      transition: all 0.2s;
      text-align: left;
    }
    .account-btn:hover {
      background: #202436;
      border-color: #4f46e5;
      transform: translateY(-1px);
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
    }
    .account-name { font-size: 13px; font-weight: 600; color: #fff; }
    .account-email { font-size: 11px; color: #94a3b8; }
    .divider {
      display: flex;
      align-items: center;
      margin: 18px 0;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .divider::before, .divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #1e2235;
    }
    .divider span { padding: 0 10px; }
    .input-group {
      display: flex;
      gap: 8px;
    }
    input[type="email"] {
      flex: 1;
      background: #0d0f17;
      border: 1px solid #252a3d;
      border-radius: 12px;
      padding: 10px 14px;
      color: #fff;
      font-size: 13px;
      outline: none;
    }
    input[type="email"]:focus {
      border-color: #4f46e5;
    }
    .btn-submit {
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 10px 16px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-submit:hover { background: #4338ca; }
    .badge-admin {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
      margin-left: auto;
    }
    .spinner {
      display: none;
      width: 24px;
      height: 24px;
      border: 3px solid #4f46e5;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 12px auto 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
    </div>
    <h2>Đăng nhập bằng Google</h2>
    <p class="sub">Chọn tài khoản Google của bạn để vào Biết Tuốt AI</p>

    <!-- Tài khoản Admin Lịnh Hoàng mặc định -->
    <button class="account-btn" onclick="loginWith('hoanglinhcntti@gmail.com', 'Lịnh Hoàng', 'https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c')">
      <img class="avatar" src="https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c" alt="Admin">
      <div>
        <div class="account-name">Lịnh Hoàng</div>
        <div class="account-email">hoanglinhcntti@gmail.com</div>
      </div>
      <span class="badge-admin">ADMIN</span>
    </button>

    <div class="divider">
      <span>Hoặc nhập tài khoản Gmail của bạn</span>
    </div>

    <form onsubmit="handleManualSubmit(event)" class="input-group">
      <input id="gmailInput" type="email" placeholder="example@gmail.com" required>
      <button type="submit" class="btn-submit">Tiếp tục</button>
    </form>

    <div id="spinner" class="spinner"></div>
    <div id="statusMsg" style="font-size:12px;color:#94a3b8;margin-top:10px;"></div>
  </div>

  <script>
    async function loginWith(email, name, avatar) {
      document.getElementById('spinner').style.display = 'block';
      document.getElementById('statusMsg').innerText = 'Đang xác thực và đồng bộ vào hệ thống...';

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, avatar })
        });
        const data = await res.json();

        if (data.success && data.user) {
          const user = data.user;
          localStorage.setItem('tool_ai_auth_user', JSON.stringify(user));
          document.cookie = 'tool_ai_auth_user=' + encodeURIComponent(JSON.stringify(user)) + '; path=/; max-age=31536000; SameSite=Lax';

          // Gửi thông báo đến trang cha
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google', user: user }, '*');
          }
          if (window.BroadcastChannel) {
            const bc = new BroadcastChannel('oauth_channel');
            bc.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google', user: user });
          }

          document.getElementById('statusMsg').innerText = 'Đăng nhập thành công! Đang chuyển hướng...';
          setTimeout(function() {
            try { window.close(); } catch(e) {}
            window.location.replace('/');
          }, 400);
        } else {
          document.getElementById('statusMsg').innerText = 'Lỗi: ' + (data.error || 'Không thể đăng nhập');
          document.getElementById('spinner').style.display = 'none';
        }
      } catch (err) {
        document.getElementById('statusMsg').innerText = 'Lỗi kết nối máy chủ';
        document.getElementById('spinner').style.display = 'none';
      }
    }

    function handleManualSubmit(e) {
      e.preventDefault();
      const val = document.getElementById('gmailInput').value.trim();
      if (!val) return;
      const cleanEmail = val.includes('@') ? val.toLowerCase() : val.toLowerCase() + '@gmail.com';
      loginWith(cleanEmail, cleanEmail.split('@')[0], 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(cleanEmail));
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Lỗi GET /api/auth/google:", error);
    return NextResponse.json({ error: "Lỗi kết nối máy chủ Google OAuth" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: inputEmail, name: inputName, avatar: inputAvatar } = body;

    if (!inputEmail) {
      return NextResponse.json(
        { error: "Thiếu thông tin email để đăng ký/đăng nhập" },
        { status: 400 }
      );
    }

    const cleanEmail = inputEmail.toLowerCase().trim();
    const isRootAdmin = cleanEmail === "hoanglinhcntti@gmail.com";
    const initialCredits = isRootAdmin ? 999999 : 20;
    const initialRole = isRootAdmin ? "ADMIN" : "USER";

    // Lưu người dùng trực tiếp vào SQLite Database qua prisma (sqliteClient)
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: inputName || undefined,
        avatar: inputAvatar || undefined,
        ...(isRootAdmin ? { role: "ADMIN", credits: 999999 } : {}),
      },
      create: {
        email: cleanEmail,
        name: inputName || cleanEmail.split("@")[0],
        avatar:
          inputAvatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
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
        createdAt: true,
      },
    });

    if (user && (user as any).status === "banned" && !isRootAdmin) {
      return NextResponse.json(
        { error: "Tài khoản này đã bị Quản trị viên khóa. Vui lòng liên hệ Admin!" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đăng nhập với Google thành công!",
      user: {
        id: user.id,
        email: user.email,
        username: user.email.split("@")[0],
        displayName: user.name || user.email.split("@")[0],
        avatar: user.avatar,
        credits: user.role === "ADMIN" ? 999999 : user.credits,
        role: user.role,
        status: (user as any).status || "active",
      },
    });
  } catch (error: any) {
    console.error("Lỗi trong API /api/auth/google:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi xử lý đăng nhập Google: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
