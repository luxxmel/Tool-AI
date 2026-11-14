import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/models - Trả về danh sách mô hình tương thích OpenAI SDK
export async function GET(req: NextRequest) {
  const models = [
    {
      id: "biettuot-omni",
      object: "model",
      created: 1700000000,
      owned_by: "biettuot-ai",
      permission: [],
      root: "biettuot-omni",
      parent: null,
      description: "Biết Tuốt Omni Toàn Năng (Thông minh, hỗ trợ văn bản & phân tích đa ngành)",
    },
    {
      id: "biettuot-fast",
      object: "model",
      created: 1700000000,
      owned_by: "biettuot-ai",
      permission: [],
      root: "biettuot-fast",
      parent: null,
      description: "Biết Tuốt Tốc Độ Cao (Phản hồi siêu tốc, tiết kiệm token)",
    },
    {
      id: "biettuot-code",
      object: "model",
      created: 1700000000,
      owned_by: "biettuot-ai",
      permission: [],
      root: "biettuot-code",
      parent: null,
      description: "Biết Tuốt Lập Trình & Giải Toán (Chuyên giải thuật, debug, toán học)",
    },
  ];

  return NextResponse.json({
    object: "list",
    data: models,
  });
}
