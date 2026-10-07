import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

function createPrismaClient(): PrismaClient | null {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (err) {
    console.error("Lỗi khi khởi tạo PrismaClient:", err);
    return null;
  }
}

export function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prisma === undefined) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy an toàn: chỉ khởi tạo Prisma khi có truy vấn thực tế, không gây crash module import
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      console.warn(`[Prisma Warning] Prisma client không khả dụng khi gọi thuộc tính: ${String(prop)}`);
      // Trả về proxy giả lập an toàn để không bị null pointer exception
      return new Proxy({}, {
        get() {
          return () => Promise.resolve(null);
        },
      });
    }
    return (client as any)[prop];
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = globalForPrisma.prisma ?? undefined;
