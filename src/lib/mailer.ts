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
        subject: `[Biết Tuốt AI] Mã xác nhận đăng ký tài khoản: ${otp}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #0c0e17; color: #e2e8f0; border-radius: 24px; border: 1px solid #1e2235;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Biết Tuốt AI</h1>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Nền tảng Trí tuệ Nhân tạo Đa năng</p>
            </div>
            
            <div style="background-color: #141726; border-radius: 18px; padding: 24px; border: 1px solid #232842; margin-bottom: 24px;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #cbd5e1;">Xin chào <strong>${username}</strong>,</p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                Bạn vừa yêu cầu đăng ký tài khoản mới trên hệ thống <strong>Biết Tuốt AI</strong>. Vui lòng sử dụng mã xác thực bên dưới để hoàn tất:
              </p>
              
              <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5, #0891b2); border-radius: 14px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);">
                  ${otp}
                </div>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
                ⏳ Mã xác thực có hiệu lực trong vòng <strong>10 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
              </p>
            </div>
            
            <p style="font-size: 11px; color: #475569; text-align: center; margin: 0;">
              Nếu bạn không yêu cầu đăng ký này, hãy bỏ qua email này một cách an toàn.
            </p>
          </div>
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
