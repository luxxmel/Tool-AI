# Memory Bank - Tool-AI Project (OmniAI Platform)

## 📜 CORE RULES & WORKFLOW CONVENTIONS (BỘ QUY TẮC BẮT BUỘC)

> [!IMPORTANT]
> **Quy tắc Tự động Đồng bộ Git (Auto Git Push):**
> 1. Mỗi khi hoàn thành một tính năng, tính năng mới (stack), sửa lỗi (bugfix) hoặc cập nhật giao diện/API, AI hoặc Developer **phải lập tức cập nhật lại file `memorybank.md` này**.
> 2. Sau khi cập nhật `memorybank.md`, lập tức chạy script `.\scripts\auto_git_sync.bat` (hoặc lệnh `npm run push`) để tự động commit & push code mới nhất + memorybank lên repo GitHub `origin/main`.
> 3. Tuyệt đối duy trì trạng thái Zero TypeScript Errors (`npx tsc --noEmit`) trước khi thực hiện push.

> [!NOTE]
> **Quy tắc Phát triển & Bảo mật Code:**
> 1. **Bảo vệ Route Quản trị**: Chỉ cho phép tài khoản có `user.role === 'ADMIN'` truy cập các trang/tính năng quản trị.
> 2. **Hệ thống Credit**: Mọi tính năng sinh AI (tạo ảnh, trợ lý bot, công cụ SEO) đều kiểm tra và trừ Credit hợp lệ (Tài khoản ADMIN được unlimited `∞`).
> 3. **Mô hình AI Chân thực**: Không gượng ép bối cảnh hay từ khóa làm mịn da bóng sáp búp bê/anime trừ khi người dùng yêu cầu rõ ràng.

---

## 📌 Project Overview
**Tool-AI** (OmniAI) là nền tảng Web AI đa chức năng tích hợp Next.js (App Router), React 19, Tailwind CSS, Prisma ORM, và các mô hình trí tuệ nhân tạo hàng đầu (Google Gemini 3.7 Flash, Vision, FLUX.1 Pro, AI Horde).

---

## 🛠️ Key Components & Architecture

### 1. AI Image Engine (`src/app/api/images/`, `src/lib/trollllmImagePrompt.ts` & `src/lib/yescaleImageEngine.ts`)
- **TrollLLM Prompt Pipeline**:
  + **Claude Fable 5.1** (`claude-fable-5-1`): Phân tích ảnh gốc (Vision) và yêu cầu người dùng, tôn trọng tuyệt đối bối cảnh thực tế và tỉ lệ khung hình (Aspect Ratio 1:1, 16:9, 9:16).
  + **Gemini 3.8 Flash** (`gemini-3-8-flash`): Đóng vai trò Visual Director, hoàn thiện ánh sáng điện ảnh, kết cấu da thật (micro-pores) và bám sát prompt đã tạo.
- **Image Generation Engine**: Sử dụng **Yescale API** (`https://api.yescale.io/task/submit`) với model **`gemini-2.5-flash-image[nano-banana]`**, hỗ trợ nạp ảnh tham chiếu trực tiếp qua `config.images` và cấu hình `aspect_ratio`. Đã loại bỏ hoàn toàn Pollinations & Flux.

### 2. Full-Featured Admin Panel (`src/app/admin/page.tsx`)
Bao gồm 5 Tab Quản trị chuyên sâu:
1. 👥 **Quản lý Người dùng**: Tìm kiếm, phân quyền (USER/VIP/ADMIN), cộng/đặt Credits.
2. 📝 **Quản lý Bài viết**: Khám phá cộng đồng, ẩn/hiện và xóa bài viết.
3. 💰 **Cấp Credits**: Thao tác nhanh cho Admin với API `/api/admin/credits`.
4. 🔔 **Thông báo**: Xem và soạn thông báo hệ thống trực quan.
5. 🤖 **Nhân vật / Bot**: Danh sách bot AI trợ lý và nhân vật trending.

### 3. AI Characters & Chat System (`src/data/aiData.ts`, `src/data/newCharacters.ts`, `src/app/api/chat/route.ts`)
- **10 Nhân vật AI mới**: Bổ sung 10 nhân vật đa dạng (Mạc Từ Khiêm, Triệu Vô Thần, Hạ Lạn Tuyết, Tiểu Duyệt Nhi, Lâm Phong Châu, Bạch Nhụy Băng, Đường Tâm Tiếu, Vương Tuệ Tuyết, Trần Vĩnh Quân, Đinh Khắc Nam) với ảnh đại diện Unsplash chân thực, cá tính độc đáo.
- **Nâng cấp Chất lượng Đoạn chat (Immersive Chat System)**: Cập nhật quy tắc `effectiveSystemPrompt` trong `/api/chat/route.ts`, ép AI đóng vai nhập vai tự nhiên 100%, trò chuyện chân thực như người thật (90% lời thoại trực tiếp), giữ nguyên tính cách và cảm xúc theo ngữ cảnh.

### 4. Cyber Profile & Customizations
- **Cyberpunk User Profile (`src/app/profile/[username]/page.tsx`)**: Trang cá nhân tùy biến banner, avatar, quyền riêng tư ẩn/hiện thông tin.
- **3D Tarot Reader (`src/components/tarot/TarotView.tsx`)**: Trải nghiệm bói bài Tarot 3D sống động với hiệu ứng Three.js.
- **AI Tools Studio (`src/components/tools/AiToolsStudio.tsx`)**: Bộ công cụ viết kịch bản TikTok, Ad Copy, Shopee SEO, và TTS.

---

## 🔄 Automated Operations & Commands

### Git Sync Command
- **Push thủ công nhanh 1 câu**: `npm run push` (chạy script `scripts/auto_git_sync.bat` sử dụng MinGit).

### Development Server
- **Khởi chạy Dev**: `npm run dev` (chạy Next.js tại `http://localhost:3000`).
