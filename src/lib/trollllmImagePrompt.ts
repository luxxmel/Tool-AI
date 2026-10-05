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

  // BƯỚC 1: Gọi Claude Fable 5.1
  try {
    if (referenceImage && typeof referenceImage === "string" && referenceImage.startsWith("data:image")) {
      // Tách mime type và base64 data
      const match = referenceImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const mediaType = match[1];
        const base64Data = match[2];

        const fableRes = await fetch(ANTHROPIC_ENDPOINT, {
          method: "POST",
          headers: {
            "x-api-key": TROLLLLM_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-fable-5-1",
            max_tokens: 400,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `You are an elite AI image prompt engineer powered by Claude Fable 5.1.
Analyze the subject in the attached photo and the user's specific request: "${cleanUserPrompt}".
Selected aspect ratio: ${aspectRatio}.

CRITICAL MANDATORY RULES:
1. STRICT ADHERENCE: Strictly adhere to the user's actual request. If the user asks to place them in a workshop/factory ("nhà xưởng"), place them inside an authentic industrial factory/workshop.
2. NO UNWANTED CLOTHING: Do NOT force formal suits, tuxedos, or vests unless the user explicitly requested it. Dress the subject appropriately for the requested scene.
3. NO STUDIO PASSPORT BACKGROUNDS: Do NOT force passport photo or studio backdrops unless explicitly asked.
4. IDENTITY PRESERVATION: Preserve the person's gender, ethnicity, facial structure, and hair from the photo.
5. STYLE: Authentic real-life photograph, realistic documentary style, natural lighting, true skin texture.
6. Return ONLY the concise English image prompt (under 80 words). Do NOT add conversational text.`,
                  },
                  {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: mediaType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (fableRes.ok) {
          const fableData = await fableRes.json();
          const text = fableData?.content?.[0]?.text?.trim();
          if (text) fablePrompt = text;
        }
      }
    } else {
      // Text-to-Image qua OpenAI Chat Completions endpoint
      const fableRes = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TROLLLLM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-fable-5-1",
          messages: [
            {
              role: "system",
              content: `You are an elite AI image prompt engineer powered by Claude Fable 5.1.
Translate and craft an exceptional English image prompt strictly following the user's request.
Selected aspect ratio: ${aspectRatio}.

CRITICAL RULES:
1. STRICT ADHERENCE: Follow the user's intent 100%. Do NOT invent unwanted objects or unrelated backgrounds.
2. REALISM: Authentic photographic quality, natural human skin texture with pores, realistic lighting, aspect ratio ${aspectRatio}.
3. NO WAX/DOLL/ANIME: Strictly photorealistic unless anime/illustration is explicitly demanded.
4. Return ONLY the English prompt (under 75 words) without preamble or quotes.`,
            },
            {
              role: "user",
              content: `User request: "${cleanUserPrompt}". Aspect ratio: ${aspectRatio}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (fableRes.ok) {
        const fableData = await fableRes.json();
        const text = fableData?.choices?.[0]?.message?.content?.trim();
        if (text) fablePrompt = text;
      }
    }
  } catch (err) {
    console.warn("[TrollLLM] Lỗi khi tạo prompt bằng Claude Fable 5.1:", err);
  }

  // BƯỚC 2: Gọi Gemini 3.8 Flash để tối ưu hóa, đảm bảo bám sát prompt đã tạo
  let finalPrompt = fablePrompt;
  try {
    const geminiRes = await fetch(OPENAI_ENDPOINT, {
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
            content: `You are Gemini 3.8 Flash, an elite visual director and photographic realism master.
Review the image prompt created by Claude Fable 5.1 and refine it to ensure supreme photorealism while strictly honoring the exact subject, action, environment, and aspect ratio (${aspectRatio}).

RULES:
1. FAITHFULNESS: Do NOT alter the user's core scene, clothing, or environment.
2. PHOTOGRAPHIC FIDELITY: Specify realistic camera optics (e.g. 35mm/50mm lens), natural depth of field, authentic ambient illumination, and genuine unretouched human skin texture with visible micro-pores.
3. NEGATIVE AVOIDANCE: Ensure zero plastic/wax/doll sheen and zero artificial smoothing.
4. Output ONLY the refined English prompt without markdown or quotes.`,
          },
          {
            role: "user",
            content: `Refine this prompt for aspect ratio ${aspectRatio}:\n"${fablePrompt}"`,
          },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (geminiRes.ok) {
      const geminiData = await geminiRes.json();
      const text = geminiData?.choices?.[0]?.message?.content?.trim();
      if (text) {
        finalPrompt = text.replace(/^["'`]|["'`]$/g, "").trim();
      }
    }
  } catch (err) {
    console.warn("[TrollLLM] Lỗi khi tối ưu prompt bằng Gemini 3.8 Flash:", err);
  }

  return {
    fablePrompt,
    finalPrompt,
  };
}
