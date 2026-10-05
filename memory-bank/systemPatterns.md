# System Patterns & Architecture

## 🏗️ Kiến trúc Hệ thống

```
src/
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── admin/            # Admin Panel với 5 Tabs chính (Protected Route)
│   ├── api/              # Backend REST API Endpoints
│   │   ├── admin/        # API Credits, User management
│   │   ├── chat/         # Engine trò chuyện AI (Immersive System Prompt)
│   │   ├── images/       # Image generation API & Proxy cache
│   │   └── posts/        # Community Posts API
│   ├── chat/             # Giao diện Chat UI
│   ├── studio/           # AI Image Generator Studio
│   └── profile/          # Cyberpunk User Profile
├── components/           # React Components UI
│   ├── explore/          # Explore Feed, Announcements
│   ├── tarot/            # 3D Tarot Reader (Three.js)
│   └── tools/            # AI Tools Studio
├── context/              # React Context (AuthContext, ThemeContext)
├── data/                 # Static data & Bot definitions (aiData.ts, newCharacters.ts)
└── lib/                  # Utilities & Core Services (chatImageEngine.ts, prisma.ts)
```

## 🔐 Quy tắc Phân quyền & Bảo mật
- **Admin Guard**: Trang Admin (`/admin`) kiểm tra `user.role === 'ADMIN'`, chặn tuyệt đối người dùng thường.
- **Credit System**: Mọi API sinh tài nguyên AI đều kiểm tra số dư Credit (Admin có vô hạn `∞`).
