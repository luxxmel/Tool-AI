import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const body = await request.json();

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    // Kiểm tra quyền sửa bài: phải là tác giả hoặc ADMIN
    if (body.userId) {
      const user = await ensureUser(body.userId);
      const isAuthor = user?.id === post.authorId;
      const isAdmin = user?.role === "ADMIN";

      if (!isAuthor && !isAdmin) {
        return NextResponse.json(
          { error: "Bạn không có quyền chỉnh sửa bài viết này" },
          { status: 403 }
        );
      }
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (body.title !== undefined) {
      dataToUpdate.title = body.title.trim();
    }

    if (body.content !== undefined) {
      dataToUpdate.content = body.content.trim();
    }

    if (body.category !== undefined) {
      dataToUpdate.category = body.category;
    }

    if (body.categoryLabel !== undefined) {
      dataToUpdate.categoryLabel = body.categoryLabel;
    }

    if (body.image !== undefined) {
      dataToUpdate.image = body.image ? body.image.trim() : null;
    }

    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
    }

    if (body.likeChange !== undefined) {
      dataToUpdate.likes = {
        increment: Number(body.likeChange),
      };
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: dataToUpdate,
      include: {
        author: {
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

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        authorId: updatedPost.authorId,
        title: updatedPost.title,
        content: updatedPost.content,
        category: updatedPost.category,
        categoryLabel: updatedPost.categoryLabel,
        image: updatedPost.image,
        likes: updatedPost.likes,
        commentsCount: updatedPost.commentsCount,
        status: updatedPost.status,
        author: {
          id: updatedPost.author.id,
          name: updatedPost.author.name || "Người dùng",
          username: updatedPost.author.email.split("@")[0],
          avatar: updatedPost.author.avatar,
          isVip: updatedPost.author.role === "VIP" || updatedPost.author.role === "ADMIN",
          role: updatedPost.author.role,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật bài viết" },
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
    const userId = searchParams.get("userId");

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    // Kiểm tra quyền xóa: tác giả hoặc ADMIN
    if (userId) {
      const user = await ensureUser(userId);
      const isAuthor = user?.id === post.authorId;
      const isAdmin = user?.role === "ADMIN";

      if (!isAuthor && !isAdmin) {
        return NextResponse.json(
          { error: "Bạn không có quyền xóa bài viết này" },
          { status: 403 }
        );
      }
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa bài viết" },
      { status: 500 }
    );
  }
}
