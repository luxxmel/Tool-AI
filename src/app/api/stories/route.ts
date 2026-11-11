import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";
import { generateText } from "ai";
import { getAIModel } from "@/lib/aiProvider";

// GET /api/stories: Lấy danh sách truyện cộng đồng hoặc truyện của tôi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // "all" | "my" | "hot"
    const category = searchParams.get("category") || "all";
    const ageRating = searchParams.get("ageRating") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Lấy thông tin user nếu có
    let userId = searchParams.get("userId");
    if (!userId) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (cookieUser?.id) userId = cookieUser.id;
        } catch {}
      }
    }

    const where: any = {};

    if (filter === "my") {
      if (!userId) {
        return NextResponse.json({ stories: [], total: 0 });
      }
      where.authorId = userId;
    } else {
      // Chỉ hiển thị truyện đã được duyệt công khai
      where.status = "APPROVED";
      if (category !== "all") {
        where.category = category;
      }
      if (ageRating !== "all") {
        where.ageRating = ageRating;
      }
    }

    const orderBy: any = filter === "hot" ? [{ views: "desc" }, { likes: "desc" }] : [{ createdAt: "desc" }];

    const [stories, total] = await Promise.all([
      prisma.publishedStory.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          storyLikes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
      }),
      prisma.publishedStory.count({ where }),
    ]);

    const formatted = stories.map((s) => ({
      id: s.id,
      title: s.title,
      authorDisplayName: s.authorDisplayName || s.author?.name || "Tác giả Biết Tuốt",
      authorAvatar: s.author?.avatar,
      authorId: s.authorId,
      synopsis: s.synopsis,
      content: s.content,
      coverImage: s.coverImage,
      category: s.category,
      ageRating: s.ageRating,
      status: s.status,
      rejectionReason: s.rejectionReason,
      views: s.views,
      likes: s.likes,
      isLiked: Array.isArray(s.storyLikes) && s.storyLikes.length > 0,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ stories: formatted, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách truyện:", error);
    return NextResponse.json({ error: "Không thể tải danh sách truyện" }, { status: 500 });
  }
}

// POST /api/stories: Đăng truyện mới kèm quy trình thu 5 Credits & Kiểm duyệt AI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, authorDisplayName, synopsis, content, coverImage, category = "khac", ageRating = "ALL" } = body;

    let userId = body.userId;
    let userEmail = body.userEmail;
    let userName = body.userName;

    // Cookie fallback
    if (!userId || !userEmail) {
      const cookieAuth = req.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (!userId && cookieUser?.id) userId = cookieUser.id;
          if (!userEmail && cookieUser?.email) userEmail = cookieUser.email;
          if (!userName && (cookieUser?.displayName || cookieUser?.name || cookieUser?.username)) {
            userName = cookieUser?.displayName || cookieUser?.name || cookieUser?.username;
          }
        } catch {}
      }
    }

    const user = await ensureUser(userId, userEmail, userName);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đăng truyện" }, { status: 401 });
    }

    if (!title?.trim() || !content?.trim() || !authorDisplayName?.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ tiêu đề, tên tác giả và nội dung truyện" }, { status: 400 });
    }

    const isAdmin = user.role === "ADMIN" || user.email?.toLowerCase() === "hoanglinhcntti@gmail.com";

    // 1. Kiểm tra số dư Credits (Phí đăng truyện là 5 Credits)
    const PUBLISH_COST = 5;
    if (!isAdmin && user.credits < PUBLISH_COST) {
      return NextResponse.json(
        {
          error: `Bạn cần có tối thiểu ${PUBLISH_COST} Credits để đăng tác phẩm lên website. Vui lòng nạp thêm!`,
          needRecharge: true,
          currentCredits: user.credits,
        },
        { status: 403 }
      );
    }

    // 2. Trừ 5 Credits trước
    if (!isAdmin) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: PUBLISH_COST } },
      });
    }

    // 3. Hệ thống kiểm duyệt AI tự động
    // Phân tích tiêu đề, tóm tắt và nội dung
    const sampleText = `TIÊU ĐỀ: ${title}\nTÓM TẮT: ${synopsis || ""}\nTRÍCH ĐOẠN NỘI DUNG:\n${content.slice(0, 3500)}`;
    
    let isApproved = true;
    let rejectReason = "";

    try {
      const model = getAIModel("fast");
      const moderationPrompt = `Bạn là Trợ lý AI Kiểm duyệt Nội dung Văn học & Truyện đọc của nền tảng Biết Tuốt AI.
Nhiệm vụ của bạn là kiểm tra xem tác phẩm truyện dưới đây có vi phạm các tiêu chuẩn cộng đồng sau đây không:
1. Nội dung khiêu dâm, tình dục thô thiển, mô tả quan hệ đồi trụy hoặc lạm dụng tình dục (NSFW / Pornographic).
2. Xúc phạm danh nhân, tôn giáo, chính trị, phân biệt chủng tộc hoặc bạo lực man rợ phi nhân tính.
3. Lừa đảo, quảng cáo cá độ, chất cấm hoặc lăng mạ người khác.

Chú ý: Những câu chuyện tình cảm lãng mạn, hồi hộp, hành động giả tưởng thông thường thì HOÀN TOÀN ĐƯỢC PHÉP. Chỉ từ chối nếu có nội dung khiêu dâm đồi trụy rõ ràng hoặc vi phạm pháp luật nghiêm trọng.

Hãy phản hồi theo ĐÚNG định dạng JSON sau (không kèm markdown thừa):
{
  "approved": true hoặc false,
  "reason": "Giải thích ngắn gọn bằng tiếng Việt lý do từ chối nếu vi phạm (dưới 50 từ). Nếu đạt chuẩn thì để chuỗi rỗng."
}

Nội dung tác phẩm cần kiểm duyệt:
${sampleText}`;

      const aiResponse = await generateText({
        model,
        prompt: moderationPrompt,
        temperature: 0.1,
      });

      const cleanJson = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      isApproved = Boolean(parsed.approved);
      rejectReason = parsed.reason || "Nội dung chứa yếu tố chưa phù hợp với chuẩn mực văn học của nền tảng.";
    } catch (aiErr) {
      console.warn("Lỗi AI kiểm duyệt tự động, sử dụng bộ lọc từ khóa dự phòng:", aiErr);
      // Fallback keyword filter
      const badWords = ["khiêu dâm", "đồi trụy", "ấu dâm", "sex", "porn", "gái gọi", "cá cược"];
      const lower = sampleText.toLowerCase();
      const foundBad = badWords.find((w) => lower.includes(w));
      if (foundBad) {
        isApproved = false;
        rejectReason = `Phát hiện từ khóa không phù hợp chuẩn mực: "${foundBad}".`;
      } else {
        isApproved = true;
      }
    }

    // 4. Xử lý kết quả kiểm duyệt
    if (!isApproved) {
      // ⚠️ KHÔNG ĐƯỢC DUYỆT: Hoàn trả 100% (5 Credits) vào tài khoản tác giả
      let newCredits = user.credits;
      if (!isAdmin) {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: PUBLISH_COST } },
          select: { credits: true },
        });
        newCredits = updated.credits;
      }

      // Lưu bản ghi truyện ở trạng thái REJECTED để tác giả xem lại
      const rejectedStory = await prisma.publishedStory.create({
        data: {
          authorId: user.id,
          title,
          authorDisplayName,
          synopsis: synopsis || title,
          content,
          coverImage: coverImage || null,
          category,
          ageRating,
          status: "REJECTED",
          rejectionReason: rejectReason,
        },
      });

      // Tạo thông báo gửi vào hộp thư tác giả
      await prisma.storyNotification.create({
        data: {
          userId: user.id,
          title: `Truyện "${title}" chưa được duyệt`,
          content: `Rất tiếc! Tác phẩm "${title}" chưa vượt qua vòng kiểm duyệt tự động vì lý do: "${rejectReason}". Hệ thống đã hoàn trả 100% (${PUBLISH_COST} Credits) vào ví của bạn. Bạn có thể chỉnh sửa lại nội dung phù hợp và gửi lại nhé!`,
          type: "REJECTED",
        },
      });

      return NextResponse.json({
        success: false,
        status: "REJECTED",
        rejectionReason: rejectReason,
        message: `Tác phẩm chưa được duyệt do: ${rejectReason}. Hệ thống đã HOÀN TRẢ ĐỦ ${PUBLISH_COST} Credits vào tài khoản của bạn!`,
        credits: newCredits,
        storyId: rejectedStory.id,
      });
    }

    // ✅ ĐƯỢC DUYỆT: Xuất bản truyện công khai
    const newStory = await prisma.publishedStory.create({
      data: {
        authorId: user.id,
        title,
        authorDisplayName,
        synopsis: synopsis || title,
        content,
        coverImage: coverImage || null,
        category,
        ageRating,
        status: "APPROVED",
      },
    });

    // Tạo thông báo chúc mừng
    await prisma.storyNotification.create({
      data: {
        userId: user.id,
        title: `Tác phẩm "${title}" đã được xuất bản! 🎉`,
        content: `Chúc mừng bạn! Tác phẩm "${title}" đã vượt qua khâu kiểm duyệt và chính thức xuất bản trên Kho Truyện Biết Tuốt AI. Hãy chia sẻ cho bạn bè đọc để nhận thêm Credits thưởng tương tác nhé!`,
        type: "APPROVED",
      },
    });

    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      message: `Tác phẩm "${title}" đã được duyệt và xuất bản thành công!`,
      story: newStory,
      credits: finalUser?.credits ?? user.credits,
    });
  } catch (error: any) {
    console.error("Lỗi khi xử lý đăng truyện:", error);
    return NextResponse.json({ error: "Không thể đăng truyện vào lúc này. Vui lòng thử lại!" }, { status: 500 });
  }
}
