/**
 * Module tạo và tối ưu hóa Prompt cho AI Image Studio
 * - Bước 1: Claude Fable 5.1 (claude-fable-5-1) phân tích yêu cầu + ảnh gốc + tỉ lệ khung hình (Aspect Ratio)
 * - Bước 2: Gemini 3.8 Flash (gemini-3-8-flash) tối ưu hóa chiều sâu nhiếp ảnh, chi tiết da thật và ánh sáng
 */

function getTrollllmApiKey(): string {
  const envKey = process.env.TROLLLLM_API_KEY?.replace(/["']/g, "")?.trim();
  if (envKey && envKey.startsWith("sk-") && envKey.length > 25 && !envKey.includes("YOUR_")) {
    return envKey;
  }
  return "sk-trollllm-b28bae23ee1d9bc12cbcaada91d7ec306d0a91fab5fc2ba3f04f110380b83301";
}

const OPENAI_ENDPOINT = "https://chat.trollllm.xyz/v1/chat/completions";

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
  let fablePrompt = cleanUserPrompt;
  const apiKey = getTrollllmApiKey();

  // Sử dụng DeepSeek v4 Flash siêu tốc (2-3s) và hiểu tiếng Việt cực kỳ chuẩn xác
  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: `You are an elite AI image prompt director and translator.
Task: Convert the user's request (including Vietnamese, slang, names, actions, artistic styles) into an English prompt that STRICTLY follows what the user wants.
Selected Aspect Ratio: ${aspectRatio}.

CRITICAL INSTRUCTIONS:
1. STRICT USER INTENT FIDELITY (TOP PRIORITY):
   - Exactly follow the user's requested subject, actions, setting, mood, and interactions.
   - Respect the user's desired style: If the user asks for anime, 3D render, cartoon, cyberpunk, fantasy, painting, sketch, or photography, KEEP THAT EXACT STYLE.
   - If no specific style is requested, make it a natural, vivid, high-detail, visually stunning realistic representation.
2. PRESERVE EVERY REQUESTED DETAIL:
   - Specific colors, outfits, emotions, characters, objects, and compositions requested by the user MUST be preserved.
3. CONCISE & PURE:
   - Output ONLY the final English prompt under 60 words. No chat, no explanations, no quotes.`,
          },
          {
            role: "user",
            content: cleanUserPrompt,
          },
        ],
      }),
      signal: AbortSignal.timeout(6500),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) {
        fablePrompt = text.replace(/^["'`]|["'`]$/g, "").trim();
      }
    }
  } catch (err) {
    console.warn("[TrollLLM] Cảnh báo tối ưu prompt DeepSeek, giữ prompt gốc:", err);
  }

  return {
    fablePrompt,
    finalPrompt: fablePrompt,
  };
}
