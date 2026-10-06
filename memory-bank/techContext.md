# Tech Context & Runtime Environment - Tool-AI (OmniAI)

## 🛠️ 1. Công nghệ Sử dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản / Chi tiết |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 15.x |
| **UI Library** | React | 19.x |
| **Styling Engine** | Tailwind CSS & Lucide Icons | Responsive Cyberpunk Dark Theme |
| **Database ORM** | Prisma ORM | SQLite (Dev) / PostgreSQL (Prod) |
| **3D Rendering** | Three.js & React Three Fiber | Render bài Tarot 3D tương tác |
| **AI Models (Text)** | Google Gemini 3.7 Flash | Mô hình xử lý ngôn ngữ siêu tốc |
| **AI Models (Vision/Prompt)** | Claude Fable 5.1 & Gemini 3.8 Flash | Phân tích ảnh gốc & Visual Director tối ưu prompt sinh ảnh |
| **AI Models (Image)** | Yescale API (`gemini-2.5-flash-image[nano-banana]`) | Engine sinh ảnh cao cấp qua Yescale API (hỗ trợ aspect ratio & reference images) |

---

## 🌐 2. Môi trường Runtime & Scripts

### A. Môi trường Phát triển (Local Dev)
- **Node.js**: v20+ / Windows PowerShell Environment.
- **Lệnh chạy Dev Server**: `npm run dev` (Khởi chạy tại `http://localhost:3000`).
- **Lệnh kiểm tra Type Safety**: `npx tsc --noEmit` (Đảm bảo 0 lỗi trước khi commit).

### B. Tự động đồng bộ Git & Memory Bank (Auto Git Sync)
- **Lệnh kích hoạt**: `npm run push` hoặc chạy trực tiếp `.\scripts\auto_git_sync.bat`.
- **Luồng hoạt động**:
  1. Kiểm tra trạng thái Git repository.
  2. Tự động thêm toàn bộ thay đổi (`git add .`).
  3. Tạo commit với timestamp hiện tại.
  4. Push dữ liệu lên branch `main` của kho lưu trữ GitHub `https://github.com/luxxmel/Tool-AI.git`.

---

## 🗝️ 3. Biến Môi trường (Environment Variables `.env`)
- `DATABASE_URL`: Đường dẫn kết nối cơ sở dữ liệu SQLite (`file:./dev.db`).
- `GEMINI_API_KEY`: API Key truy cập Google Gemini 3.7 Flash & Vision.
- `FLUX_API_KEY` / `HF_TOKEN`: API key sinh ảnh mô hình FLUX.1 Pro.
- `NEXTAUTH_SECRET`: Khóa mã hóa phiên đăng nhập JWT.
