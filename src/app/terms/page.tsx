'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 bg-[#11131f] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ⚖️ Pháp lý & Quy định
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Điều Khoản Sử Dụng Dịch Vụ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cập nhật lần cuối: Ngày 02 tháng 10 năm 2026 • Áp dụng cho tất cả người dùng OmniAI
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            ← Trang chủ
          </Link>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>1.</span> Chấp Thuận Điều Khoản
            </h2>
            <p>
              Chào mừng bạn đến với <strong>OmniAI Platform</strong>. Khi truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ, tính năng trợ lý AI, tạo ảnh hoặc trò chuyện nào trên nền tảng của chúng tôi, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ này.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>2.</span> Tài Khoản & Bảo Mật Người Dùng
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Bạn chịu trách nhiệm duy trì tính bảo mật của thông tin đăng nhập và mật khẩu tài khoản.</li>
              <li>Mỗi tài khoản là cá nhân và không được chia sẻ cho bên thứ ba vì mục đích trục lợi bất hợp pháp.</li>
              <li>Hệ thống có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện hành vi gian lận, tấn công hệ thống hoặc vi phạm tiêu chuẩn cộng đồng.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>3.</span> Quy Định Sử Dụng Trợ Lý AI & Tạo Nội Dung
            </h2>
            <p>
              OmniAI cung cấp các mô hình Trí Tuệ Nhân Tạo hỗ trợ công việc, giải trí, sáng tạo nội dung và trải bài trực giác. Người dùng cam kết <strong>KHÔNG</strong> sử dụng dịch vụ để:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Tạo ra, phát tán nội dung vi phạm pháp luật, thù ghét, khiêu dâm, kích động bạo lực hoặc giả mạo cá nhân/tổ chức khác.</li>
              <li>Spam, tạo truy vấn tự động gây quá tải tài nguyên máy chủ (DDoS).</li>
              <li>Lừa đảo tài chính hoặc sử dụng các trợ lý tư vấn (Tài chính, Tử vi, Tarot) làm cơ sở pháp lý duy nhất cho các quyết định đầu tư mạo hiểm.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>4.</span> Quy Định Credits & Thanh Toán
            </h2>
            <p>
              Hệ thống OmniAI hoạt động theo cơ chế số dư <strong>Credits</strong>. Mỗi lượt tương tác AI, tạo ảnh hoặc giải bài sẽ khấu trừ một số lượng Credits tương ứng theo công khai trên hệ thống.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Credits đã nạp không có giá trị quy đổi ngược lại thành tiền mặt.</li>
              <li>Trong trường hợp sự cố kỹ thuật khiến lượt tạo bị lỗi hệ thống, số Credits bị trừ sẽ được hoàn lại tự động hoặc hỗ trợ qua kênh CSKH.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>5.</span> Quyền Sở Hữu Trí Tuệ
            </h2>
            <p>
              Tất cả giao diện, logo, nhãn hiệu, mã nguồn và dữ liệu độc bản trên OmniAI thuộc quyền sở hữu trí tuệ của nền tảng. Nội dung văn bản và hình ảnh do người dùng tạo ra thông qua công cụ AI thuộc quyền sử dụng hợp pháp của người dùng theo quy định pháp luật hiện hành.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>6.</span> Giới Hạn Trách Nhiệm
            </h2>
            <p>
              Các câu trả lời và nội dung được tạo bởi mô hình AI mang tính chất tham khảo, hỗ trợ và giải trí. OmniAI không chịu trách nhiệm đối với các tổn thất gián tiếp phát sinh từ việc người dùng hiểu sai hoặc phụ thuộc tuyệt đối vào câu trả lời của AI.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 OmniAI Platform. Tất cả quyền được bảo lưu.</p>
          <Link href="/privacy" className="text-indigo-400 hover:underline">
            Xem Chính sách bảo mật →
          </Link>
        </div>
      </div>
    </div>
  );
}
