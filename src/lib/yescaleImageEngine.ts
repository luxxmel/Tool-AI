/**
 * Động cơ sinh ảnh chính thức qua Yescale Gemini Image Engine
 * Model: gemini-2.5-flash-image[nano-banana]
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

  console.log(`[Yescale] Gửi task sinh ảnh với model ${YESCALE_MODEL}...`);
  const submitRes = await fetch(submitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${YESCALE_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    console.error("[Yescale] Lỗi submit task:", submitRes.status, errText);
    throw new Error(`Yescale API lỗi: ${submitRes.status} ${errText}`);
  }

  const submitData = await submitRes.json();
  const taskId = submitData?.task_id;

  if (!taskId) {
    throw new Error("Không nhận được task_id từ Yescale");
  }

  console.log(`[Yescale] Task ID đã tạo: ${taskId}. Bắt đầu theo dõi kết quả...`);

  // Polling chờ ảnh hoàn thành
  const pollUrl = `${YESCALE_BASE_URL}/task/${taskId}`;
  const maxRetries = 30; // Chờ tối đa ~50s

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
          const reason = pollData?.task_result?.message || pollData?.message || "Task thất bại";
          throw new Error(`Yescale sinh ảnh thất bại: ${reason}`);
        }
      }
    } catch (pollErr: any) {
      if (pollErr?.message?.includes("thất bại")) {
        throw pollErr;
      }
      console.warn(`[Yescale] Lần kiểm tra ${i + 1} cảnh báo:`, pollErr?.message);
    }
  }

  throw new Error("Quá thời gian chờ (timeout) khi sinh ảnh từ Gemini Yescale");
}
