import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Lấy tất cả bài viết đã xuất bản kèm thông tin tác giả
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      select: {
        id: true,
        authorId: true,
        likes: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
          },
        },
      },
    });

    // 2. Gom nhóm theo tác giả (Map)
    const authorMap = new Map<
      string,
      {
        id: string;
        name: string;
        username: string;
        email: string;
        avatar: string;
        role: string;
        posts: number;
        likes: number;
      }
    >();

    for (const post of posts) {
      const author = post.author;
      if (!author || author.status === "banned") continue;

      const authorId = author.id || post.authorId;
      if (!authorMap.has(authorId)) {
        const username = author.email
          ? author.email.split("@")[0]
          : `user_${authorId.slice(-4)}`;
        const avatar =
          author.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

        authorMap.set(authorId, {
          id: authorId,
          name: author.name || username,
          username,
          email: author.email,
          avatar,
          role: author.role,
          posts: 0,
          likes: 0,
        });
      }

      const item = authorMap.get(authorId)!;
      item.posts += 1;
      item.likes += post.likes || 0;
    }

    // 3. Chuyển thành danh sách và gán danh hiệu huy hiệu (badge)
    const contributors = Array.from(authorMap.values()).map((c) => {
      let badge = "Thành viên 🌟";
      if (c.role === "ADMIN") {
        badge = "Admin 🛡️";
      } else if (c.role === "VIP") {
        badge = "VIP ⭐";
      } else if (c.posts >= 10) {
        badge = "Top Tác Giả 🏆";
      } else if (c.posts >= 3) {
        badge = "Tích Cực 🚀";
      }

      return {
        ...c,
        badge,
      };
    });

    // 4. Sắp xếp: Số lượng bài viết nhiều nhất giảm dần, nếu bằng nhau thì so sánh lượt thích
    contributors.sort((a, b) => {
      if (b.posts !== a.posts) return b.posts - a.posts;
      return b.likes - a.likes;
    });

    // 5. Lấy đúng Top 5 tài khoản đăng bài nhiều nhất
    const topContributors = contributors.slice(0, 5);

    return NextResponse.json({
      success: true,
      contributors: topContributors,
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách Top Đóng Góp:", error);
    return NextResponse.json(
      { error: "Lỗi khi tải danh sách đóng góp", contributors: [] },
      { status: 500 }
    );
  }
}
