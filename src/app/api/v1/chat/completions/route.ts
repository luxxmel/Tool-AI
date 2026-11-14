import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIModel } from "@/lib/aiProvider";
import { generateText, streamText } from "ai";

// Tỷ giá token: Mỗi 1,000 tokens sử dụng sẽ tiêu tốn 1 Credit (tương đương 600 VNĐ / 1,000 tokens)
// Nếu số dư < 1 Credit thì ngắt kết nối để chống quỵt phí / hack lạm dụng
const TOKENS_PER_CREDIT = 1000;

// Rate limiting in-memory: ip/key -> { count, timestamp }
const requestWindowMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(key: string, limitPerMinute: number): boolean {
  const now = Date.now();
  const window = requestWindowMap.get(key);

  if (!window || now > window.expiresAt) {
    requestWindowMap.set(key, { count: 1, expiresAt: now + 60000 });
    return true;
  }

  if (window.count >= limitPerMinute) {
    return false;
  }

  window.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực API Key qua Bearer Token
    const authHeader = req.headers.get("Authorization") || "";
    const apiKeyString = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!apiKeyString || !apiKeyString.startsWith("btk-")) {
      return NextResponse.json(
        {
          error: {
            message: "Khóa API không hợp lệ hoặc thiếu tiền tố 'btk-'. Vui lòng kiểm tra lại Header Authorization: Bearer <your-key>",
            type: "invalid_request_error",
            code: "invalid_api_key",
          },
        },
        { status: 401 }
      );
    }

    // 2. Tra cứu API Key và tài khoản User trong cơ sở dữ liệu
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKeyString },
      include: { user: true },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        {
          error: {
            message: "Không tìm thấy khóa API này trên hệ thống Biết Tuốt AI.",
            type: "authentication_error",
            code: "api_key_not_found",
          },
        },
        { status: 401 }
      );
    }

    if (apiKeyRecord.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error: {
            message: "Khóa API này đã bị vô hiệu hóa hoặc thu hồi.",
            type: "permission_error",
            code: "api_key_revoked",
          },
        },
        { status: 403 }
      );
    }

    const user = apiKeyRecord.user;
    if (user.status === "banned") {
      return NextResponse.json(
        {
          error: {
            message: "Tài khoản sở hữu khóa API này đã bị khóa do vi phạm chính sách.",
            type: "account_suspended",
            code: "account_banned",
          },
        },
        { status: 403 }
      );
    }

    // 3. Kiểm tra số dư Credits (Bảo vệ chống thấu chi/hack token)
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin && user.credits < 1) {
      return NextResponse.json(
        {
          error: {
            message: "Tài khoản của bạn đã hết Credits (Số dư hiện tại: 0🪙). Vui lòng nạp thêm Credits tại biettuot.io.vn để tiếp tục sử dụng API.",
            type: "insufficient_quota",
            code: "out_of_credits",
          },
        },
        { status: 402 }
      );
    }

    // 4. Rate Limiting theo hạn mức của key (VD: 60 - 120 req/phút)
    const isAllowed = checkRateLimit(apiKeyRecord.id, apiKeyRecord.rateLimit || 60);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: {
            message: `Bạn đã vượt quá giới hạn gọi API (${apiKeyRecord.rateLimit} requests/phút). Vui lòng gửi chậm lại!`,
            type: "rate_limit_error",
            code: "rate_limit_exceeded",
          },
        },
        { status: 429 }
      );
    }

    // 5. Đọc body request chuẩn OpenAI Format
    const body = await req.json();
    const { messages = [], stream = false, max_tokens = 2000, temperature = 0.7 } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            message: "Trường 'messages' phải là một mảng hội thoại hợp lệ.",
            type: "invalid_request_error",
            code: "missing_messages",
          },
        },
        { status: 400 }
      );
    }

    // Định dạng lại messages cho AI SDK
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }));

    // Thêm System Prompt thương hiệu Biết Tuốt AI
    const systemPrompt = "Bạn là Biết Tuốt AI - Nền tảng trí tuệ nhân tạo toàn năng do đội ngũ kỹ sư Việt Nam phát triển. Bạn trả lời chuẩn xác, thông minh, lịch sự và hữu ích.";

    const aiModel = getAIModel("fast");

    // 6. Xử lý phản hồi (Streaming hoặc Non-streaming)
    if (stream) {
      // Stream response chuẩn SSE
      const result = streamText({
        model: aiModel,
        system: systemPrompt,
        messages: formattedMessages,
        maxTokens: max_tokens,
        temperature: temperature,
        onFinish: async (event) => {
          // Tính toán token và trừ credits
          const promptTokens = event.usage?.promptTokens || Math.ceil(JSON.stringify(messages).length / 4);
          const completionTokens = event.usage?.completionTokens || Math.ceil(event.text.length / 4);
          const totalTokens = promptTokens + completionTokens;

          const creditsToDeduct = isAdmin ? 0 : Math.max(1, Math.ceil(totalTokens / TOKENS_PER_CREDIT));

          try {
            await prisma.$transaction([
              prisma.apiKey.update({
                where: { id: apiKeyRecord.id },
                data: {
                  tokensUsed: { increment: totalTokens },
                  creditsUsed: { increment: creditsToDeduct },
                  lastUsedAt: new Date(),
                },
              }),
              ...(creditsToDeduct > 0
                ? [
                    prisma.user.update({
                      where: { id: user.id },
                      data: { credits: { decrement: creditsToDeduct } },
                    }),
                  ]
                : []),
            ]);
          } catch (dbErr) {
            console.error("Lỗi cập nhật usage API Key:", dbErr);
          }
        },
      });

      return result.toDataStreamResponse();
    } else {
      // Non-streaming response chuẩn OpenAI Chat Completion Response Object
      const result = await generateText({
        model: aiModel,
        system: systemPrompt,
        messages: formattedMessages,
        maxTokens: max_tokens,
        temperature: temperature,
      });

      const promptTokens = result.usage?.promptTokens || Math.ceil(JSON.stringify(messages).length / 4);
      const completionTokens = result.usage?.completionTokens || Math.ceil(result.text.length / 4);
      const totalTokens = promptTokens + completionTokens;

      const creditsToDeduct = isAdmin ? 0 : Math.max(1, Math.ceil(totalTokens / TOKENS_PER_CREDIT));

      // Trừ credits và cập nhật số liệu
      try {
        await prisma.$transaction([
          prisma.apiKey.update({
            where: { id: apiKeyRecord.id },
            data: {
              tokensUsed: { increment: totalTokens },
              creditsUsed: { increment: creditsToDeduct },
              lastUsedAt: new Date(),
            },
          }),
          ...(creditsToDeduct > 0
            ? [
                prisma.user.update({
                  where: { id: user.id },
                  data: { credits: { decrement: creditsToDeduct } },
                }),
              ]
            : []),
        ]);
      } catch (dbErr) {
        console.error("Lỗi cập nhật usage API Key:", dbErr);
      }

      const responseId = `chatcmpl-${Date.now()}`;
      return NextResponse.json({
        id: responseId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "biettuot-omni",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: result.text,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
        },
        credits_deducted: creditsToDeduct,
        remaining_credits: isAdmin ? 999999 : Math.max(0, user.credits - creditsToDeduct),
      });
    }
  } catch (err: any) {
    console.error("API v1 Chat Completions Error:", err);
    return NextResponse.json(
      {
        error: {
          message: err?.message || "Đã xảy ra lỗi nội bộ máy chủ khi xử lý API.",
          type: "server_error",
          code: "internal_error",
        },
      },
      { status: 500 }
    );
  }
}
