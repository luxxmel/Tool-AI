import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ensureUser } from "@/lib/ensureUser";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "hoanglinhcntti@gmail.com";
  
  let userResult: any = null;
  let userError: any = null;
  try {
    userResult = await ensureUser(email);
  } catch (err: any) {
    userError = err?.message || String(err);
  }

  // Check webhook and restart.txt
  let webhookContent = null;
  let tmpRestartExists = false;
  try {
    const webhookPath = path.join(process.cwd(), "webhook.php");
    if (fs.existsSync(webhookPath)) {
      webhookContent = fs.readFileSync(webhookPath, "utf8");
    }
  } catch (e: any) {
    webhookContent = "Error: " + e.message;
  }

  try {
    const restartPath = path.join(process.cwd(), "tmp", "restart.txt");
    tmpRestartExists = fs.existsSync(restartPath);
  } catch {}

  return NextResponse.json({
    cwd: process.cwd(),
    nodeVersion: process.version,
    pid: process.pid,
    uptime: process.uptime(),
    userResult,
    userError,
    tmpRestartExists,
    webhookContent,
  });
}
