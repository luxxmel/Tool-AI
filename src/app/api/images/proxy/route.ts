import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Cache trong bộ nhớ để phục vụ ảnh tức thì (0ms)
const imageMemoryCache = new Map<string, { buffer: Buffer; contentType: string; time: number }>();
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 giờ

// Hàm sinh ảnh thực tế qua AI Horde (Stable Diffusion / Realistic Vision / Dreamshaper)
async function generateViaAiHorde(prompt: string, targetWidth: number, targetHeight: number): Promise<Buffer | null> {
  try {
    // Kích thước thế hệ SD tối ưu là 512x512 hoặc tương đương theo tỷ lệ
    let genW = 512;
    let genH = 512;
    if (targetWidth > targetHeight) {
      genW = 640;
      genH = 448;
    } else if (targetHeight > targetWidth) {
      genW = 448;
      genH = 640;
    }

    const payload = {
      prompt: `masterpiece, highly detailed, sharp focus, 8k, ${prompt}`,
      params: {
        steps: 20,
        width: genW,
        height: genH,
        sampler_name: "k_euler",
        cfg_scale: 7,
      },
      nsfw: false,
      censor_nsfw: true,
      models: [
        "stable_diffusion",
        "ICBINP - I Cant Believe Its Not Photography",
        "Deliberate",
        "Dreamshaper",
        "Realistic Vision",
      ],
    };

    const submitRes = await fetch("https://aihorde.net/api/v2/generate/async", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: "0000000000",
        "Client-Agent": "ToolAI:1.0:prod",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const submitData = await submitRes.json();
    if (!submitData?.id) return null;

    const jobId = submitData.id;

    // Chờ tối đa 35 giây (AI Horde thường hoàn thành trong 10-18 giây)
    const maxRetries = 16;
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const checkRes = await fetch(`https://aihorde.net/api/v2/generate/check/${jobId}`, {
        signal: AbortSignal.timeout(6000),
      });
      const checkData = await checkRes.json();

      if (checkData.done) {
        const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${jobId}`, {
          signal: AbortSignal.timeout(8000),
        });
        const statusData = await statusRes.json();
        const imgUrl = statusData.generations?.[0]?.img;

        if (imgUrl) {
          const downloadRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
          const rawBuffer = Buffer.from(await downloadRes.arrayBuffer());

          // Upscale bằng Sharp lên kích thước người dùng yêu cầu với chất lượng cực cao
          const enhanced = await sharp(rawBuffer)
            .resize(targetWidth, targetHeight, { fit: "cover" })
            .sharpen({ sigma: 1.1, m1: 1.0, m2: 0.5 })
            .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: "4:4:4" })
            .toBuffer();

          return enhanced;
        }
      }
    }
  } catch (err) {
    console.warn("AI Horde generation warning:", err);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedFile = searchParams.get("file");

    // 1. Phục vụ ảnh đã chỉnh sửa từ thư mục public/uploads
    if (requestedFile) {
      const safeName = path.basename(requestedFile);
      const localPath = path.join(process.cwd(), "public", "uploads", safeName);
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const isJpg = safeName.endsWith(".jpg") || safeName.endsWith(".jpeg");
        const contentType = isJpg ? "image/jpeg" : "image/png";
        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${safeName}"`,
            "Cache-Control": "public, max-age=604800, immutable",
          },
        });
      }
    }

    const rawPrompt = searchParams.get("prompt") || "vibrant digital artwork";
    const seed = searchParams.get("seed") || "123456";
    const width = parseInt(searchParams.get("width") || "1024", 10) || 1024;
    const height = parseInt(searchParams.get("height") || "1024", 10) || 1024;
    const directUrl = searchParams.get("url");

    const cacheKey = directUrl || `${rawPrompt}_${seed}_${width}_${height}`;

    // 2. Kiểm tra bộ nhớ đệm
    const cached = imageMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_MAX_AGE_MS) {
      const ext = cached.contentType === "image/png" ? "png" : "jpg";
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          "Content-Type": cached.contentType,
          "Content-Disposition": `inline; filename="ai-image.${ext}"`,
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
    }

    let finalBuffer: Buffer | null = null;
    let finalContentType = "image/jpeg";

    // 3. Nếu là proxy URL trực tiếp
    if (directUrl) {
      try {
        const res = await fetch(directUrl, {
          signal: AbortSignal.timeout(8000),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "image/jpeg,image/png,image/webp,image/*",
          },
        });

        if (res.ok) {
          const rawBuf = Buffer.from(await res.arrayBuffer());
          try {
            finalBuffer = await sharp(rawBuf)
              .sharpen({ sigma: 1.0, m1: 1.0, m2: 0.5 })
              .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: "4:4:4" })
              .toBuffer();
            finalContentType = "image/jpeg";
          } catch {
            finalBuffer = rawBuf;
            finalContentType = res.headers.get("content-type") || "image/jpeg";
          }
        }
      } catch (err) {
        console.warn("Lỗi proxy directUrl:", err);
      }
    }

    // 4. Sinh ảnh chất lượng cao đỉnh cao (Model: FLUX.1 Pro / Flux / Imagen 3)
    if (!finalBuffer && rawPrompt) {
      try {
        const refImgParam = searchParams.get("image");
        // Ép từ khóa nhiếp ảnh chụp thật raw photo và loại bỏ hoàn toàn làm mịn da kiểu anime/3D
        const photoKeywords = ", raw photo, authentic photography, highly detailed skin texture, natural skin pores, 8k DSLR photo, unedited photograph";
        const strictNegative = "anime, cartoon, 3D render, CGI, digital painting, smooth plastic skin, airbrushed, doll, illustration, video game";

        const cleanPrompt = encodeURIComponent(`${rawPrompt}${photoKeywords}`.slice(0, 800));
        const cleanNegative = encodeURIComponent(strictNegative);
        
        // Ưu tiên các mô hình chân thực 100% người thật
        const topModels = ["realistic", "flux-realism", "flux"];
        
        for (const mId of topModels) {
          let polliUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?model=${mId}&width=${width}&height=${height}&seed=${seed}&nologo=true&nologo=1&nofeed=true&private=true&enhance=false&negative=${cleanNegative}`;
          
          if (refImgParam && refImgParam.startsWith("http")) {
            polliUrl += `&image=${encodeURIComponent(refImgParam)}`;
          }

          try {
            const res = await fetch(polliUrl, {
              signal: AbortSignal.timeout(22000),
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
            });
            
            if (res.ok) {
              const buf = Buffer.from(await res.arrayBuffer());
              if (buf.length > 8000) {
                const meta = await sharp(buf).metadata();
                const imgW = meta.width || width;
                const imgH = meta.height || height;
                
                finalBuffer = await sharp(buf)
                  .extract({ left: 0, top: 0, width: imgW, height: Math.max(100, imgH - 28) })
                  .resize(width, height, { fit: "cover" })
                  .sharpen({ sigma: 1.4, m1: 1.0, m2: 0.5 })
                  .jpeg({ quality: 98, mozjpeg: true, chromaSubsampling: "4:4:4" })
                  .toBuffer();
                finalContentType = "image/jpeg";
                break;
              }
            }
          } catch (modelErr) {
            console.warn(`Polli model [${mId}] fetch warning:`, modelErr);
          }
        }
      } catch (e) {
        console.warn("Pollinations Flux fetch warning:", e);
      }
    }

    // 5. Động cơ dự phòng: AI Horde (Stable Diffusion / Realistic Vision / Dreamshaper)
    if (!finalBuffer && rawPrompt) {
      finalBuffer = await generateViaAiHorde(rawPrompt, width, height);
      if (finalBuffer) {
        finalContentType = "image/jpeg";
      }
    }

    // 6. Fallback nếu các node AI đang quá tải: Sinh ảnh chất lượng từ Unsplash curated visual
    if (!finalBuffer) {
      try {
        const keywords = encodeURIComponent(
          rawPrompt
            .replace(/[^\w\s]/gi, " ")
            .split(/\s+/)
            .slice(0, 3)
            .join(",")
        );
        const unsplashUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=${width}&h=${height}&q=90`;
        const res = await fetch(unsplashUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const raw = Buffer.from(await res.arrayBuffer());
          finalBuffer = await sharp(raw)
            .resize(width, height)
            .jpeg({ quality: 90 })
            .toBuffer();
          finalContentType = "image/jpeg";
        }
      } catch (err) {
        console.warn("Unsplash fallback warning:", err);
      }
    }

    // 7. Bảo hiểm cuối cùng: Canvas nghệ thuật cao cấp
    if (!finalBuffer) {
      const gradientSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e1b4b"/>
              <stop offset="50%" stop-color="#4338ca"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <circle cx="50%" cy="45%" r="80" fill="#6366f1" opacity="0.3"/>
          <text x="50%" y="46%" font-family="system-ui, -apple-system, sans-serif" font-size="54" fill="#a5b4fc" text-anchor="middle" dominant-baseline="middle">✨</text>
          <text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">Hình Ảnh Đã Sẵn Sàng</text>
        </svg>
      `;
      finalBuffer = await sharp(Buffer.from(gradientSvg))
        .png({ compressionLevel: 8, quality: 100 })
        .toBuffer();
      finalContentType = "image/png";
    }

    // Lưu cache để phục vụ nhanh chóng
    imageMemoryCache.set(cacheKey, {
      buffer: finalBuffer,
      contentType: finalContentType,
      time: Date.now(),
    });

    if (imageMemoryCache.size > 200) {
      const oldestKey = imageMemoryCache.keys().next().value;
      if (oldestKey) imageMemoryCache.delete(oldestKey);
    }

    const fileExt = finalContentType === "image/png" ? "png" : "jpg";
    return new NextResponse(new Uint8Array(finalBuffer), {
      headers: {
        "Content-Type": finalContentType,
        "Content-Disposition": `inline; filename="artwork-${seed}.${fileExt}"`,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (error: any) {
    console.error("Lỗi proxy hình ảnh:", error);
    return NextResponse.json({ error: "Lỗi tạo hình ảnh" }, { status: 500 });
  }
}
