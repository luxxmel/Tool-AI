import { NextRequest, NextResponse } from "next/server";
import { getStoredAnnouncements, saveStoredAnnouncements, AnnouncementItem } from "@/data/announcementsData";
import { ensureUser } from "@/lib/ensureUser";

export async function GET() {
  const announcements = getStoredAnnouncements();
  return NextResponse.json({ success: true, announcements });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emoji, tag, title, desc, cta, ctaHref, type, image, adminId } = body;

    // Kiểm tra quyền Admin
    let user = null;
    if (adminId) {
      user = await ensureUser(adminId);
    }

    if (!user) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) user = await ensureUser(cookieUser.id);
        } catch {}
      }
    }

    const isAdmin =
      user?.role === "ADMIN" ||
      user?.email?.toLowerCase().trim() === "hoanglinhcntti@gmail.com";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên (ADMIN) mới có quyền đăng thông báo!" },
        { status: 403 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề thông báo không được để trống" }, { status: 400 });
    }

    const currentList = getStoredAnnouncements();

    const tagColors: Record<string, string> = {
      new_feature: "from-violet-600 to-indigo-600",
      event: "from-rose-600 to-orange-500",
      tip: "from-amber-500 to-yellow-500",
      update: "from-emerald-600 to-teal-600",
    };

    const backgrounds: Record<string, string> = {
      new_feature: "from-violet-950/80 via-indigo-950/80 to-slate-950/90",
      event: "from-rose-950/80 via-orange-950/70 to-slate-950/90",
      tip: "from-amber-950/80 via-yellow-950/70 to-slate-950/90",
      update: "from-emerald-950/80 via-teal-950/70 to-slate-950/90",
    };

    const accents: Record<string, string> = {
      new_feature: "border-violet-500/40",
      event: "border-rose-500/40",
      tip: "border-amber-500/40",
      update: "border-emerald-500/40",
    };

    const chosenType = (type || "new_feature") as AnnouncementItem["type"];

    const newAnnouncement: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      type: chosenType,
      emoji: emoji?.trim() || "📣",
      tag: tag?.trim() || "Thông báo",
      tagColor: tagColors[chosenType] || "from-indigo-600 to-cyan-600",
      title: title.trim(),
      desc: desc?.trim() || "",
      cta: cta?.trim() || "Xem ngay →",
      ctaHref: ctaHref?.trim() || "#",
      bg: backgrounds[chosenType] || "from-slate-900 via-indigo-950 to-slate-950",
      accent: accents[chosenType] || "border-indigo-500/40",
      image: image?.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    };

    // Thêm vào đầu danh sách
    const updatedList = [newAnnouncement, ...currentList];
    saveStoredAnnouncements(updatedList);

    return NextResponse.json({
      success: true,
      message: "Đăng thông báo thành công!",
      announcement: newAnnouncement,
      announcements: updatedList,
    });
  } catch (err: any) {
    console.error("Lỗi khi đăng thông báo:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể đăng thông báo lúc này" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, emoji, tag, title, desc, cta, ctaHref, type, adminId } = body;

    let user = null;
    if (adminId) {
      user = await ensureUser(adminId);
    }

    if (!user) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) user = await ensureUser(cookieUser.id);
        } catch {}
      }
    }

    const isAdmin =
      user?.role === "ADMIN" ||
      user?.email?.toLowerCase().trim() === "hoanglinhcntti@gmail.com";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên (ADMIN) mới có quyền chỉnh sửa thông báo!" },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thông báo cần sửa" }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề thông báo không được để trống" }, { status: 400 });
    }

    const currentList = getStoredAnnouncements();
    const targetIndex = currentList.findIndex((item) => String(item.id) === String(id));

    if (targetIndex === -1) {
      return NextResponse.json({ error: "Không tìm thấy thông báo cần sửa" }, { status: 404 });
    }

    const updatedList = [...currentList];
    updatedList[targetIndex] = {
      ...updatedList[targetIndex],
      emoji: emoji?.trim() || updatedList[targetIndex].emoji || "📣",
      tag: tag?.trim() || updatedList[targetIndex].tag || "Thông báo",
      title: title.trim(),
      desc: desc?.trim() || "",
      cta: cta?.trim() || updatedList[targetIndex].cta || "Xem ngay →",
      ctaHref: ctaHref?.trim() || updatedList[targetIndex].ctaHref || "#",
      type: (type || updatedList[targetIndex].type || "new_feature") as AnnouncementItem["type"],
    };

    saveStoredAnnouncements(updatedList);

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật thông báo thành công!",
      announcements: updatedList,
    });
  } catch (err: any) {
    console.error("Lỗi khi cập nhật thông báo:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể cập nhật thông báo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminId = searchParams.get("adminId");

    let user = null;
    if (adminId) {
      user = await ensureUser(adminId);
    }

    if (!user) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) user = await ensureUser(cookieUser.id);
        } catch {}
      }
    }

    const isAdmin =
      user?.role === "ADMIN" ||
      user?.email?.toLowerCase().trim() === "hoanglinhcntti@gmail.com";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên (ADMIN) mới có quyền xóa thông báo!" },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thông báo cần xóa" }, { status: 400 });
    }

    const currentList = getStoredAnnouncements();
    const updatedList = currentList.filter((item) => String(item.id) !== String(id));
    saveStoredAnnouncements(updatedList);

    return NextResponse.json({
      success: true,
      message: "Đã xóa thông báo thành công!",
      announcements: updatedList,
    });
  } catch (err: any) {
    console.error("Lỗi khi xóa thông báo:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể xóa thông báo" },
      { status: 500 }
    );
  }
}
