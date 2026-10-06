# System Patterns & Architecture - Tool-AI (OmniAI)

## 🏗️ 1. Kiến trúc Tổng thể (Folder Structure & System Architecture)

```
c:\Tool-AI\
├── .antigravityrules         # Quy tắc tự động nạp context & auto push git
├── memory-bank/              # Thư mục ký ước lưu trữ toàn bộ thông tin dự án
│   ├── projectbrief.md       # Mục tiêu cốt lõi, phạm vi & đối tượng sử dụng
│   ├── systemPatterns.md     # Kiến trúc hệ thống, cấu trúc thư mục & quy ước code
│   ├── techContext.md        # Stack công nghệ, môi trường runtime & API
│   ├── activeContext.md      # Trọng tâm công việc đang thực hiện & quyết định mới
│   └── progress.md           # Bảng tiến độ 100% công việc đã hoàn thành/tồn đọng
├── prisma/
│   └── schema.prisma         # Schema cơ sở dữ liệu (User, Post, CreditTransaction, v.v.)
├── scripts/
│   └── auto_git_sync.bat     # Script tự động commit & push code + memory-bank lên GitHub
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── admin/            # Trang Quản trị viên (5 Tabs, Route Protection)
│   │   ├── api/              # Backend REST API endpoints
│   │   │   ├── admin/        # API cho Admin (credits, users, posts)
│   │   │   ├── chat/         # Backend sinh thoại AI Chat (Immersive System Prompt)
│   │   │   ├── images/       # Backend sinh ảnh & Proxy cache ảnh 24h
│   │   │   └── posts/        # API bài viết cộng đồng
│   │   ├── chat/             # Giao diện Chat trực quan với AI
│   │   ├── studio/           # Studio sinh ảnh AI chuyên nghiệp
│   │   ├── profile/          # Trang cá nhân Cyberpunk Profile
│   │   └── page.tsx          # Landing Page / Feed chính
│   ├── components/           # UI Components phân tách theo domain
│   │   ├── explore/          # Feeds, Announcements card
│   │   ├── tarot/            # 3D Tarot Renderer (Three.js)
│   │   └── tools/            # AI Tools Studio forms
│   ├── context/              # Context Providers (AuthContext, ThemeContext)
│   ├── data/                 # Dữ liệu nhân vật & Bot (aiData.ts, newCharacters.ts)
│   └── lib/                  # Services & Helpers (chatImageEngine.ts, trollllmImagePrompt.ts, yescaleImageEngine.ts, prisma.ts)
```

---

## 🎨 2. Design Patterns & Conventions

### A. Authentication & Admin Protection
- **Client Guard**: Mọi trang Admin (`/admin`) sử dụng hook `useAuth()` để xác thực. Nếu `user.role !== 'ADMIN'`, hệ thống tự động render component `AccessDenied` với icon khóa 🔐.
- **Role Hierarchy**: `USER` -> `VIP` -> `ADMIN`. Người dùng ADMIN có quyền cấp Credit và chuyển role cho tài khoản khác.

### B. Credit Verification & Consumption Pattern
- Mọi API xử lý sinh dữ liệu AI (Tạo ảnh, Trợ lý Bot, Viết kịch bản) đều kiểm tra số dư Credit trong database thông qua Prisma.
- Nguồn tài khoản ADMIN được mặc định nhận trạng thái không giới hạn (`∞ Credits`).

### C. Immersive AI Chat Pattern
- Cấu hình System Prompt được xây dựng tập trung tại [`src/app/api/chat/route.ts`](file:///c:/Tool-AI/src/app/api/chat/route.ts).
- Ép quy tắc 90% câu thoại trực tiếp `"..."`, giảm thiểu hành động trong dấu ngoặc `*...*`, duy trì cảm xúc theo bối cảnh trò chuyện.

### D. Image Proxy & Caching Pattern
- Ảnh sinh từ các nguồn bên ngoài được routing qua [`/api/images/proxy`](file:///c:/Tool-AI/src/app/api/images/proxy).
- Thực hiện lưu cache 24h, loại bỏ watermark, cân chỉnh độ tương phản sharpening trước khi hiển thị cho Client.
