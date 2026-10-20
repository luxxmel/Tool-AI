import { prisma } from "@/lib/prisma";

/**
 * Lấy hoặc bảo đảm thông tin người dùng từ Database SQLite của máy chủ.
 * - Tài khoản hoanglinhcntti@gmail.com luôn luôn là ADMIN với vô hạn credits (999999).
 * - Các tài khoản người dùng mới luôn được cấp sẵn 20 Credits.
 * - Có cơ chế Fallback chống sập nếu SQLite / Prisma trên hosting gặp sự cố hoặc trả về null.
 */
export async function ensureUser(
  userId?: string | null,
  userEmail?: string | null,
  userName?: string | null
) {
  const targetId = typeof userId === "string" ? userId.trim() : "";
  const targetEmail = typeof userEmail === "string" ? userEmail.trim().toLowerCase() : "";

  // 1. Kiểm tra tính hợp lệ cơ bản
  if (!targetId && !targetEmail) return null;
  if (
    (targetId === "user-demo-123" && !targetEmail) ||
    (targetId.startsWith("guest_") && !targetEmail) ||
    targetId === "null" ||
    targetId === "undefined"
  ) {
    if (!targetEmail || targetEmail.startsWith("guest_")) return null;
  }

  // 2. Tài khoản Admin cố định: Lịnh Hoàng (hoanglinhcntti@gmail.com hoặc id demo)
  const isHoangLinhAdmin =
    targetEmail === "hoanglinhcntti@gmail.com" ||
    targetId === "cmuchyzaf0000tar86bsjbasb";

  if (isHoangLinhAdmin) {
    try {
      const adminUser = await prisma.user.upsert({
        where: { email: "hoanglinhcntti@gmail.com" },
        update: { role: "ADMIN", credits: 999999 },
        create: {
          email: "hoanglinhcntti@gmail.com",
          name: userName || "Lịnh Hoàng",
          avatar:
            "https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c",
          role: "ADMIN",
          credits: 999999,
        },
      });
      if (adminUser && adminUser.id) {
        return {
          ...adminUser,
          role: "ADMIN",
          credits: 999999,
        };
      }
    } catch (e) {
      console.warn("Prisma admin upsert warn:", e);
    }

    // Fallback đảm bảo ADMIN luôn luôn có tài khoản hợp lệ trong DB
    try {
      const existingDbAdmin = await prisma.user.findFirst({
        where: { email: "hoanglinhcntti@gmail.com" },
      });
      if (existingDbAdmin) return { ...existingDbAdmin, role: "ADMIN", credits: 999999 };
    } catch {
      // Ignored
    }

    return {
      id: "hoanglinhcntti@gmail.com",
      email: "hoanglinhcntti@gmail.com",
      name: userName || "Lịnh Hoàng",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c",
      role: "ADMIN",
      credits: 999999,
    };
  }

  // 3. Tìm trong Database theo ID hoặc Email
  const effectiveEmail =
    targetEmail ||
    (targetId.includes("@")
      ? targetId.toLowerCase()
      : `${targetId}@omni.user`);
  const effectiveName = userName || effectiveEmail.split("@")[0];
  const effectiveAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    effectiveEmail
  )}`;

  try {
    const searchConditions: Array<{ id?: string; email?: string }> = [];
    if (targetId && targetId !== "null" && targetId !== "undefined") {
      searchConditions.push({ id: targetId });
      if (targetId.includes("@")) {
        searchConditions.push({ email: targetId.toLowerCase() });
      }
    }
    if (targetEmail) {
      searchConditions.push({ email: targetEmail });
    }

    if (searchConditions.length > 0) {
      const user = await prisma.user.findFirst({
        where: { OR: searchConditions },
      });

      if (user && user.id) {
        if (user.email.toLowerCase() === "hoanglinhcntti@gmail.com") {
          return {
            ...user,
            role: "ADMIN",
            credits: 999999,
            status: "active",
          };
        }
        return user;
      }
    }

    // 4. CHỈ tự tạo tài khoản nếu đây là email thật (hợp lệ) do người dùng đăng ký hoặc OAuth trả về
    // Tuyệt đối KHÔNG tự bịa tài khoản dạng targetId@omni.user nếu người dùng chưa từng đăng ký
    if (targetEmail && targetEmail.includes("@") && !targetEmail.endsWith("@omni.user")) {
      const newUser = await prisma.user.upsert({
        where: { email: targetEmail },
        update: {},
        create: {
          email: targetEmail,
          name: effectiveName,
          avatar: effectiveAvatar,
          credits: 20,
          role: "USER",
        },
      });

      if (newUser && newUser.id) {
        return newUser;
      }
    }
  } catch (err) {
    console.warn(`Lỗi khi tìm/tạo user trong DB:`, err);
  }

  // 5. Nếu không tìm thấy người dùng hợp lệ trong DB, trả về null để yêu cầu đăng nhập
  return null;
}
