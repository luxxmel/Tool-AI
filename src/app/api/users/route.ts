import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (role && role !== "all") {
      where.role = role.toUpperCase();
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            conversations: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let formattedUsers = users.map((u) => {
      const isHLAdmin = u.email.toLowerCase().trim() === "hoanglinhcntti@gmail.com";
      return {
        id: u.id,
        name: u.name || (isHLAdmin ? "Lịnh Hoàng" : "Chưa đặt tên"),
        username: u.email.split("@")[0],
        email: u.email,
        role: (isHLAdmin ? "admin" : u.role.toLowerCase()) as "admin" | "vip" | "member",
        status: (u.status || "active") as "active" | "banned",
        avatar:
          u.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.email)}`,
        credits: isHLAdmin ? 999999 : u.credits,
        joinedDate: new Date(u.createdAt).toLocaleDateString("vi-VN"),
        promptsCount: u._count.conversations,
        postsCount: u._count.posts,
      };
    });

    // Nếu cơ sở dữ liệu trên server vì lý do nào chưa có dòng hoanglinhcntti@gmail.com, bổ sung vào đầu danh sách
    const hasAdmin = formattedUsers.some(
      (u) => u.email.toLowerCase().trim() === "hoanglinhcntti@gmail.com"
    );
    if (!hasAdmin) {
      formattedUsers.unshift({
        id: "hoanglinhcntti@gmail.com",
        name: "Lịnh Hoàng",
        username: "hoanglinhcntti",
        email: "hoanglinhcntti@gmail.com",
        role: "admin",
        status: "active",
        avatar: "https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c",
        credits: 999999,
        joinedDate: new Date().toLocaleDateString("vi-VN"),
        promptsCount: 0,
        postsCount: 0,
      });
    }

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Lỗi khi tải danh sách người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách người dùng" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, credits, avatar } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split("@")[0];

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        role: (role || "USER").toUpperCase(),
        status: "active",
        credits: Number(credits) || 10,
        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.email.split("@")[0],
        email: newUser.email,
        role: newUser.role.toLowerCase(),
        status: newUser.status,
        avatar: newUser.avatar,
        credits: newUser.credits,
        joinedDate: new Date(newUser.createdAt).toLocaleDateString("vi-VN"),
        promptsCount: 0,
        postsCount: 0,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return NextResponse.json(
      { error: "Email này đã tồn tại hoặc có lỗi xảy ra" },
      { status: 400 }
    );
  }
}
