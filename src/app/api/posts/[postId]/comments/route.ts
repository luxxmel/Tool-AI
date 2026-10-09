import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      content: c.content,
      createdAt: new Date(c.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      user: {
        id: c.user?.id || c.userId,
        name: c.user?.name || "Thành viên",
        avatar:
          c.user?.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.user?.email || c.userId)}`,
        role: c.user?.role || "USER",
      },
    }));

    return NextResponse.json({ success: true, comments: formatted });
  } catch (error) {
    console.error("Lỗi khi tải bình luận:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải bình luận" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const body = await request.json();
    const { userId, content, userName, userAvatar, userRole } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bình luận" },
        { status: 401 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Nội dung bình luận không được để trống" },
        { status: 400 }
      );
    }

    const user = await ensureUser(userId, null, userName);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Đảm bảo thông tin user (tên, avatar) được cập nhật đồng bộ vào SQLite User table
    if (userName || userAvatar) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(userName ? { name: userName } : {}),
            ...(userAvatar ? { avatar: userAvatar } : {}),
          },
        });
      } catch {
        // Ignored nếu chưa update được
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Cập nhật lại số lượng comment của post
    const count = await prisma.comment.count({
      where: { postId },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: count },
    });

    const resolvedUser = newComment.user || user;
    const authorName = resolvedUser?.name || userName || user?.name || "Thành viên";
    const authorAvatar =
      resolvedUser?.avatar ||
      userAvatar ||
      user?.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(resolvedUser?.email || user?.email || "user")}`;
    const authorRole = resolvedUser?.role || userRole || user?.role || "USER";

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        userId: newComment.userId,
        content: newComment.content,
        createdAt: "Vừa xong",
        user: {
          id: resolvedUser?.id || user.id,
          name: authorName,
          avatar: authorAvatar,
          role: authorRole,
        },
      },
      commentsCount: count,
    });
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi đăng bình luận" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");
    const userId = searchParams.get("userId");

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: "Thiếu thông tin xóa bình luận" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Không tìm thấy bình luận" }, { status: 404 });
    }

    const user = await ensureUser(userId);
    const isCommentAuthor = user?.id === comment.userId;
    const isPostAuthor = user?.id === comment.post.authorId;
    const isAdmin = user?.role === "ADMIN";

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa bình luận này" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    const count = await prisma.comment.count({
      where: { postId },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: count },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa bình luận",
      commentsCount: count,
    });
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi xóa bình luận" },
      { status: 500 }
    );
  }
}
