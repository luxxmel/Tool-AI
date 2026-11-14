import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== "biettuot_seed_2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Tìm tác giả admin trên production
    let author = await prisma.user.findFirst({
      where: {
        OR: [
          { email: "hoanglinhcntti@gmail.com" },
          { role: "ADMIN" }
        ]
      }
    });

    if (!author) {
      author = await prisma.user.findFirst();
    }

    if (!author) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    const chapters = [
      {
        id: "chuong-1",
        title: "Chương 1: Tín Hiệu Nơi Tận Cùng Không Gian",
        content: `Năm 2142, tại trạm quan sát không gian Vọng Nguyệt lơ lửng ngoài quỹ đạo Sao Hỏa.\n\nTiếng bíp bíp đều đặn từ màn hình radar lượng tử bất ngờ vỡ vụn bởi một dải tần số lạ. Minh Quân — kỹ sư trưởng bộ phận giải mã tín hiệu — giật mình buông tách cà phê nóng, đôi mắt dán chặt vào những làn sóng quang phổ đang nhảy múa điên cuồng trên màn hình holo.\n\n"Đây không phải là bức xạ tàn dư từ vụ nổ siêu tân tinh," Minh Quân lẩm bẩm, ngón tay thoăn thoắt lướt trên bàn phím ảo. "Dải bước sóng này có trật tự toán học... một chuỗi số nguyên tố Fibonacci lặp lại chính xác đến từng micro-giây!"\n\nHệ thống AI Biết Tuốt trên trạm đột ngột phát ra giọng nói trầm tĩnh:\n— "Cảnh báo cấp độ 1: Phát hiện cấu trúc vật thể nhân tạo đang thoát khỏi lỗ sâu Euclid, cách trạm 120.000 km. Vận tốc đang giảm dần từ tiệm cận ánh sáng."\n\nMinh Quân nuốt nước bọt. Qua khung cửa kính hợp kim titan dày ba lớp, một vệt sáng màu lam thẫm xé toang màn đêm vô tận của vũ trụ. Không phải thiên thạch. Đó là một con tàu vũ trụ cổ xưa phủ đầy bụi sao pha lê, mang trên mình những biểu tượng chữ tượng hình chưa từng xuất hiện trong bất kỳ dữ liệu nào của nhân loại.\n\nMột cánh cổng dẫn đến nền văn minh đã mất vừa chính thức mở ra ngay trước ngưỡng cửa Hệ Mặt Trời.`
      },
      {
        id: "chuong-2",
        title: "Chương 2: Lời Thì Thầm Của Cổ Thần",
        content: `Bộ đồ bảo hộ áp suất cao của Minh Quân vang lên tiếng xì nhẹ khi cánh cửa buồng khử từ mở rộng. Anh cùng đội thám hiểm bước chân vào khoang lái của con tàu bí ẩn.\n\nKhông khí bên trong lạnh buốt, nhưng kỳ lạ thay, cảm biến cho thấy hàm lượng oxy và áp suất hoàn toàn tương thích với cơ thể con người. Dưới chân họ, sàn tàu được lát bằng một loại kim loại hữu cơ có thể tự phát sáng nhẹ theo từng bước chân.\n\nỞ trung tâm buồng lái, một khối lăng kính pha lê đen trôi nổi lơ lửng, phát ra những nhịp đập ánh sáng như quả tim sống.\n\n— "Kính gửi Kỹ sư Minh Quân," AI Biết Tuốt truyền âm qua tai nghe. "Khối lăng kính này đang phát ra sóng điện não đồng bộ trực tiếp với tần số tư duy của anh. Nó đang cố gắng giao tiếp."\n\nMinh Quân bước tới gần. Dường như có một sức hút vô hình thôi thúc anh tháo găng tay bảo hộ và đặt nhẹ lòng bàn tay lên bề mặt lạnh ngắt của khối pha lê.\n\nOÀNH!\n\nMột luồng thông tin khổng lồ lập tức ùa vào tâm trí anh. Hình ảnh về một dải ngân hà rực rỡ cách đây hàng tỷ năm, những hành tinh pha lê lộng lẫy và một cuộc đại chiến định mệnh giữa các vì sao hiện lên sống động như chính anh đã từng trải qua.\n\nVà trong biển sâu ý thức đó, một giọng nói cổ xưa vang vọng:\n"Chào người thừa kế cuối cùng của Dòng Dõi Thái Dương... Chúng tôi đã đợi các bạn suốt ba kỷ nguyên."\n\nCuộc hành trình vĩ đại của loài người hướng về trung tâm vũ trụ giờ đây mới thực sự bắt đầu!`
      }
    ];

    const story = await prisma.publishedStory.create({
      data: {
        authorId: author.id,
        title: "Kỷ Nguyên Tinh Vân: Lời Thì Thầm Của Cổ Thần",
        authorDisplayName: author.name || "Lịnh Hoàng (Biết Tuốt AI)",
        synopsis: "Một tín hiệu bí ẩn từ ngoài quỹ đạo Sao Hỏa xé toang sự tĩnh lặng của Hệ Mặt Trời, mở ra bí mật kinh hoàng về nguồn gốc loài người và nền văn minh cổ đại đã biến mất suốt ba kỷ nguyên.",
        content: JSON.stringify(chapters),
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
        category: "tieuthuyet",
        ageRating: "ALL",
        status: "APPROVED",
        views: 38,
        likes: 9,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Đã tạo truyện mẫu 2 chương thành công!",
      story
    });
  } catch (error: any) {
    console.error("Lỗi seed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
