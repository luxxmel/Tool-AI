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

    // 2. Tinh chỉnh và Nâng cấp Prompt bằng AI (Ưu tiên Gemini 3.7 Flash)
    let enhancedPrompt = prompt.trim();
    
    // Nếu chọn phong cách "realistic" (Chân thực / Nhiếp ảnh DSLR), tự động "độn" các từ khóa ép buộc nhiếp ảnh cực mạnh
    if (style === "realistic") {
      enhancedPrompt += ", raw photo, hyper-realistic portrait, authentic photograph, highly detailed skin texture, visible skin pores, fine details, natural soft lighting, shot on 85mm lens, DSLR, sharp focus, 8k uhd, unedited photograph";
    } else {
      const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS.realistic;
      enhancedPrompt += `, ${styleModifier}`;
    }

    const hasGoogleKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const GEMINI_IMAGE_BRAINS = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-flash-lite-latest"];

    if (hasGoogleKey) {
      try {
        if (referenceImage && typeof referenceImage === "string") {
          // Xử lý Image-to-Image qua Gemini 3.7 Flash Vision
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
                        text: `You are an elite photorealistic image prompt engineer specializing in human identity preservation and raw portrait photography.
Analyze this person's reference photo and the user's instruction: "${prompt}".

Create a highly detailed visual prompt in English that:
1. PRESERVES THE EXACT FACIAL IDENTITY: Describe the person's precise face shape, eye shape, eyebrows, nose bridge, lips, skin undertone, hairstyle, and hair color from the reference photo in vivid detail.
2. Fulfills the user's request (e.g. if user asks to transform, adapt style, or place in a scene).
3. Strictly specifies a REAL LIFE DSLR PHOTO: "authentic raw photograph of a real person, realistic skin texture with visible skin pores, natural ambient window lighting, shot on 35mm lens at f/1.8, 8k resolution, crisp focus, unedited authentic photo".
4. STRICTLY PROHIBITS 3D render, cartoon, anime, drawing, painting, smooth plastic skin filter, or digital illustration.

Return ONLY the final detailed English prompt without quotes or intro text.`,
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
          // Text-to-Image: Phân tích chủ thể chính xác qua Gemini 3.7 Flash
          let textPrompt = "";
          for (const modelId of GEMINI_IMAGE_BRAINS) {
            try {
              const aiPromptRes = await generateText({
                model: google(modelId),
                system: `You are an expert English translator and photorealistic image prompt engineer equivalent to Google Gemini Imagen 3.
CRITICAL INSTRUCTIONS:
1. Understand the user's intent clearly even if phrased as a question (e.g. "tạo 1 ảnh về loading bay nhà xưởng là gì" -> generate an industrial logistics warehouse loading bay with semi-trucks, container trailers, forklifts loading cargo, clear signage, daytime photo).
2. Create a rich, vivid, photorealistic scene description in English (around 35-50 words). Describe real-world architectural elements, vehicles, equipment, lighting, and environment.
3. Include high-quality photography terms: "high-resolution DSLR photography, realistic textures, natural daylight, authentic real-life scene, 8k crisp detail".
4. STRICTLY AVOID cartoon, 3D render, digital painting, or smooth plastic textures.
5. Return ONLY the final English prompt without any quotes or commentary.`,
                prompt: `User request: "${prompt}"`,
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
        enhancedPrompt = prompt.trim();
      }
    } else {
      enhancedPrompt = prompt.trim();
    }

    // Đảm bảo LUÔN LUÔN độn từ khóa DSLR nhiếp ảnh cực mạnh sau khi Gemini xử lý xong
    if (style === "realistic" && !enhancedPrompt.includes("raw photo")) {
      enhancedPrompt += ", raw photo, hyper-realistic portrait, highly detailed skin texture, skin pores, natural lighting, 8k uhd, unedited photograph, shot on 85mm lens, DSLR, sharp focus, authentic real life photo";
    }

    // 3. Tính toán kích thước theo tỷ lệ
    const dims = ASPECT_RATIO_DIMS[aspectRatio] || { width: 1024, height: 1024 };
    const seed = Math.floor(Math.random() * 9999999);

    // Nếu có ảnh tham chiếu (base64), lưu thành file ảnh thật để tạo public URL cho Pollinations Image-to-Image
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
        
        // Host protocol & domain
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        publicRefImageUrl = `${protocol}://${host}/uploads/${fileName}`;
      } catch (err) {
        console.warn("Lỗi lưu ảnh tham chiếu:", err);
      }
    }

    // Tạo URL thông qua proxy nội bộ
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
