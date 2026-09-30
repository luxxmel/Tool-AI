import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Lấy tất cả user active kèm các bài viết đã published
    const users = await prisma.user.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        posts: {
          where: { status: "published" },
          select: { id: true, likes: true },
        },
      },
    });

    const contributors = users.map((u) => {
      const postsCount = u.posts.length;
      const totalLikes = u.posts.reduce((sum, p) => sum + (p.likes || 0), 0);
      const username = u.email ? u.email.split("@")[0] : `user_${u.id.slice(-4)}`;
      const avatar =
        u.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

      let badge = "Thành viên 🌟";
      if (u.role === "ADMIN") {
        badge = "Admin 🛡️";
      } else if (u.role === "VIP") {
        badge = "VIP ⭐";
      } else if (postsCount >= 10) {
        badge = "Top Tác Giả 🏆";
      } else if (postsCount >= 3) {
        badge = "Tích Cực 🚀";
      }

      return {
        id: u.id,
        name: u.name || username,
        username,
        avatar,
        posts: postsCount,
        likes: totalLikes,
        badge,
        role: u.role,
      };
    });

    // Chỉ lấy người đã đăng ít nhất 1 bài
    const activeContributors = contributors.filter((c) => c.posts > 0);

    // Sắp xếp: Ưu tiên người đăng nhiều bài nhất, sau đó là tổng lượt like
    activeContributors.sort((a, b) => {
      if (b.posts !== a.posts) return b.posts - a.posts;
      return b.likes - a.likes;
    });

    // Lấy top 5 người đóng góp nhiều nhất
    const topContributors = activeContributors.slice(0, 5);

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
