import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { googleAI } from "@/lib/aiProvider";
import { ensureUser } from "@/lib/ensureUser";

export interface CardScanResult {
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  socials: string;
  notes: string;
  confidence: "high" | "medium" | "low";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, userId } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Vui lòng cung cấp hình ảnh danh thiếp / tài liệu cần quét." },
        { status: 400 }
      );
    }

    // Kiểm tra & trừ credit (1 credit cho mỗi lượt scan AI Vision chuẩn xác)
    const user = await ensureUser(userId);
    if (user && user.role !== "ADMIN" && user.credits < 1) {
      return NextResponse.json(
        {
          error: "Tài khoản của bạn đã hết Credits. Vui lòng nạp thêm để tiếp tục quét danh thiếp!",
          code: "INSUFFICIENT_CREDITS",
          credits: user.credits,
        },
        { status: 403 }
      );
    }

    // Chuẩn hóa định dạng base64
    let cleanBase64 = imageBase64;
    let mimeType = "image/jpeg";

    if (imageBase64.startsWith("data:")) {
      const match = imageBase64.match(/^data:([^;]+);base64,/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      }
    }

    const imageBuffer = Buffer.from(cleanBase64, "base64");

    const systemPrompt = `Bạn là Chuyên gia AI OCR & Phân Tích Danh Thiếp (Business Card & Document Intelligence) hàng đầu.
Nhiệm vụ của bạn là soi đọc thật kỹ toàn bộ chữ, logo, icon, thông tin liên hệ và chi tiết trên tấm danh thiếp / card visit / tài liệu trong ảnh.

Hãy bóc tách thành một đối tượng JSON DUY NHẤT và CHÍNH XÁC TUYỆT ĐỐI với các trường:
{
  "fullName": "Họ và tên người liên hệ (viết hoa chuẩn)",
  "jobTitle": "Chức danh / Nghề nghiệp / Chức vụ",
  "company": "Tên công ty / Doanh nghiệp / Tổ chức",
  "phone": "Số điện thoại di động / hotline bàn (ngăn cách dấu chấm hoặc khoảng cách nếu có nhiều số)",
  "email": "Email liên hệ chính xác",
  "address": "Địa chỉ văn phòng / cửa hàng / chi nhánh",
  "website": "Trang web / đường dẫn web (ví dụ: www.abc.com)",
  "socials": "Mạng xã hội, Zalo, Facebook, LinkedIn, Telegram nếu có trên card",
  "notes": "Mô tả ngắn về ngành nghề, sản phẩm dịch vụ, khẩu hiệu slogan hoặc ghi chú nổi bật",
  "confidence": "high" | "medium" | "low"
}

QUY TẮC BẮT BUỘC:
1. Trả về đúng định dạng JSON thuần túy, không bao bọc bởi markdown \`\`\`json hay bất kỳ chữ nào khác.
2. Nếu trường nào không có trên ảnh, để chuỗi rỗng "". Tuyệt đối không bịa đặt thông tin.
3. Nhận diện chuẩn xác cả tiếng Việt có dấu và tiếng Anh.`;

    const model = googleAI("gemini-2.5-flash");

    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Hãy đọc ảnh danh thiếp này và trích xuất toàn bộ dữ liệu ra JSON theo định dạng chuẩn.",
            },
            {
              type: "image",
              image: imageBuffer,
              mimeType,
            },
          ],
        },
      ],
    });

    let rawOutput = result.text.trim();
    // Loại bỏ markdown code block nếu AI lỡ sinh ra
    rawOutput = rawOutput.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsedData: CardScanResult;
    try {
      parsedData = JSON.parse(rawOutput);
    } catch {
      // Fallback nếu JSON bị lỗi nhẹ
      parsedData = {
        fullName: "",
        jobTitle: "",
        company: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        socials: "",
        notes: rawOutput,
        confidence: "medium",
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Card scan error:", error);
    return NextResponse.json(
      { error: error?.message || "Đã xảy ra lỗi khi quét ảnh danh thiếp." },
      { status: 500 }
    );
  }
}
