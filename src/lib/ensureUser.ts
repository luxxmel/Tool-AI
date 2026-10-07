import { prisma } from "@/lib/prisma";

/**
 * Lấy hoặc bảo đảm thông tin người dùng từ Database SQLite của máy chủ.
 * - Tài khoản hoanglinhcntti@gmail.com luôn luôn là ADMIN với vô hạn credits (999999).
 * - Các tài khoản người dùng mới luôn được cấp sẵn 20 Credits.
 * - Có cơ chế Fallback chống sập nếu SQLite trên hosting gặp sự cố.
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

  const isHoangLinhAdmin =
    targetId.toLowerCase().includes("hoanglinhcntti") ||
    targetId.toLowerCase() === "hoanglinhcntti@gmail.com";

  if (isHoangLinhAdmin) {
    try {
      const adminUser = await prisma.user.upsert({
        where: { email: "hoanglinhcntti@gmail.com" },
        update: { role: "ADMIN", credits: 999999 },
        create: {
          email: "hoanglinhcntti@gmail.com",
          name: "Lịnh Hoàng",
          avatar:
            "https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c",
          role: "ADMIN",
          credits: 999999,
        },
      });
      return adminUser;
    } catch {
      return {
        id: "hoanglinhcntti@gmail.com",
        email: "hoanglinhcntti@gmail.com",
        name: "Lịnh Hoàng",
        avatar:
          "https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c",
        role: "ADMIN",
        credits: 999999,
      };
    }
  }

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id: targetId }, { email: targetId.toLowerCase() }],
      },
    });

    if (user) {
      if (user.email.toLowerCase() === "hoanglinhcntti@gmail.com") {
        if (user.role !== "ADMIN" || user.credits < 999999) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN", credits: 999999 },
          });
        }
      }
      return user;
    }

    // Nếu không tìm thấy bằng id/email nhưng targetId là email hoặc id hợp lệ, tự động tạo mới với 20 Credits
    if (
      targetId.includes("@") ||
      targetId.startsWith("google_") ||
      targetId.startsWith("gh_") ||
      targetId.startsWith("fb_")
    ) {
      const email = targetId.includes("@")
        ? targetId.toLowerCase()
        : `${targetId}@omni.user`;
      try {
        const newUser = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: email.split("@")[0],
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
              email
            )}`,
            credits: 20,
            role: "USER",
          },
        });
        return newUser;
      } catch {
        return {
          id: targetId,
          email,
          name: email.split("@")[0],
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
            email
          )}`,
          credits: 20,
          role: "USER",
        };
      }
    }

    return null;
  } catch (err) {
    console.error(`Lỗi khi tìm user ${targetId} trong DB:`, err);
    // Fallback an toàn cho tài khoản đã có email
    if (targetId.includes("@")) {
      return {
        id: targetId,
        email: targetId.toLowerCase(),
        name: targetId.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
          targetId
        )}`,
        credits: 20,
        role: "USER",
      };
    }
    return null;
  }
}
