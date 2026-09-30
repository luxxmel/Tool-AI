import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { ensureUser } from "@/lib/ensureUser";

// Các phong cách tập trung vào ánh sáng, chất liệu, màu sắc và độ sắc nét
// TUYỆT ĐỐI không ép bối cảnh (như ép thành phố khi người dùng chỉ muốn avatar/mèo/hoa/nhà xưởng...)
const STYLE_PROMPTS: Record<string, string> = {
  realistic: "high-resolution photo, realistic lighting, clear details, natural colors, crisp focus, 8k professional photograph",
  cyberpunk: "cyberpunk aesthetic, glowing vibrant cyan and neon magenta rim lighting, high-tech accents, futuristic atmosphere, 8k resolution, sharp focus, cinematic lighting",
  anime: "masterpiece anime artwork style, expressive detailed eyes, crisp line art, Makoto Shinkai vibrant aesthetic, soft ambient lighting, 8k resolution, award-winning illustration",
  cinematic: "3D cinematic film photograph, dramatic studio portrait lighting, Octane render, beautiful depth of field, hyper-realistic textures, 8k masterpiece",
  oil: "classical fine art oil painting, expressive impasto brushstrokes, rich canvas texture, Rembrandt chiaroscuro lighting, timeless masterpiece",
  fantasy: "mythical high fantasy digital art, ethereal magical luminescence, celestial particles, enchanting atmosphere, vibrant colors, 8k detailed concept art",
};

const ASPECT_RATIO_DIMS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style = "realistic", aspectRatio = "1:1", referenceImage } = body;
    const userId = body.userId;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập mô tả hình ảnh (prompt)" }, { status: 400 });
    }

    // 1. Kiểm tra User & Trừ 1 Credit
    let user = await ensureUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bắt đầu tạo hình ảnh", needLogin: true },
        { status: 401 }
      );
    }

    const isAdmin = user?.role === "ADMIN";

    // Nếu không phải admin và hết credit
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

    // 2. Tinh chỉnh và Nâng cấp Prompt bằng AI
    // Mục tiêu tối thượng: Trung thành 100% với chủ thể người dùng yêu cầu, không tự ý biến tấu thành nghệ thuật kỳ lạ!
    let enhancedPrompt = prompt.trim();
    const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS.realistic;

    const hasGoogleKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const GEMINI_IMAGE_BRAINS = ["gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-3.7-flash"];

    if (hasGoogleKey) {
      try {
        if (referenceImage && typeof referenceImage === "string") {
          // Xử lý Image-to-Image qua Gemini Vision
          let visionText = "";
          for (const modelId of GEMINI_IMAGE_BRAINS) {
            try {
              const visionRes = await generateText({
                model: google(modelId),
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `You are an expert AI prompt engineer.
Analyze this reference image and the user's instruction: "${prompt}".
Artistic style requirements: "${styleModifier}".

Create a precise visual prompt in English that:
1. Translates the user's exact instruction accurately.
2. Preserves the main subject, structure, or content from the reference image.
3. Applies only the requested style parameters (${styleModifier}).
4. Keep it concise (under 50 words). Do NOT add random sci-fi, fantasy, or artistic elements unless requested.
Return ONLY the final prompt without quotes or intro text.`,
                      },
                      {
                        type: "image",
                        image: referenceImage,
                      },
                    ],
                  },
                ],
              });
              if (visionRes?.text?.trim()) {
                visionText = visionRes.text.trim();
                break;
              }
            } catch (err) {
              console.warn(`Gemini Vision [${modelId}] error:`, err);
            }
          }

          if (visionText) {
            enhancedPrompt = visionText;
          }
        } else {
          // Text-to-Image: Phân tích chủ thể chính xác
          let textPrompt = "";
          for (const modelId of GEMINI_IMAGE_BRAINS) {
            try {
              const aiPromptRes = await generateText({
                model: google(modelId),
                system: `You are an accurate English translator and image prompt generator.
CRITICAL INSTRUCTIONS:
1. Translate the user's Vietnamese request into clear, accurate English describing EXACTLY what they asked for.
2. Example: If the user says "tạo cho t 1 tấm hình về loading bay nhà xưởng", the prompt MUST describe a "factory loading bay, industrial warehouse loading dock, trucks and cargo bay".
3. Do NOT add cyberpunk, neon, anime, or fantasy themes UNLESS the user explicitly selected or asked for it.
4. Append style details: ${styleModifier}.
5. Keep prompt concise and under 40 words.
6. Return ONLY the final English prompt without any extra quotes or commentary.`,
                prompt: `User request: "${prompt}"\nStyle: "${styleModifier}"`,
              });
              if (aiPromptRes?.text?.trim()) {
                textPrompt = aiPromptRes.text.trim();
                break;
              }
            } catch (err) {
              console.warn(`AI Text [${modelId}] error:`, err);
            }
          }

          if (textPrompt) {
            enhancedPrompt = textPrompt;
          }
        }
      } catch (geminiError) {
        console.warn("Lỗi AI nâng cấp prompt:", geminiError);
        enhancedPrompt = `${prompt.trim()}, ${styleModifier}`;
      }
    } else {
      enhancedPrompt = `${prompt.trim()}, ${styleModifier}`;
    }

    // 3. Tính toán kích thước theo tỷ lệ
    const dims = ASPECT_RATIO_DIMS[aspectRatio] || { width: 1024, height: 1024 };
    const seed = Math.floor(Math.random() * 9999999);

    // 4. Tạo URL thông qua proxy nội bộ
    const imageUrl = `/api/images/proxy?prompt=${encodeURIComponent(
      enhancedPrompt
    )}&width=${dims.width}&height=${dims.height}&seed=${seed}`;

    return NextResponse.json({
      id: `img-${Date.now()}`,
      url: imageUrl,
      prompt: prompt.trim(),
      enhancedPrompt,
      style,
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
