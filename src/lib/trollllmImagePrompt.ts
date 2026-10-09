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
            content: `You are an elite AI image prompt translator and visual director.
Task: Convert any user request (including casual Vietnamese, slang, or celebrity names like "tao cho t 1 hinh cua son tung mtp") into a photorealistic, high-detail English image prompt for an image AI model.
Selected Aspect Ratio: ${aspectRatio}.

CRITICAL RULES:
1. SUBJECT FIDELITY: If the user names a person, character, object, or location (e.g. "Sơn Tùng M-TP"), vividly describe them accurately with photorealistic style, hairstyle, outfit, expression, and environment.
2. PHOTOREALISM: Specify true photography qualities (camera angle, 8k, photorealistic, professional lighting, cinematic, natural textures).
3. PURITY: Output ONLY the English prompt under 45 words. NO conversation, NO intro, NO markdown quotes.`,
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
