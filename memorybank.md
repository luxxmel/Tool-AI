# Memory Bank - Tool-AI Project (OmniAI Platform)

## 📌 Project Overview
**Tool-AI** (OmniAI) là nền tảng Web AI đa chức năng tích hợp Next.js (App Router), React 19, Tailwind CSS, Prisma ORM, và các mô hình trí tuệ nhân tạo hàng đầu (Google Gemini 3.7 Flash, Vision, FLUX.1 Pro, AI Horde).

---

## 🛠️ Key Components & Architecture

### 1. AI Image Engine (`src/app/api/images/` & `src/lib/chatImageEngine.ts`)
- **Text-to-Image / Image-to-Image**: Sử dụng mô hình `FLUX.1-Realism`, `FLUX-Pro`, và `Gemini 2.5/3.7 Vision` xử lý ảnh.
- **Proxy Endpoint (`/api/images/proxy`)**: Xử lý cache memory 24h, loại bỏ watermark, tăng độ tương phản nhiếp ảnh (`sharpening`) và trả về định dạng JPEG/PNG chất lượng cao.
- **Style Customization**: Tự động chuyển đổi và làm sạch prompt tiếng Anh nguyên bản không bị gượng ép bối cảnh.

### 2. Full-Featured Admin Panel (`src/app/admin/page.tsx`)
Bao gồm 5 Tab Quản trị chuyên sâu:
1. 👥 **Quản lý Người dùng**: Tìm kiếm, phân quyền (USER/VIP/ADMIN), cộng/đặt Credits.
2. 📝 **Quản lý Bài viết**: Khám phá cộng đồng, ẩn/hiện và xóa bài viết.
3. 💰 **Cấp Credits**: Thao tác nhanh cho Admin với API `/api/admin/credits`.
4. 🔔 **Thông báo**: Xem và soạn thông báo hệ thống trực quan.
5. 🤖 **Nhân vật / Bot**: Danh sách bot AI trợ lý và nhân vật trending.

### 3. Cyber Profile & Customizations
- **Cyberpunk User Profile (`src/app/profile/[username]/page.tsx`)**: Trang cá nhân tùy biến banner, avatar, quyền riêng tư ẩn/hiện thông tin.
- **3D Tarot Reader (`src/components/tarot/TarotView.tsx`)**: Trải nghiệm bói bài Tarot 3D sống động với hiệu ứng Three.js.
- **AI Tools Studio (`src/components/tools/AiToolsStudio.tsx`)**: Bộ công cụ viết kịch bản TikTok, Ad Copy, Shopee SEO, và TTS.

---

## 🔄 Automated Operations & Commands

### Git Sync Command
- **Push thủ công nhanh 1 câu**: `npm run push` (chạy script `scripts/auto_git_sync.bat` sử dụng MinGit).

### Development Server
- **Khởi chạy Dev**: `npm run dev` (chạy Next.js tại `http://localhost:3000`).

---

## 🔒 Security & Role Rules
- **Admin Access Protection**: Độc quyền dành cho tài khoản có `user.role === 'ADMIN'`.
- **Credits System**: Trừ 1 Credit per AI Generation (Tài khoản ADMIN được Vô hạn `∞`).
