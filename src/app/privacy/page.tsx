'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 bg-[#11131f] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🔒 Quyền riêng tư & An toàn dữ liệu
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Chính Sách Bảo Mật Quyền Riêng Tư
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cập nhật lần cuối: Ngày 02 tháng 10 năm 2026 • Cam kết bảo mật thông tin cá nhân của người dùng
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
              <span>1.</span> Nguồn Dữ Liệu Thu Thập
            </h2>
            <p>
              OmniAI cam kết chỉ thu thập các thông tin tối thiểu cần thiết nhằm vận hành dịch vụ và cá nhân hóa trải nghiệm cho bạn:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Thông tin tài khoản:</strong> Họ tên, Địa chỉ Email, Ảnh đại diện đại diện công khai khi bạn đăng ký/đăng nhập.</li>
              <li><strong>Dữ liệu hội thoại:</strong> Nội dung các câu hỏi, lịch sử đoạn chat với trợ lý AI nhằm duy trì ngữ cảnh trò chuyện.</li>
              <li><strong>Dữ liệu giao dịch:</strong> Lịch sử nạp Credits, mã đơn hàng thanh toán (OmniAI không lưu trữ thông tin thẻ tín dụng/mật khẩu ngân hàng của bạn).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>2.</span> Mục Đích Sử Dụng Thông Tin
            </h2>
            <p>Thông tin thu thập được sử dụng duy nhất cho các mục đích sau:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Cung cấp và duy trì hoạt động mượt mà của các trợ lý AI, phòng chat và công cụ tạo hình ảnh.</li>
              <li>Xác thực số dư Credits và lịch sử giao dịch chính xác cho tài khoản người dùng.</li>
              <li>Cải thiện chất lượng đáp ứng của mô hình AI và gửi thông báo cập nhật tính năng mới quan trọng.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>3.</span> Cam Kết Không Chia Sẻ Cho Bên Thứ Ba
            </h2>
            <p>
              OmniAI <strong>TUYỆT ĐỐI KHÔNG</strong> bán, trao đổi hoặc thương mại hóa dữ liệu cá nhân hay lịch sử trò chuyện riêng tư của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo rác.
            </p>
            <p>
              Dữ liệu chỉ được cung cấp trong trường hợp có yêu cầu chính thức bằng văn bản từ cơ quan pháp luật có thẩm quyền theo đúng quy định của pháp luật Việt Nam.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>4.</span> Bảo Mật Dữ Liệu & Mã Hóa
            </h2>
            <p>
              Mọi dữ liệu truyền tải giữa trình duyệt của bạn và máy chủ OmniAI đều được mã hóa bằng giao thức bảo mật chuẩn SSL/TLS (HTTPS). Lịch sử hội thoại được lưu trữ trên cơ sở dữ liệu bảo mật cao với cơ chế kiểm soát truy cập nghiêm ngặt.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>5.</span> Quyền Của Người Dùng Đối Với Dữ Liệu
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Xem & Chỉnh sửa:</strong> Bạn có quyền cập nhật thông tin cá nhân trong trang Cài đặt tài khoản bất kỳ lúc nào.</li>
              <li><strong>Xóa lịch sử trò chuyện:</strong> Bạn có thể chủ động xóa từng cuộc hội thoại hoặc toàn bộ lịch sử chat chỉ bằng một thao tác.</li>
              <li><strong>Yêu cầu xóa tài khoản:</strong> Bạn có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu liên quan khỏi máy chủ.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>6.</span> Liên Hệ Hỗ Trợ Bảo Mật
            </h2>
            <p>
              Nếu bạn có bất kỳ thắc mắc hoặc góp ý nào về chính sách quyền riêng tư, vui lòng liên hệ với Đội ngũ Hỗ trợ OmniAI qua Email: <strong>support@omniai.app</strong>.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 OmniAI Platform. Tất cả quyền được bảo lưu.</p>
          <Link href="/terms" className="text-cyan-400 hover:underline">
            Xem Điều khoản dịch vụ →
          </Link>
        </div>
      </div>
    </div>
  );
}
