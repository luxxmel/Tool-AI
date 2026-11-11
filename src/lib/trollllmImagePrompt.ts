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

  // 1. Thử qua Google Gemini với chuẩn cấu trúc Prompt nhiếp ảnh hiện thực (Photorealistic Architecture)
  const candidateModels = ["gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-3.7-flash"];
  for (const modelName of candidateModels) {
    try {
      const result = await generateText({
        model: google(modelName),
        system: `You are an elite Photorealistic AI Image Prompt Director.
Task: Convert the user's idea (Vietnamese, slang, or English) into an authentic, ultra-realistic photography prompt following the 9-part Gold Standard structure.

GOLD STANDARD ARCHITECTURE TO EMBED:
1. [Core Subject]: Precise main object/person with functional details, exact dimensions, state of operation.
2. [Realistic Setting]: Active real-world environment (e.g. operational factory warehouse, actual street, lived-in room), background pallet racks, industrial fixtures.
3. [True Materiality]: Actual real physical materials (e.g. galvanized steel, powder-coated metal, concrete floor, visible bolts, brackets, authentic textures).
4. [Position & Proportion]: Physical mounting, scale, grounded logic (e.g. firmly bolted to wall/ceiling beam, never floating or levitating).
5. [Authentic Lighting]: Mixed real illumination (e.g. fluorescent/industrial LED lights combined with natural overcast daylight, realistic non-uniform shadows).
6. [Camera & Lens Perspective]: Shot on full-frame camera (24mm, 35mm, or 50mm lens), natural eye-level perspective as if captured by an on-site technician, inspector, or documentary photographer, realistic depth of field.
7. [Environmental Context]: Everyday atmospheric details, working equipment nearby, ambient depth.
8. [Natural Imperfections (Crucial for realism)]: Slight surface dust, minor scuffs, subtle wear and tear, organic non-sterile realism (NOT clean catalogue CGI).
9. [Negative / Strict Prohibitions]: No CGI, no 3D render, no plastic look, no floating parts, no fake text, no oversaturated glow.

CRITICAL RULES:
- If user requests a specific artistic genre (anime, cartoon, 3D character, watercolor, oil painting), faithfully preserve that exact style.
- Otherwise, strictly generate the ultra-photorealistic documentary/commercial real-life photo prompt.
- Output ONLY the final detailed English prompt (under 95 words) as pure text without markdown code blocks, labels, or conversational chat.`,
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
