import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email hoặc tên tài khoản" },
        { status: 400 }
      );
    }

    const rawInput = email.trim();
    const cleanEmail = rawInput.includes("@")
      ? rawInput.toLowerCase()
      : `${rawInput.toLowerCase()}@biettuot.ai`;
    const cleanName = name?.trim() || rawInput.split("@")[0];

    const isAdmin =
      cleanEmail === "hoanglinhcntti@gmail.com" ||
      rawInput.toLowerCase() === "admin" ||
      rawInput.toLowerCase() === "hoanglinh" ||
      cleanEmail.startsWith("admin@");

    let user: any = null;
    try {
      user = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: {
          name: cleanName,
          role: isAdmin ? "ADMIN" : undefined,
          credits: isAdmin ? 999999 : undefined,
        },
        create: {
          email: cleanEmail,
          name: cleanName,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
          credits: isAdmin ? 999999 : 20,
          role: isAdmin ? "ADMIN" : "USER",
          status: "active",
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          credits: true,
          role: true,
        },
      });
    } catch (dbErr) {
      console.warn("Lỗi lưu DB login (dùng session user):", dbErr);
    }

    const finalUser = user || {
      id: isAdmin ? "cmuchyzaf0000tar86bsjbasb" : `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      credits: isAdmin ? 999999 : 20,
      role: isAdmin ? "ADMIN" : "USER",
    };

    return NextResponse.json({
      success: true,
      user: {
        id: finalUser.id,
        email: finalUser.email,
        username: finalUser.email.split("@")[0],
        displayName: finalUser.name || finalUser.email.split("@")[0],
        avatar: finalUser.avatar,
        credits: finalUser.role === "ADMIN" ? 999999 : finalUser.credits,
        role: finalUser.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập email:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng nhập" },
      { status: 500 }
    );
  }
}
