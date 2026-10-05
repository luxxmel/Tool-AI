import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { ensureUser } from "@/lib/ensureUser";
import { generateOptimizedPromptWithFableAndGemini } from "@/lib/trollllmImagePrompt";
import sharp from "sharp";

const ASPECT_RATIO_DIMS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, aspectRatio = "1:1", referenceImage } = body;
    const userId = body.userId;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập mô tả hình ảnh (prompt)" }, { status: 400 });
    }

    // 1. Kiểm tra User & Credit
    let user = await ensureUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bắt đầu tạo hình ảnh", needLogin: true },
        { status: 401 }
      );
    }

    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin && user.credits <= 0) {
      return NextResponse.json(
        {
          error: "Tài khoản của bạn đã hết credits. Vui lòng nạp thêm để tiếp tục tạo ảnh!",
          code: "INSUFFICIENT_CREDITS",
          credits: 0,
        },
        { status: 403 }
      );
    }

    let updatedCredits = 999999;
    if (user) {
      if (isAdmin) {
        updatedCredits = 999999;
      } else {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        });
        updatedCredits = updated.credits;
      }
    }

    // 2. Tạo & Tối ưu hóa prompt với Claude Fable 5.1 và Gemini 3.8 Flash (TrollLLM)
    let enhancedPrompt = prompt.trim();
    try {
      const promptResult = await generateOptimizedPromptWithFableAndGemini({
        prompt: prompt.trim(),
        aspectRatio,
        referenceImage: referenceImage || null,
      });
      if (promptResult?.finalPrompt?.trim()) {
        enhancedPrompt = promptResult.finalPrompt.trim();
      }
    } catch (promptErr) {
      console.warn("Lỗi khi tối ưu prompt:", promptErr);
      enhancedPrompt = prompt.trim();
    }

    // 3. Tính toán kích thước
    const dims = ASPECT_RATIO_DIMS[aspectRatio] || { width: 1024, height: 1024 };
    const seed = Math.floor(Math.random() * 9999999);



    // 4. Nếu không phải ghép vest trực tiếp, chạy qua Image Proxy thế hệ mới
    let publicRefImageUrl = "";
    if (referenceImage && typeof referenceImage === "string" && referenceImage.startsWith("data:image")) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const base64Data = referenceImage.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `ref-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        publicRefImageUrl = `${protocol}://${host}/uploads/${fileName}`;
      } catch (err) {
        console.warn("Lỗi lưu ảnh tham chiếu:", err);
      }
    }

    let imageUrl = `/api/images/proxy?prompt=${encodeURIComponent(
      enhancedPrompt
    )}&width=${dims.width}&height=${dims.height}&seed=${seed}`;

    if (publicRefImageUrl) {
      imageUrl += `&image=${encodeURIComponent(publicRefImageUrl)}`;
    }

    return NextResponse.json({
      id: `img-${Date.now()}`,
      url: imageUrl,
      prompt: prompt.trim(),
      enhancedPrompt,
      aspectRatio,
      referenceImage: referenceImage || null,
      createdAt: "Vừa xong",
      remainingCredits: updatedCredits,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo ảnh AI:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể tạo ảnh, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
