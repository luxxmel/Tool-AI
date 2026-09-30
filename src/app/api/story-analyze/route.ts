import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { getAIModel } from "@/lib/aiProvider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, mode, context, language = "vi" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Cần có nội dung để phân tích" }, { status: 400 });
    }

    const modePrompts: Record<string, string> = {
      overall: `Bạn là một biên tập viên truyện và kịch bản chuyên nghiệp người Việt Nam.
Hãy phân tích toàn bộ đoạn văn sau theo các tiêu chí:
1. **Cốt truyện & Mạch chuyện**: Logic, nhịp điệu, sự phát triển
2. **Nhân vật**: Độ sâu, tính nhất quán, cảm xúc
3. **Ngôn ngữ & Văn phong**: Sự phong phú, hình ảnh, câu văn
4. **Điểm mạnh** cần phát huy
5. **Điểm cần cải thiện** với gợi ý cụ thể
6. **Đánh giá tổng thể** (điểm /10)

Viết bằng tiếng Việt, thân thiện, xây dựng.`,

      plot: `Bạn là chuyên gia phân tích cốt truyện và kịch bản người Việt Nam.
Hãy phân tích MẠCH TRUYỆN của đoạn văn này:
- Cấu trúc 3 hồi (setup/confrontation/resolution) có rõ ràng không?
- Xung đột chính là gì? Có đủ kịch tính?
- Bước ngoặt và twist có tự nhiên không?
- Nhịp độ câu chuyện (quá nhanh/chậm/ổn)?
- Gợi ý cụ thể để cải thiện mạch truyện

Viết ngắn gọn, súc tích bằng tiếng Việt.`,

      character: `Bạn là chuyên gia xây dựng nhân vật văn học người Việt Nam.
Hãy phân tích NHÂN VẬT trong đoạn văn này:
- Tính cách nhân vật có nhất quán và đa chiều không?
- Động lực hành động có hợp lý không?
- Lời thoại có đặc trưng từng nhân vật không?
- Cung bậc cảm xúc có phong phú không?
- Gợi ý để nhân vật trở nên sống động hơn

Viết bằng tiếng Việt, cụ thể và có ví dụ từ đoạn văn.`,

      language: `Bạn là biên tập viên ngôn ngữ văn học người Việt Nam.
Hãy phân tích NGÔN NGỮ & VĂN PHONG của đoạn văn này:
- Câu văn có đa dạng về cấu trúc không?
- Hình ảnh, ẩn dụ, so sánh có sinh động không?
- Từ ngữ có phong phú và phù hợp thể loại không?
- Giọng kể có nhất quán không?
- Chỉ ra 3-5 câu/đoạn cụ thể cần chỉnh sửa và đề xuất cách viết lại

Viết bằng tiếng Việt, có trích dẫn cụ thể từ đoạn văn.`,

      rewrite: `Bạn là nhà văn sáng tạo người Việt Nam.
Dựa vào đoạn văn gốc này, hãy:
1. Giữ nguyên cốt lõi nội dung và nhân vật
2. Viết lại với văn phong phong phú hơn, hình ảnh sinh động hơn
3. Tăng cường cảm xúc và chiều sâu tâm lý nhân vật
4. Giải thích ngắn gọn những gì bạn đã cải thiện

Trả về đoạn văn viết lại đầu tiên, sau đó giải thích.`,

      dialogue: `Bạn là chuyên gia viết lời thoại kịch bản người Việt Nam.
Hãy phân tích LỜI THOẠI trong đoạn văn này:
- Lời thoại có tự nhiên, sống động không?
- Mỗi nhân vật có giọng nói riêng biệt không?
- Lời thoại có đẩy cốt truyện tiến lên không?
- Chỉ ra lời thoại nào nghe "viết" quá, thiếu tự nhiên
- Viết lại 2-3 dòng thoại mẫu để cải thiện

Viết bằng tiếng Việt, có ví dụ cụ thể.`,

      continue: `Bạn là nhà văn sáng tạo người Việt Nam.
Dựa vào đoạn văn này, hãy:
1. Tiếp tục viết thêm 2-3 đoạn tiếp theo một cách tự nhiên
2. Giữ nguyên giọng văn, nhân vật và mạch truyện
3. Tạo ra một bước ngoặt hoặc tình huống thú vị mới
4. Kết đoạn ở chỗ hồi hộp/gây tò mò để người đọc muốn đọc tiếp

Viết trực tiếp phần tiếp theo, KHÔNG cần giải thích.`,
    };

    let systemPrompt = modePrompts[mode] || modePrompts.overall;
    if (language === "en") {
      systemPrompt += `\n\n[STRICT LANGUAGE REQUIREMENT - ENGLISH ONLY]:
The user's application language is set to ENGLISH.
You MUST write all your analysis, critique, suggestions, scores, rewrites, and continuations ENTIRELY in ENGLISH.
Do not use Vietnamese.`;
    }

    const contextNote = context?.trim()
      ? (language === "en" ? `\n\n[Author's context note]: ${context}` : `\n\n[Bối cảnh thêm từ tác giả]: ${context}`)
      : "";

    const userMessage = language === "en"
      ? `Here is the story excerpt to analyze:\n\n---\n${text}\n---${contextNote}`
      : `Đây là đoạn văn cần phân tích:\n\n---\n${text}\n---${contextNote}`;

    const aiModel = getAIModel("deep");
    if (!aiModel) {
      return NextResponse.json({ error: "AI model chưa được cấu hình" }, { status: 503 });
    }

    const result = streamText({
      model: aiModel.model,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          if (chunk) controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Story analyze error:", error);
    return NextResponse.json(
      { error: "Lỗi khi phân tích. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
