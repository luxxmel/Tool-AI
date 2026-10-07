import { NextResponse } from "next/server";

export async function GET() {
  const diag: Record<string, any> = {
    time: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    cwd: process.cwd(),
    db_url: process.env.DATABASE_URL || "not_set",
  };

  try {
    const fs = await import("fs");
    const path = await import("path");
    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    diag.dbFileExists = fs.existsSync(dbPath);
    if (diag.dbFileExists) {
      diag.dbStat = fs.statSync(dbPath);
    }
  } catch (e: any) {
    diag.fsError = e.message;
  }

  try {
    const { PrismaClient } = await import("@/lib/generated-prisma");
    const p = new PrismaClient();
    const count = await p.user.count();
    diag.prismaStatus = "OK";
    diag.userCount = count;
  } catch (e: any) {
    diag.prismaStatus = "ERROR";
    diag.prismaError = e.message;
    diag.prismaStack = e.stack;
  }

  return NextResponse.json(diag);
}
