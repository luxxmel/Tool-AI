/**
 * Động cơ sinh ảnh chính thức qua Yescale Gemini Image Engine (Watermark-Free HD)
 * Model chính: nano-banana-pro / nano-banana-2
 * Endpoint: https://api.yescale.io/task/submit
 */

function getYescaleApiKey(): string {
  const envKey = process.env.YESCALE_API_KEY?.trim();
  if (envKey && envKey.startsWith("sk-") && envKey.length > 25 && !envKey.includes("YOUR_")) {
    return envKey;
  }
  return "sk-XL6kmXyBHh54vujU9d721R8D9H5SXMabnd2RB0vnxmBRlRrN";
}

const YESCALE_BASE_URL =
  process.env.YESCALE_BASE_URL || "https://api.yescale.io";

function getActiveModels(): string[] {
  const envModel = process.env.YESCALE_IMAGE_MODEL?.trim();
  // Ưu tiên nano-banana-2-lite (chỉ mất ~8-9 giây) và nano-banana-2 (~18s), loại trừ các model cũ chậm
  if (!envModel || envModel.includes("gemini-2.5-flash-image") || envModel === "nano-banana-pro") {
    return ["nano-banana-2-lite", "nano-banana-2", "nano-banana-pro"];
  }
  return [envModel, "nano-banana-2-lite", "nano-banana-2", "nano-banana-pro"];
}

interface YescaleGenerateParams {
  prompt: string;
  aspectRatio?: string;
  referenceImage?: string | null;
}

export async function generateImageViaYescale({
  prompt,
  aspectRatio = "1:1",
  referenceImage,
}: YescaleGenerateParams): Promise<string> {
  const apiKey = getYescaleApiKey();
  const modelsToTry = getActiveModels();

  for (const model of modelsToTry) {
    try {
      const submitUrl = `${YESCALE_BASE_URL}/task/submit`;
      const config: Record<string, any> = {
        aspect_ratio: aspectRatio || "1:1",
        size: "1K",
      };

      if (model === "nano-banana-pro") {
        config.google_search = false;
      }

      if (referenceImage && typeof referenceImage === "string") {
        config.images = [referenceImage];
      }

      const payload = {
        model,
        prompt: prompt.trim(),
        config,
      };

      console.log(`[Yescale AI Image] Gửi task sinh ảnh với model ${model}...`);
      const submitRes = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!submitRes.ok) {
        const errText = await submitRes.text();
        console.warn(`[Yescale AI Image] Model ${model} submit thất bại (${submitRes.status}):`, errText);
        continue;
      }

      const submitData = await submitRes.json();
      const taskId = submitData?.task_id;

      if (!taskId) {
        console.warn(`[Yescale AI Image] Model ${model} không trả về task_id:`, submitData);
        continue;
      }

      console.log(`[Yescale AI Image] Task ID: ${taskId} (${model}). Bắt đầu theo dõi...`);

      // Polling kết quả siêu tốc (kiểm tra mỗi 600ms, tối đa 35 lần ~ 21 giây)
      const pollUrl = `${YESCALE_BASE_URL}/task/${taskId}`;
      const maxRetries = 35;
      let modelSuccessUrl: string | null = null;

      for (let i = 0; i < maxRetries; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));

        try {
          const pollRes = await fetch(pollUrl, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(5000),
          });

          if (pollRes.ok) {
            const pollData = await pollRes.json();
            const status = pollData?.status;
            const progress = pollData?.progress || "0%";

            if (status === "SUCCESS") {
              const finalUrl = pollData?.task_result?.url;
              if (finalUrl) {
                console.log(`[Yescale AI Image] Sinh ảnh HD thành công 100% (No Watermark): ${finalUrl}`);
                return finalUrl;
              }
            }

            if (status === "FAILED" || status === "FAILURE") {
              console.warn(`[Yescale AI Image] Task ${taskId} báo thất bại (${pollData?.err_reason?.code || status}). Thử model kế tiếp...`);
              break;
            }

            if ((i + 1) % 4 === 0) {
              console.log(`[Yescale AI Image] Lần ${i + 1}/${maxRetries} - Trạng thái: ${status} (${progress})`);
            }
          }
        } catch (pollErr: any) {
          console.warn(`[Yescale AI Image] Kiểm tra lần ${i + 1} lỗi kết nối:`, pollErr?.message);
        }
      }

      if (modelSuccessUrl) {
        return modelSuccessUrl;
      }
    } catch (err: any) {
      console.warn(`[Yescale AI Image] Lỗi khi xử lý model ${model}:`, err?.message);
    }
  }

  console.warn("[Yescale AI Image] Tất cả model Yescale bận, tự động kích hoạt Clean Fallback Engine.");
  return generateCleanFallbackImage(prompt, aspectRatio);
}

/**
 * Động cơ sinh ảnh dự phòng siêu tốc SẠCH (KHÔNG LOGO / WATERMARK)
 */
function generateCleanFallbackImage(prompt: string, aspectRatio: string = "1:1"): string {
  let width = 1024;
  let height = 1024;
  if (aspectRatio === "16:9") {
    width = 1280;
    height = 720;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  }

  const encodedPrompt = encodeURIComponent(prompt.trim());
  const seed = Math.floor(Math.random() * 1000000);
  
  // Dùng tham số model=flux và nologo=true để ảnh đẹp và không logo
  const cleanUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
  
  console.log(`[Clean AI Engine] Sinh ảnh thành công qua Clean AI Engine: ${cleanUrl}`);
  return cleanUrl;
}
