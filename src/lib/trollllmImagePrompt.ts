/**
 * Module tạo và tối ưu hóa Prompt cho AI Image Studio
 * - Bước 1: Claude Fable 5.1 (claude-fable-5-1) phân tích yêu cầu + ảnh gốc + tỉ lệ khung hình (Aspect Ratio)
 * - Bước 2: Gemini 3.8 Flash (gemini-3-8-flash) tối ưu hóa chiều sâu nhiếp ảnh, chi tiết da thật và ánh sáng
 */

const TROLLLLM_API_KEY =
  process.env.TROLLLLM_API_KEY ||
  "sk-trollllm-b28bae23ee1d9bc12cbcaada91d7ec306d0a91fab5fc2ba3f04f110380b83301";

const ANTHROPIC_ENDPOINT = "https://chat.trollllm.xyz/v1/messages";
const OPENAI_ENDPOINT = "https://chat.trollllm.xyz/v1/chat/completions";

interface GeneratePromptParams {
  prompt: string;
  aspectRatio?: string;
  referenceImage?: string | null;
}

export async function generateOptimizedPromptWithFableAndGemini({
  prompt,
  aspectRatio = "1:1",
  referenceImage,
}: GeneratePromptParams): Promise<{
  fablePrompt: string;
  finalPrompt: string;
}> {
  const cleanUserPrompt = prompt.trim();
  let fablePrompt = cleanUserPrompt;

  // Sử dụng Gemini 3.8 Flash hoặc DeepSeek v4 Flash để dịch và tối ưu prompt sang tiếng Anh chuẩn điện ảnh
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TROLLLLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3-8-flash",
        messages: [
          {
            role: "system",
            content: `You are an elite AI image prompt specialist.
Task: Translate and enhance the user's Vietnamese request into an ultra-high-definition, photorealistic English prompt for image generation.
Selected Aspect Ratio: ${aspectRatio}.

CRITICAL RULES:
1. STRICT ADHERENCE: Faithfully capture every element of the user's request (e.g. if warehouse/xe nâng/pallet, depict an authentic warehouse with active forklifts and cargo pallets). NEVER change the core theme.
2. PHOTOREALISM: Specify true photographic detail, authentic lighting, accurate materials, and natural depth of field.
3. CONCISENESS: Return ONLY the final English prompt (under 60 words). No commentary, no preamble, no markdown formatting.`,
          },
          {
            role: "user",
            content: `User prompt: "${cleanUserPrompt}". Aspect ratio: ${aspectRatio}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) {
        fablePrompt = text.replace(/^["'`]|["'`]$/g, "").trim();
      }
    } else {
      // Fallback nhanh sang deepseek-v4-flash nếu gemini bận
      const dsRes = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TROLLLLM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            {
              role: "system",
              content: "Translate user's image prompt into high-quality descriptive English. Output ONLY the English prompt under 50 words.",
            },
            {
              role: "user",
              content: cleanUserPrompt,
            },
          ],
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (dsRes.ok) {
        const dsData = await dsRes.json();
        const dsText = dsData?.choices?.[0]?.message?.content?.trim();
        if (dsText) fablePrompt = dsText.replace(/^["'`]|["'`]$/g, "").trim();
      }
    }
  } catch (err) {
    console.warn("[TrollLLM] Cảnh báo tối ưu prompt, giữ prompt gốc:", err);
  }

  return {
    fablePrompt,
    finalPrompt: fablePrompt,
  };
}
