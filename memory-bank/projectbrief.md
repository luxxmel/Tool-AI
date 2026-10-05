# Project Brief - Tool-AI (OmniAI Platform)

## 📌 1. Tổng quan Dự án
**Tool-AI** (thương hiệu **OmniAI Platform**) là giải pháp nền tảng Web AI đa chức năng toàn diện (All-in-One AI Suite) dành cho người dùng cá nhân, sáng tạo nội dung và doanh nghiệp. Hệ thống được phát triển trên nền tảng Next.js 15 App Router, React 19, Tailwind CSS, Prisma ORM và kết nối trực tiếp với các API AI hàng đầu hiện nay như Google Gemini 3.7 Flash, Gemini Vision, FLUX.1 Pro, cùng hạ tầng sinh ảnh tự do AI Horde.

---

## 🎯 2. Chân dung Người dùng & Đối tượng Mục tiêu (Target Audience)
1. **Sáng tạo nội dung (Content Creators, Marketers)**: Cần công cụ tạo kịch bản TikTok, Ad Copy Facebook, Shopee SEO, và tạo ảnh truyền thông nhanh chóng chất lượng cao.
2. **Người dùng giải trí & Roleplay**: Yêu thích trò chuyện, nhập vai tương tác với các nhân vật AI có cá tính, cảm xúc sống động như người thật.
3. **Quản trị viên (Admins)**: Cần hệ thống quản trị trực quan để quản lý phân quyền (USER/VIP/ADMIN), theo dõi bài viết cộng đồng, điều phối thông báo và cấp phát Credits.

---

## 🚀 3. Phạm vi Dự án (Project Scope & Core Features)

### A. AI Chat & Multi-Character Roleplay
- **Hệ thống nhân vật đa dạng**: Hơn 20+ Bot AI trợ lý và nhân vật trending (CEO Mạc Từ Khiêm, Kiếm khách Triệu Vô Thần, Luật sư Bạch Nhụy Băng, Hacker Đinh Khắc Nam, v.v.).
- **Immersive Dialogue Engine**: Xử lý prompt nhập vai chân thực 100%, hội thoại nói chuyện 90% trực tiếp, phản hồi có chiều sâu cảm xúc, không trả lời máy móc.

### B. AI Image Generation & Editing Studio
- **Công nghệ FLUX.1 Pro & Realism**: Sinh ảnh siêu nét, chân thực không bị bóng sáp doll/anime.
- **Proxy Image Engine (`/api/images/proxy`)**: Xử lý cache memory 24h, tăng độ nét nhiếp ảnh (`sharpening`) và tự động xóa bỏ watermark thương hiệu.

### C. Admin Operations (Bảng Quản trị 5 Tab)
- 👥 **Người dùng**: Tìm kiếm, phân quyền (USER, VIP, ADMIN), cấp/đặt Credit.
- 📝 **Bài viết**: Quản lý bài viết cộng đồng, ẩn/hiện, xóa bài.
- 💰 **Cấp Credits**: Thao tác điều chỉnh số dư Credit siêu tốc cho Admin.
- 🔔 **Thông báo**: Xem trước và soạn thông báo sự kiện/tính năng mới.
- 🤖 **Nhân vật / Bot**: Danh sách tổng hợp toàn bộ các Bot và Assistant trong hệ thống.

### D. AI Utility Suite & Entertainment
- **3D Tarot Reader**: Trải nghiệm bói bài Tarot 3D tương tác sống động với Three.js & React Three Fiber.
- **AI Tools Studio**: Công cụ hỗ trợ viết kịch bản TikTok, Ad Copy, SEO Shopee, Text-to-Speech (TTS Neural).
- **Cyberpunk Profile**: Trang cá nhân tùy chỉnh giao diện futuristic, ẩn/hiện thông tin cá nhân.
