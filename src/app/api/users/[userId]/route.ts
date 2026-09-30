import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();

    const dataToUpdate: Record<string, unknown> = {};

    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
    }

    if (body.role !== undefined) {
      dataToUpdate.role = String(body.role).toUpperCase();
    }

    if (body.credits !== undefined) {
      dataToUpdate.credits = Number(body.credits);
    }

    if (body.name !== undefined) {
      dataToUpdate.name = String(body.name).trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật người dùng" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa người dùng" },
      { status: 500 }
    );
  }
}
