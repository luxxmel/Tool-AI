import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const diag: Record<string, any> = {
    time: new Date().toISOString(),
    node_version: process.version,
    node_env: process.env.NODE_ENV,
    cwd: process.cwd(),
    db_url: process.env.DATABASE_URL || "not_set",
  };

  const fs = await import("fs");
  const path = await import("path");

  // Check dev.db existence
  try {
    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    diag.dbFileExists = fs.existsSync(dbPath);
    if (diag.dbFileExists) {
      const stat = fs.statSync(dbPath);
      diag.dbStat = { size: stat.size, mode: (stat.mode & 0o777).toString(8) };
    }
    diag.yescaleKeyLength = (process.env.YESCALE_API_KEY || "").length;
    diag.yescaleKeyPrefix = (process.env.YESCALE_API_KEY || "").slice(0, 10);
    diag.trollllmKeyLength = (process.env.TROLLLLM_API_KEY || "").length;
  } catch (e: any) {
    diag.dbError = e.message;
  }

  // Test Database operations via prisma (sqliteClient)
  try {
    const count = await prisma.user.count();
    const adminUser = await prisma.user.findUnique({ where: { email: "hoanglinhcntti@gmail.com" } });
    const allUsers = await prisma.user.findMany({
      take: 5,
      include: { _count: { select: { conversations: true, posts: true } } },
    });

    diag.dbStatus = "OK";
    diag.userCount = count;
    diag.adminFound = !!adminUser;
    diag.sampleUsers = allUsers.map((u: any) => ({
      email: u.email,
      name: u.name,
      role: u.role,
      credits: u.credits,
    }));
  } catch (e: any) {
    diag.dbStatus = "ERROR";
    diag.dbError = e.message;
    diag.dbStack = e.stack;
  }

  return NextResponse.json(diag);
}
