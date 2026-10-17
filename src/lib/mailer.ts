import nodemailer from "nodemailer";

/**
 * Tạo transporter gửi email linh hoạt:
 * 1. Nếu có SMTP trong .env (SMTP_HOST, SMTP_USER, SMTP_PASS), dùng SMTP thực tế.
 * 2. Nếu chưa cấu hình, transporter sẽ log OTP ra console và trả về true để không làm gián đoạn trải nghiệm người dùng.
 */
export async function sendVerificationOtpEmail(toEmail: string, otp: string, username: string) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // Chuẩn hóa tên người gửi cho Gmail
  const senderEmail = user || "biettuot.io.vn@gmail.com";
  const from = {
    name: "Biết Tuốt AI",
    address: senderEmail,
  };

  // Kiểm tra nếu có cấu hình SMTP thực tế
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to: toEmail,
        subject: `🔐 [Biết Tuốt AI] Mã xác nhận đăng ký tài khoản của bạn: ${otp}`,
        html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mã xác thực Biết Tuốt AI</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #05070d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05070d; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: linear-gradient(180deg, #0e1222 0%, #080a14 100%); border: 1px solid #1e2544; border-radius: 28px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);">
                  
                  <!-- Top Banner Header -->
                  <tr>
                    <td align="center" style="padding: 44px 32px 28px 32px; background: radial-gradient(circle at top, rgba(99, 102, 241, 0.25) 0%, transparent 70%);">
                      <!-- Logo Icon -->
                      <div style="display: inline-block; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%); line-height: 64px; text-align: center; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); margin-bottom: 18px;">
                        <span style="font-size: 28px; color: #ffffff; font-weight: 900;">Δ</span>
                      </div>
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">Biết Tuốt AI</h1>
                      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">Nền tảng Trí tuệ Nhân tạo Đa năng</p>
                    </td>
                  </tr>

                  <!-- Main Content Box -->
                  <tr>
                    <td style="padding: 0 36px 36px 36px;">
                      <div style="background-color: #12162a; border: 1px solid #252b4e; border-radius: 20px; padding: 30px 26px; text-align: center;">
                        <p style="margin: 0 0 14px 0; font-size: 16px; color: #e2e8f0; font-weight: 600; text-align: left;">
                          Xin chào <span style="color: #38bdf8;">${username}</span> 👋
                        </p>
                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: left;">
                          Bạn vừa khởi tạo yêu cầu đăng ký tài khoản mới. Hãy sử dụng mã xác thực gồm <strong>6 chữ số</strong> bên dưới để hoàn tất xác minh email của bạn:
                        </p>

                        <!-- OTP Box -->
                        <div style="margin: 32px 0 24px 0;">
                          <div style="display: inline-block; padding: 18px 36px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0284c7 100%); border-radius: 18px; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #ffffff; text-align: center; box-shadow: 0 12px 30px rgba(99, 102, 241, 0.45); border: 1px solid rgba(255, 255, 255, 0.2);">
                            ${otp}
                          </div>
                        </div>

                        <!-- Notice Pill -->
                        <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; padding: 6px 18px; margin-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #fbbf24; font-weight: 600;">
                            ⏳ Mã có hiệu lực trong vòng <strong>10 phút</strong>
                          </p>
                        </div>

                        <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                          ⚠️ Tuyệt đối không chia sẻ mã xác thực này cho bất kỳ ai để bảo vệ an toàn cho tài khoản.
                        </p>
                      </div>

                      <!-- Footer Notice -->
                      <p style="margin: 28px 0 0 0; font-size: 12px; color: #475569; text-align: center; line-height: 1.6;">
                        Nếu bạn không thực hiện yêu cầu đăng ký này, bạn có thể yên tâm bỏ qua email này.<br>
                        © 2026 Biết Tuốt AI • Mọi quyền được bảo lưu.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `,
      });

      console.log(`[Email Service] Đã gửi mã OTP ${otp} đến ${toEmail}`);
      return { success: true };
    } catch (error) {
      console.error("[Email Service] Lỗi gửi email qua SMTP:", error);
      // Vẫn log ra console để admin/user có thể test
      console.log(`[FALLBACK OTP] Email: ${toEmail} | Mã OTP: ${otp}`);
      return { success: true, simulated: true };
    }
  }

  // Chế độ mô phỏng / Development khi chưa có SMTP
  console.log(`\n======================================================`);
  console.log(`[MÃ XÁC THỰC EMAIL ĐĂNG KÝ]`);
  console.log(`- Người nhận: ${toEmail} (${username})`);
  console.log(`- MÃ OTP 6 CHỮ SỐ: >>> ${otp} <<<`);
  console.log(`- Hiệu lực: 10 phút`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true, otp };
}
