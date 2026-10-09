import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy câu hỏi của user trong 24 giờ qua
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const messages = await prisma.message.findMany({
      where: {
        sender: "USER",
        createdAt: { gte: since },
      },
      select: {
        content: true,
      },
    });

    // Nếu không có đủ câu hỏi trong 24h thì mở rộng sang 7 ngày
    const messagesSource =
      messages.length >= 10
        ? messages
        : await prisma.message.findMany({
            where: {
              sender: "USER",
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
            select: { content: true },
            orderBy: { createdAt: "desc" },
            take: 200,
          });

    // Đếm tần suất xuất hiện của từng câu hỏi (sau khi chuẩn hóa)
    const freq: Record<string, { text: string; count: number }> = {};

    for (const msg of messagesSource) {
      const raw = msg.content.trim();
      // Bỏ câu quá ngắn (< 10 ký tự) hoặc quá dài (> 200 ký tự)
      if (raw.length < 10 || raw.length > 200) continue;
      // Lọc bỏ câu lệnh hệ thống
      if (raw.startsWith("[") || raw.startsWith("{")) continue;

      // Chuẩn hóa: lowercase, bỏ dấu câu cuối
      const key = raw
        .toLowerCase()
        .replace(/[?!.,;:…]+$/, "")
        .trim();

      if (!freq[key]) {
        freq[key] = { text: raw, count: 0 };
      }
      freq[key].count++;
    }

    // Sắp xếp theo tần suất và lấy top 6
    const sorted = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Nếu DB chưa đủ dữ liệu, trả fallback questions
    if (sorted.length < 3) {
      return NextResponse.json({
        questions: [],
        isEmpty: true,
        period: "7d",
      });
    }

    return NextResponse.json({
      questions: sorted.map((q) => ({
        text: q.text,
        count: q.count,
      })),
      isEmpty: false,
      period: messages.length >= 10 ? "24h" : "7d",
    });
  } catch (err) {
    console.error("[trending-questions]", err);
    return NextResponse.json(
      { questions: [], isEmpty: true, period: "24h" },
      { status: 500 }
    );
  }
}
