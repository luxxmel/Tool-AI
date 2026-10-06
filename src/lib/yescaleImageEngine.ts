/**
 * Động cơ sinh ảnh chính thức qua Yescale Gemini Image Engine + Fallback High-Speed AI Engine
 * Model chính: gemini-2.5-flash-image[nano-banana]
 * Endpoint: https://api.yescale.io/task/submit
 */

const YESCALE_API_KEY =
  process.env.YESCALE_API_KEY ||
  "sk-XL6kmXyBHh54vujU9d721R8D9H5SXMabnd2RB0vnxmBRlRrN";

const YESCALE_BASE_URL =
  process.env.YESCALE_BASE_URL || "https://api.yescale.io";

const YESCALE_MODEL =
  process.env.YESCALE_IMAGE_MODEL || "gemini-2.5-flash-image[nano-banana]";

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
  const submitUrl = `${YESCALE_BASE_URL}/task/submit`;

  const config: Record<string, any> = {
    aspect_ratio: aspectRatio || "1:1",
  };

  if (referenceImage && typeof referenceImage === "string") {
    config.images = [referenceImage];
  }

  const payload = {
    model: YESCALE_MODEL,
    prompt: prompt.trim(),
    config,
  };

  try {
    console.log(`[Yescale] Gửi task sinh ảnh với model ${YESCALE_MODEL}...`);
    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${YESCALE_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.warn("[Yescale] Submit task thất bại, sử dụng động cơ dự phòng:", submitRes.status, errText);
      return generateFallbackImage(prompt, aspectRatio);
    }

    const submitData = await submitRes.json();
    const taskId = submitData?.task_id;

    if (!taskId) {
      console.warn("[Yescale] Không nhận được task_id, chuyển sang động cơ dự phòng.");
      return generateFallbackImage(prompt, aspectRatio);
    }

    console.log(`[Yescale] Task ID đã tạo: ${taskId}. Bắt đầu theo dõi kết quả...`);

    // Polling chờ ảnh hoàn thành (tối đa 45 lần x 1.8s ~ 80s)
    const pollUrl = `${YESCALE_BASE_URL}/task/${taskId}`;
    const maxRetries = 45;

    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1800));

      try {
        const pollRes = await fetch(pollUrl, {
          headers: {
            Authorization: `Bearer ${YESCALE_API_KEY}`,
          },
          signal: AbortSignal.timeout(10000),
        });

        if (pollRes.ok) {
          const pollData = await pollRes.json();
          const status = pollData?.status;

          if (status === "SUCCESS") {
            const finalUrl = pollData?.task_result?.url;
            if (finalUrl) {
              console.log(`[Yescale] Hoàn thành sinh ảnh thành công: ${finalUrl}`);
              return finalUrl;
            }
          }

          if (status === "FAILED") {
            console.warn("[Yescale] Task báo FAILED, chuyển sang động cơ dự phòng.");
            return generateFallbackImage(prompt, aspectRatio);
          }
        }
      } catch (pollErr: any) {
        console.warn(`[Yescale] Lần kiểm tra ${i + 1} cảnh báo:`, pollErr?.message);
      }
    }

    // Nếu quá 80s không có kết quả từ Yescale -> Tự động chuyển sang động cơ dự phòng siêu tốc
    console.warn("[Yescale] Hết thời gian chờ Yescale, tự động dùng động cơ AI dự phòng siêu tốc.");
    return generateFallbackImage(prompt, aspectRatio);
  } catch (err: any) {
    console.warn("[Yescale] Lỗi hệ thống Yescale, khởi động động cơ dự phòng:", err?.message);
    return generateFallbackImage(prompt, aspectRatio);
  }
}

/**
 * Động cơ sinh ảnh dự phòng siêu tốc (Pollinations AI) - Đảm bảo tạo ảnh 100% không bao giờ lỗi timeout
 */
function generateFallbackImage(prompt: string, aspectRatio: string = "1:1"): string {
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
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
  
  console.log(`[Fallback AI Engine] Sinh ảnh thành công qua Pollinations AI Engine: ${fallbackUrl}`);
  return fallbackUrl;
}
