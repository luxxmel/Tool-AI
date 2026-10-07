import { PrismaClient } from "./generated-prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

export const prisma = (function () {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = globalForPrisma.prisma ?? undefined;
