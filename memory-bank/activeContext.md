# Active Context & Current Focus - Tool-AI (OmniAI)

## 🎯 1. Trọng tâm Công việc Hiện tại (Current Active Tasks)

1. **Chuẩn hóa & Hoàn thiện Thư mục Memory Bank (`memory-bank/`)**:
   - Chuyển đổi từ file `memorybank.md` đơn lẻ sang thư mục ký ước tiêu chuẩn `memory-bank/` gồm 5 file tài liệu sâu sát dự án (`projectbrief.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`).
   - Khởi tạo file điều hướng ngữ cảnh tự động [`.antigravityrules`](file:///c:/Tool-AI/.antigravityrules).

2. **Cập nhật & Mở rộng Nhân vật AI (10 New Characters)**:
   - Đã tích hợp 10 nhân vật AI mới vào [`src/data/newCharacters.ts`](file:///c:/Tool-AI/src/data/newCharacters.ts) và kết nối vào [`src/data/aiData.ts`](file:///c:/Tool-AI/src/data/aiData.ts).
   - Đảm bảo 100% hình ảnh đại diện avatar sử dụng link Unsplash nhiếp ảnh cao cấp, không trùng lặp ảnh cũ.

3. **Nâng cấp Hệ thống Nhập vai Chat (`src/app/api/chat/route.ts`)**:
   - Tối ưu quy tắc System Prompt giúp các Bot AI tương tác hoàn toàn tự nhiên như người thật, triệt tiêu phản hồi kiểu máy móc.

---

## 💡 2. Quyết định Kỹ thuật Mới nhất (Recent Technical Decisions)

- **Quy tắc Kiểm tra Type Strictness**: Chạy `npx tsc --noEmit` sau mỗi đợt chỉnh sửa code để đảm bảo Zero Errors trước khi đẩy Git.
- **Auto Push Batching**: Giữ nguyên cơ chế đẩy code tự động qua `npm run push` (chạy script [`scripts/auto_git_sync.bat`](file:///c:/Tool-AI/scripts/auto_git_sync.bat)).
- **Admin Tab Layout Expansion**: Giữ nguyên trang Admin 5 Tab với bảo mật `AccessDenied` chắc chắn.
