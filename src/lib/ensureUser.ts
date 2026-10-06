import { prisma } from "@/lib/prisma";

/**
 * Lấy thông tin người dùng từ Database SQLite của máy chủ.
 * Nếu không tồn tại hoặc chưa đăng nhập, trả về null (KHÔNG tự động tạo tài khoản khách để người dùng trên máy khác tự tạo tài khoản hoặc đăng nhập qua FB, GitHub, Google, Email).
 */
export async function ensureUser(userId?: string | null) {
  if (!userId || typeof userId !== "string") return null;
  const targetId = userId.trim();
  if (
    !targetId ||
    targetId === "user-demo-123" ||
    targetId.startsWith("guest_") ||
    targetId === "null" ||
    targetId === "undefined"
  ) {
    return null;
  }

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: targetId },
          { email: targetId.toLowerCase() },
        ],
      },
    });

    if (user) {
      // Nếu là Admin, luôn đảm bảo có vô hạn credits
      if (user.role === "ADMIN" && user.credits < 999999) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { credits: 999999 },
        });
      }
      return user;
    }

    return null;
  } catch (err) {
    console.error(`Lỗi khi tìm user ${targetId} trong DB:`, err);
    return null;
  }
}
