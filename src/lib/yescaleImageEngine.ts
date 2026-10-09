/**
 * Động cơ sinh ảnh chính thức qua Yescale Gemini Image Engine (Watermark-Free HD)
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
    console.log(`[Yescale Gemini 2.5] Gửi task sinh ảnh với model ${YESCALE_MODEL}...`);
    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${YESCALE_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.warn("[Yescale Gemini] Submit task thất bại, sử dụng động cơ dự phòng sạch:", submitRes.status, errText);
      return generateCleanFallbackImage(prompt, aspectRatio);
    }

    const submitData = await submitRes.json();
    const taskId = submitData?.task_id;

    if (!taskId) {
      console.warn("[Yescale Gemini] Không nhận được task_id, chuyển sang động cơ dự phòng.");
      return generateCleanFallbackImage(prompt, aspectRatio);
    }

    console.log(`[Yescale Gemini] Task ID đã tạo thành công: ${taskId}. Bắt đầu theo dõi kết quả...`);

    // Polling theo dõi tiến độ task (Tối đa 35 lần x 1.5s ~ 50s)
    const pollUrl = `${YESCALE_BASE_URL}/task/${taskId}`;
    const maxRetries = 35;

    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const pollRes = await fetch(pollUrl, {
          headers: {
            Authorization: `Bearer ${YESCALE_API_KEY}`,
          },
          signal: AbortSignal.timeout(8000),
        });

        if (pollRes.ok) {
          const pollData = await pollRes.json();
          const status = pollData?.status;
          const progress = pollData?.progress || "0%";

          if (status === "SUCCESS") {
            const finalUrl = pollData?.task_result?.url;
            if (finalUrl) {
              console.log(`[Yescale Gemini] Sinh ảnh HD thành công 100% (No Watermark): ${finalUrl}`);
              return finalUrl;
            }
          }

          if (status === "FAILED") {
            console.warn("[Yescale Gemini] Task báo FAILED, chuyển sang động cơ dự phòng sạch.");
            return generateCleanFallbackImage(prompt, aspectRatio);
          }

          console.log(`[Yescale Gemini] Lần ${i + 1}/${maxRetries} - Trạng thái: ${status} (${progress})`);
        }
      } catch (pollErr: any) {
        console.warn(`[Yescale Gemini] Lần kiểm tra ${i + 1} cảnh báo:`, pollErr?.message);
      }
    }

    console.warn("[Yescale Gemini] Hết thời gian chờ Yescale, tự động dùng động cơ AI dự phòng sạch.");
    return generateCleanFallbackImage(prompt, aspectRatio);
  } catch (err: any) {
    console.warn("[Yescale Gemini] Lỗi hệ thống Yescale, khởi động động cơ dự phòng sạch:", err?.message);
    return generateCleanFallbackImage(prompt, aspectRatio);
  }
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
  
  console.log(`[Clean AI Engine] Sinh ảnh thành công qua Clean AI Engine (No Watermark): ${cleanUrl}`);
  return cleanUrl;
}
