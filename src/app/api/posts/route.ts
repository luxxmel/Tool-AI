import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const currentUserId = searchParams.get("userId");
    const authorId = searchParams.get("authorId");

    const where: Record<string, unknown> = {};

    if (authorId) {
      where.authorId = authorId;
    }

    if (!showAll && !authorId) {
      where.status = "published";
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { author: { name: { contains: q } } },
      ];
    }

    let posts = await prisma.post.findMany({
      where,
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
        reactions: true,
        comments: {
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
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });


    const formattedPosts = posts.map((post) => {
      const reactionCounts: Record<string, number> = {
        like: 0,
        love: 0,
        fire: 0,
        haha: 0,
        insight: 0,
      };

      for (const r of post.reactions) {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
      }

      const userReaction = currentUserId
        ? post.reactions.find((r) => r.userId === currentUserId)?.type || null
        : null;

      return {
        id: post.id,
        authorId: post.authorId,
        title: post.title,
        content: post.content,
        category: post.category,
        categoryLabel: post.categoryLabel,
        image: post.image,
        likes: post.likes,
        commentsCount: post.comments.length || post.commentsCount,
        reactions: reactionCounts,
        userReaction,
        comments: post.comments.map((c) => ({
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
        })),
        status: post.status,
        createdAt: new Date(post.createdAt).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        author: {
          id: post.author?.id || post.authorId,
          name: post.author?.name || "Người dùng",
          username: (post.author?.email || "user").split("@")[0],
          avatar:
            post.author?.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(post.author?.email || post.authorId)}`,
          isVip: post.author?.role === "VIP" || post.author?.role === "ADMIN",
          role: post.author?.role || "USER",
        },
      };
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Lỗi khi tải danh sách bài viết:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải bài viết: " + msg },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, categoryLabel, image, authorId, authorEmail, authorName, authorAvatar, authorRole } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Vui lòng nhập tiêu đề và nội dung bài viết" },
        { status: 400 }
      );
    }

    // Đảm bảo author tồn tại trong cơ sở dữ liệu máy chủ
    const authorUser = await ensureUser(authorId, authorEmail, authorName);
    if (!authorUser) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
    let validAuthorId = authorUser.id;

    // Đảm bảo authorUser chắc chắn có record trong SQLite trước khi create post
    try {
      const syncedUser = await prisma.user.upsert({
        where: { email: authorUser.email },
        update: {
          name: authorName || authorUser.name,
          avatar: authorAvatar || authorUser.avatar,
        },
        create: {
          email: authorUser.email,
          name: authorName || authorUser.name,
          avatar: authorAvatar || authorUser.avatar,
          role: authorRole || authorUser.role,
          credits: authorUser.credits,
        },
      });
      validAuthorId = syncedUser.id;
    } catch (e) {
      console.warn("User upsert before post create warning:", e);
    }

    const categoryLabels: Record<string, string> = {
      prompt: "Prompt AI",
      art: "Nghệ thuật AI",
      code: "Lập trình & Code",
      assistant: "Chia sẻ Trợ lý",
      general: "Thảo luận",
    };

    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || "prompt",
        categoryLabel: categoryLabel || categoryLabels[category] || "Khám phá",
        image: image?.trim() || null,
        status: "published",
        authorId: validAuthorId,
      },
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
        id: newPost.id,
        authorId: newPost.authorId,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        categoryLabel: newPost.categoryLabel,
        image: newPost.image,
        likes: newPost.likes,
        commentsCount: newPost.commentsCount,
        reactions: { like: 0, love: 0, fire: 0, haha: 0, insight: 0 },
        userReaction: null,
        comments: [],
        status: newPost.status,
        createdAt: "Vừa xong",
        author: {
          id: newPost.author?.id || validAuthorId,
          name: newPost.author?.name || authorUser.name || "Người dùng",
          username: (newPost.author?.email || authorUser.email || "user@omni").split("@")[0],
          avatar: newPost.author?.avatar || authorUser.avatar,
          isVip: newPost.author?.role === "VIP" || newPost.author?.role === "ADMIN" || authorUser.role === "ADMIN",
          role: newPost.author?.role || authorUser.role || "USER",
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng bài viết:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo bài viết: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
