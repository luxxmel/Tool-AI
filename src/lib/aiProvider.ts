import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

// TrollLLM Client (OpenAI-compatible)
export const trollLLMClient = process.env.TROLLLLM_API_KEY
  ? createOpenAI({
      baseURL: process.env.TROLLLLM_BASE_URL || "https://chat.trollllm.xyz/v1",
      apiKey: process.env.TROLLLLM_API_KEY,
    })
  : null;

export interface BrainMode {
  id: "fast" | "deep" | "creative";
  label: string;
  icon: string;
  modelCode: string;
  badge: string;
  description: string;
  provider: string;
}

// 3 Bộ não AI được cấu hình riêng biệt: Nhanh (Fast) - Sâu (Deep) - Sáng tạo (Creative)
export const BRAIN_MODES: BrainMode[] = [
  {
    id: "fast",
    label: "Suy nghĩ nhanh",
    icon: "⚡",
    modelCode: "Omni-Fast",
    badge: "Siêu tốc",
    description: "Phản hồi chớp nhoáng, tối ưu token, bền bỉ và cực kỳ ổn định cho câu hỏi hàng ngày.",
    provider: "OmniAI",
  },
  {
    id: "deep",
    label: "Suy luận sâu",
    icon: "🧠",
    modelCode: "Omni-Deep",
    badge: "VIP",
    description: "Tư duy logic đa tầng, giải quyết bài toán phức tạp, lập trình và phân tích chuyên sâu.",
    provider: "OmniAI",
  },
  {
    id: "creative",
    label: "Sáng tạo",
    icon: "🎨",
    modelCode: "Omni-Creative",
    badge: "Nghệ thuật",
    description: "Văn phong giàu cảm xúc, sáng tác thơ văn, truyện và kịch bản nghệ thuật.",
    provider: "OmniAI",
  },
];

export const AVAILABLE_MODELS = BRAIN_MODES.map((b) => ({
  id: b.id,
  name: b.label,
  provider: b.provider as any,
  icon: b.icon,
  description: b.description,
  badge: b.badge,
}));

export type AvailableModel = typeof AVAILABLE_MODELS[number];

/**
 * Trả về instance model tương ứng dựa trên bộ não hoặc model ID
 */
export function getAIModel(modelOrBrainId?: string) {
  const normalizedId = (modelOrBrainId || "fast").toLowerCase().trim();

  // 1. BỘ NÃO SUY NGHĨ NHANH: Gemini 2.5 Flash - Phản hồi siêu tốc (~1s), thông minh và chính xác tuyệt đối
  if (
    normalizedId === "fast" ||
    normalizedId === "gpt-5.5" ||
    normalizedId === "gpt" ||
    normalizedId.includes("nhanh")
  ) {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        model: google("gemini-2.5-flash"),
        modelId: "gemini-2.5-flash",
        modeId: "fast",
        name: "Suy nghĩ nhanh",
      };
    }
    if (trollLLMClient) {
      return {
        model: trollLLMClient("gpt-5.5"),
        modelId: "gpt-5.5",
        modeId: "fast",
        name: "Suy nghĩ nhanh",
      };
    }
  }

  // 2. BỘ NÃO SUY LUẬN SÂU: Gemini 3.7 Flash / 3.5 Flash - Tư duy đỉnh cao & độ chính xác tri thức tuyệt đối
  if (
    normalizedId === "deep" ||
    normalizedId === "claude-sonnet-4.5" ||
    normalizedId === "claude-sonnet-4-5" ||
    normalizedId === "claude-fable-5.1" ||
    normalizedId.includes("fable") ||
    normalizedId.includes("claude") ||
    normalizedId.includes("sau")
  ) {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        model: google("gemini-3.7-flash"),
        modelId: "gemini-3.7-flash",
        modeId: "deep",
        name: "Suy luận sâu",
      };
    }
    if (trollLLMClient) {
      return {
        model: trollLLMClient("gemini-3-7-flash"),
        modelId: "gemini-3-7-flash",
        modeId: "deep",
        modeName: "Suy luận sâu",
        name: "Suy luận sâu",
      };
    }
  }

  // 3. BỘ NÃO SÁNG TẠO: Gemini 2.5 Flash văn phong nghệ thuật, phong phú
  if (
    normalizedId === "creative" ||
    normalizedId === "gemini-2.5-flash" ||
    normalizedId.includes("sangtao") ||
    normalizedId.includes("creative") ||
    normalizedId.includes("gemini")
  ) {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        model: google("gemini-2.5-flash"),
        modelId: "gemini-2.5-flash",
        modeId: "creative",
        name: "Sáng tạo",
      };
    }
  }

  // 4. Default Fallbacks
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      model: google("gemini-2.5-flash"),
      modelId: "gemini-2.5-flash",
      modeId: "fast",
      name: "Suy nghĩ nhanh",
    };
  }

  if (trollLLMClient) {
    return {
      model: trollLLMClient("gpt-5.5"),
      modelId: "gpt-5.5",
      modeId: "fast",
      name: "Suy nghĩ nhanh",
    };
  }

  return null;
}
