import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { generateImageViaYescale } from "@/lib/yescaleImageEngine";

// Cache trong bộ nhớ để phục vụ ảnh tức thì (0ms)
const imageMemoryCache = new Map<string, { buffer: Buffer; contentType: string; time: number }>();
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 giờ

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

    const rawPrompt = searchParams.get("prompt") || "";
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

    // 3. Nếu là proxy URL trực tiếp (Ví dụ URL từ Yescale CDN)
    if (directUrl) {
      try {
        const res = await fetch(directUrl, {
          signal: AbortSignal.timeout(12000),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "image/jpeg,image/png,image/webp,image/*",
          },
        });

        if (res.ok) {
          const rawBuf = Buffer.from(await res.arrayBuffer());
          try {
            finalBuffer = await sharp(rawBuf)
              .jpeg({ quality: 96, mozjpeg: true })
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

    // 4. Nếu truyền qua prompt, sinh ảnh trực tiếp bằng Yescale Gemini 2.5 Flash Image Engine
    if (!finalBuffer && rawPrompt) {
      try {
        const refImgParam = searchParams.get("image");
        const aspectRatio = width === height ? "1:1" : width > height ? "16:9" : "9:16";

        const yescaleUrl = await generateImageViaYescale({
          prompt: rawPrompt,
          aspectRatio,
          referenceImage: refImgParam || null,
        });

        if (yescaleUrl) {
          const imgRes = await fetch(yescaleUrl, { signal: AbortSignal.timeout(15000) });
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            finalBuffer = await sharp(buf)
              .jpeg({ quality: 96, mozjpeg: true })
              .toBuffer();
            finalContentType = "image/jpeg";
          }
        }
      } catch (yescaleErr) {
        console.warn("[Proxy] Yescale sinh ảnh cảnh báo:", yescaleErr);
      }
    }

    // 5. Fallback nếu không tải được: Trả về thông báo đồ họa thanh lịch
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
          <text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">Hình Ảnh Đang Xử Lý</text>
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
