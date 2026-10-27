import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Module tạo và tối ưu hóa Prompt cho AI Image Studio
 * - Sử dụng Gemini 2.5 Flash / Flash Lite làm đạo diễn prompt dịch tiếng Việt siêu chuẩn sang tiếng Anh nhiếp ảnh
 * - Giữ nguyên 100% ý định, phong cách, chủ thể của người dùng
 */

interface GeneratePromptParams {
  prompt: string;
  aspectRatio?: string;
  referenceImage?: string | null;
}

export async function generateOptimizedPromptWithFableAndGemini({
  prompt,
  aspectRatio = "1:1",
}: GeneratePromptParams): Promise<{
  fablePrompt: string;
  finalPrompt: string;
}> {
  const cleanUserPrompt = prompt.trim();
  let optimizedPrompt = cleanUserPrompt;

  // 1. Thử qua Google Gemini 2.5 Flash / Flash Lite (Cực nhanh ~1s, chất lượng dịch chuẩn xác nhất)
  const candidateModels = ["gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-3.7-flash"];
  for (const modelName of candidateModels) {
    try {
      const result = await generateText({
        model: google(modelName),
        system: `You are an elite AI image prompt director and translator.
Task: Convert the user's request (which may be in Vietnamese, slang, shorthand, or English) into an accurate, rich, photorealistic or stylistically matching English prompt for image generation.
Selected Aspect Ratio: ${aspectRatio}.

CRITICAL RULES:
1. STRICT USER INTENT FIDELITY (HIGHEST PRIORITY):
   - Accurately translate and represent the user's core subject (e.g., if user asks for "đèn diệt côn trùng nhà xưởng", the output MUST be an industrial UV insect killer lamp in a factory warehouse, NOT a vehicle or random machine).
   - If user asks for a specific art style (anime, 3D render, cartoon, cyberpunk, sketch, watercolor, photography), PRESERVE THAT EXACT STYLE.
   - If no specific style is requested, make it a natural, vivid, highly detailed, realistic photograph with authentic lighting.
2. PRESERVE ALL DETAILS:
   - Specific colors, settings, objects, moods, and actions requested by the user must be retained.
3. CONCISE & PURE:
   - Output ONLY the final English prompt under 60 words. No chat, no quotes, no explanations.`,
        prompt: cleanUserPrompt,
      });

      if (result?.text?.trim()) {
        const text = result.text.replace(/^["'`]|["'`]$/g, "").trim();
        if (text && text.length > 5) {
          optimizedPrompt = text;
          return {
            fablePrompt: optimizedPrompt,
            finalPrompt: optimizedPrompt,
          };
        }
      }
    } catch (err: any) {
      console.warn(`[Image Prompt Gemini] Model ${modelName} cảnh báo:`, err?.message);
    }
  }

  // 2. Fallback cơ bản nếu API AI tạm thời bận
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(cleanUserPrompt)) {
    // Nếu vẫn là tiếng Việt thô, cố gắng dọn dẹp các từ khóa lệnh vẽ
    const cleanIdea = cleanUserPrompt
      .replace(/^(?:hãy\s+|vui lòng\s+|nhờ bạn\s+|giúp mình\s+|tạo cho t\s+|tạo cho tôi\s+|tạo cho mình\s+)?(?:1 ảnh về|ảnh về|hình ảnh về|vẽ|tạo hình|tạo ảnh|thiết kế ảnh|vẽ tranh)\s+/i, "")
      .trim();
    optimizedPrompt = `High quality, ultra detailed realistic photo of ${cleanIdea}, photorealistic, 8k, cinematic lighting`;
  }

  return {
    fablePrompt: optimizedPrompt,
    finalPrompt: optimizedPrompt,
  };
}
