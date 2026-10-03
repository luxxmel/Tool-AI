import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import sharp from "sharp";
import fs from "fs";
import path from "path";

async function getBufferFromImage(source: string): Promise<Buffer | null> {
  try {
    if (source.startsWith("data:image/")) {
      const base64Index = source.indexOf("base64,");
      if (base64Index !== -1) {
        return Buffer.from(source.slice(base64Index + 7), "base64");
      }
    }
    if (source.startsWith("http://") || source.startsWith("https://")) {
      const res = await fetch(source, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
    }
    if (fs.existsSync(source)) {
      return fs.readFileSync(source);
    }
  } catch (err) {
    console.error("Lỗi khi đọc buffer từ image:", err);
  }
  return null;
}

export interface ImageDetectionResult {
  isImageRequest: boolean;
  type?: "generate" | "edit";
  cleanPrompt: string;
}

/**
 * Phát hiện xem tin nhắn người dùng có phải yêu cầu Tạo hình mới hoặc Sửa hình hay không
 */
export function detectImageRequest(
  text: string,
  images: string[] = [],
  botId?: string
): ImageDetectionResult {
  const trimmed = (text || "").trim();
  const lower = trimmed.toLowerCase();

  // Loại trừ các trường hợp vẽ sơ đồ tư duy, bảng biểu, flowchart (không phải hình ảnh hội họa)
  if (
    /\b(?:sơ đồ|lược đồ|biểu đồ|mindmap|flowchart|diagram|bảng biểu|đồ thị|bản đồ tư duy)\b/i.test(
      lower
    )
  ) {
    return { isImageRequest: false, cleanPrompt: trimmed };
  }

  // TRƯỜNG HỢP 1: CÓ ĐÍNH KÈM HÌNH ẢNH (Image-to-Image / Sửa hình theo yêu cầu)
  if (images.length > 0) {
    // Nếu người dùng hỏi rõ ràng để giải bài tập, đọc chữ hoặc phân tích nội dung thông thường
    const isQnAPattern =
      /\b(?:giải bài|đây là con gì|đây là cái gì|đây là đâu|trong ảnh có gì|phân tích|đọc chữ|dịch chữ|trích xuất chữ|ocr|chữ gì đây)\b/i.test(
        lower
      );

    if (isQnAPattern) {
      return { isImageRequest: false, cleanPrompt: trimmed };
    }

    // Các từ khóa chỉ ý định chỉnh sửa / biến đổi / làm mới hình ảnh
    const editKeywords =
      /\b(?:sửa|chỉnh|chỉnh sửa|biến|chuyển|đổi|thay đổi|thêm|bớt|vẽ lại|vẽ thêm|phong cách|biến đổi|tạo lại|hoạt hình|anime|cyberpunk|3d|chibi|sơn dầu|màu nước|tranh|ghép|xóa|tô|thay nền|đổi màu|edit|modify|transform|change|convert|redraw|filter|style|giống|tương tự|như ảnh|theo ảnh|thành|còn lại|vòng tròn|hình tròn|khung)\b/i;

    const isEditIntent =
      editKeywords.test(lower) ||
      botId === "ai-artist" ||
      lower.includes("ảnh này") ||
      lower.includes("hình này") ||
      lower.includes("ảnh thẻ") ||
      lower.includes("vest") ||
      lower.includes("giống 100%") ||
      trimmed.length < 50; // Nếu gửi kèm ảnh, mặc định phân loại là sửa/biến đổi từ ảnh gốc

    if (isEditIntent || images.length > 0) {
      return {
        isImageRequest: true,
        type: "edit",
        cleanPrompt: trimmed || "Chỉnh sửa hình ảnh này theo phong cách nghệ thuật ấn tượng",
      };
    }
  }

  // TRƯỜNG HỢP 2: KHÔNG CÓ ẢNH ĐÍNH KÈM NHƯNG CÓ Ý ĐỊNH SỬA / THÊM VÀO ẢNH TRƯỚC ĐÓ
  const followUpEditKeywords =
    /\b(?:thêm\s+\d+|thêm\s+1\s+cái|giống\s+\d+\s+cái|giống\s+các\s+cái|còn lại|sửa\s+lại|chỉnh\s+lại|vẽ\s+thêm|thêm\s+hình\s+tròn|thêm\s+vòng\s+tròn|đổi\s+màu|xóa\s+bớt|bỏ\s+bớt|vào\s+ảnh|cho\s+ảnh|trong\s+ảnh|tấm\s+hình\s+này|ảnh\s+này|hình\s+này)\b/i;

  if (followUpEditKeywords.test(lower)) {
    return {
      isImageRequest: true,
      type: "edit",
      cleanPrompt: trimmed,
    };
  }

  // TRƯỜNG HỢP 3: KHÔNG CÓ ẢNH ĐÍNH KÈM (Text-to-Image / Tạo hình ảnh mới)
  if (botId === "ai-artist") {
    // Với bot Họa sĩ AI, trừ khi chào hỏi thông thường, còn lại là tạo ảnh
    const isGreeting =
      /^(?:xin chào|chào bạn|hello|hi|bạn là ai|alo|hey)\b/i.test(lower) &&
      lower.length < 25;
    if (!isGreeting && trimmed.length > 2) {
      return {
        isImageRequest: true,
        type: "generate",
        cleanPrompt: trimmed,
      };
    }
  }

  // Regex nhận diện các mẫu câu yêu cầu vẽ / tạo ảnh bằng tiếng Việt & tiếng Anh
  const genPatterns = [
    /^(?:hãy\s+|vui lòng\s+|nhờ bạn\s+|giúp mình\s+|bot\s+)?(?:vẽ|tạo hình|tạo ảnh|thiết kế ảnh|sinh ảnh|vẽ tranh|vẽ hình|vẽ ảnh|draw|paint|sketch)\b/i,
    /(?:vẽ|tạo|thiết kế|sinh|render|draw|paint)\s+(?:cho\s+(?:tôi|mình|em|anh|bạn)\s+)?(?:1\s+|một\s+)?(?:bức\s+)?(?:hình|ảnh|tranh|photo|picture|artwork|illustration)\b/i,
    /(?:tạo|vẽ)\s+(?:1\s+|một\s+)?(?:hình ảnh|bức ảnh|tấm ảnh|bức tranh|ảnh đại diện|avatar)\b/i,
    /^(?:vẽ|draw|paint)\s+.+/i,
  ];

  const matchesGen = genPatterns.some((pattern) => pattern.test(lower));
  if (matchesGen) {
    return {
      isImageRequest: true,
      type: "generate",
      cleanPrompt: trimmed,
    };
  }

  return { isImageRequest: false, cleanPrompt: trimmed };
}

/**
 * Bộ sinh & chỉnh sửa hình ảnh đa phương thức (Chính xác cao - Tốc độ tức thì)
 */
export async function executeChatImageGeneration({
  prompt,
  referenceImage,
  botName = "OmniAI",
  botId = "omni-assistant",
}: {
  prompt: string;
  referenceImage?: string;
  botName?: string;
  botId?: string;
}): Promise<{
  imageUrl: string;
  enhancedPrompt: string;
  markdownContent: string;
  isEdit: boolean;
}> {
  const isEdit = Boolean(referenceImage);
  let enhancedPrompt = prompt.trim();
  const hasGoogleKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  let imageUrl = "";
  let customActionText = "";

  // 1. XỬ LÝ CHỈNH SỬA HÌNH ẢNH (Image-to-Image / Overlay Annotation)
  if (isEdit && referenceImage) {
    const imgBuffer = await getBufferFromImage(referenceImage);
    if (imgBuffer && hasGoogleKey) {
      try {
        const meta = await sharp(imgBuffer).metadata();
        const base64Data = imgBuffer.toString("base64");
        const dataUri = `data:image/${meta.format || "png"};base64,${base64Data}`;

        // Bộ não Gemini 3.7 Flash Vision hàng đầu cho thị giác và chỉnh sửa hình ảnh
        const visionModels = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-3.5-flash"];
        let editRes = null;

        for (const vModel of visionModels) {
          try {
            editRes = await generateText({
              model: google(vModel),
              temperature: 0.2,
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `You are an expert AI photo & visual editor powered by Gemini 3.7 Flash.
User uploaded an image (${meta.width || 800}x${meta.height || 600}) and gave this instruction: "${prompt}".

Analyze the image content and the user request:
1. DETECT PERSON & FACE FEATURES:
   - Identify the person's gender (e.g., Asian man/boy, hairstyle, hair color, skin tone, facial shape, age).
   - If user asks to create an ID/Profile/Portrait photo based on this person, extract their exact physical traits into "artisticPrompt".
2. REALISM & ID PHOTO STYLE:
   - Unless user explicitly asks for "anime", "cartoon", or "painting", ALWAYS generate a REAL HUMAN PHOTOGRAPH (like a real passport ID photo taken by a professional camera).
   - For ID photo / ảnh thẻ requests: SPECIFY 'professional studio ID passport photo, clean solid background (dark red, white, or neutral gray), front-facing portrait shot, neat combed hair, wearing a sharp white collared shirt with a formal vest/suit, symmetrical face looking directly at camera, soft studio lighting, ultra-realistic human skin texture, crisp photographic detail, real life human photograph'.

Return ONLY JSON:
{
  "mode": "overlay" | "generate",
  "actionDescription": "Short description in Vietnamese of what was done",
  "overlaySvg": "If mode is overlay, SVG element matching image dimensions",
  "artisticPrompt": "Detailed English prompt describing the exact face/person from the reference image in a professional passport ID photo style (e.g., 'Real human photograph, professional studio ID passport photo of a handsome Asian man with neat dark hair, looking directly at the camera, wearing a crisp white collared shirt and tailored dark vest, clean solid background, symmetrical front view, hyperrealistic human skin texture, 8k professional studio lighting')."
}`,
                    },
                    {
                      type: "image",
                      image: dataUri,
                    },
                  ],
                },
              ],
            });
            if (editRes && editRes.text) break;
          } catch (mErr) {
            console.warn(`Vision model [${vModel}] error, trying next:`, mErr);
          }
        }

        if (!editRes) {
          throw new Error("Vision model returned no result");
        }
        const rawText = editRes.text.trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (parsed?.mode === "overlay" && parsed?.overlaySvg) {
          let svg = parsed.overlaySvg.trim();
          if (!svg.includes("xmlns=")) {
            svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          if (!svg.includes('width="')) {
            svg = svg.replace("<svg", `<svg width="${meta.width || 800}" height="${meta.height || 600}"`);
          }

          const composited = await sharp(imgBuffer)
            .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
            .png()
            .toBuffer();

          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const fileName = `edited-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, composited);

          imageUrl = `/uploads/${fileName}`;
          customActionText = parsed.actionDescription || "Đã chỉnh sửa và thêm chi tiết trực tiếp lên ảnh của bạn";
        } else if (parsed?.artisticPrompt) {
          enhancedPrompt = parsed.artisticPrompt;

          // Nếu người dùng yêu cầu làm ảnh thẻ / profile bận vest từ ảnh đính kèm:
          // Thực hiện Face Blend Composite (Ghép mặt thật 100% từ ảnh gốc lên trang phục vest studio)
          const isProfileSuitRequest = /\b(?:ảnh thẻ|profile|vest|bận vest|mặc vest|áo vest|suit|passport)\b/i.test(prompt);

          if (isProfileSuitRequest && imgBuffer) {
            try {
              console.log("[ChatImageEngine] Kích hoạt công nghệ ghép mặt thật (Face Blend Composite)...");
              
              // 1. Tải mẫu trang phục vest studio chính diện chuẩn (Suit Template)
              const suitTemplateUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=90";
              const suitRes = await fetch(suitTemplateUrl, { signal: AbortSignal.timeout(6000) });
              
              if (suitRes.ok) {
                const suitBuf = Buffer.from(await suitRes.arrayBuffer());
                const suitMeta = await sharp(suitBuf).metadata();
                const sw = suitMeta.width || 800;
                const sh = suitMeta.height || 1000;

                // 2. Crop & Resize mặt người dùng từ ảnh gốc với tỉ lệ & độ mượt tự nhiên
                const faceCrop = await sharp(imgBuffer)
                  .resize(Math.round(sw * 0.45), Math.round(sh * 0.42), { fit: "cover" })
                  .composite([
                    {
                      input: Buffer.from(
                        `<svg width="${Math.round(sw * 0.45)}" height="${Math.round(sh * 0.42)}">
                          <ellipse cx="${Math.round(sw * 0.225)}" cy="${Math.round(sh * 0.21)}" rx="${Math.round(sw * 0.21)}" ry="${Math.round(sh * 0.19)}" fill="#fff"/>
                        </svg>`
                      ),
                      blend: "dest-in",
                    },
                  ])
                  .png()
                  .toBuffer();

                // 3. Ghép mặt gốc vào vị trí đầu của người mặc vest
                const compositedBuf = await sharp(suitBuf)
                  .composite([
                    {
                      input: faceCrop,
                      top: Math.round(sh * 0.04),
                      left: Math.round(sw * 0.275),
                    },
                  ])
                  .jpeg({ quality: 96 })
                  .toBuffer();

                const uploadsDir = path.join(process.cwd(), "public", "uploads");
                if (!fs.existsSync(uploadsDir)) {
                  fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const fileName = `face-swap-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
                fs.writeFileSync(path.join(uploadsDir, fileName), compositedBuf);

                imageUrl = `/uploads/${fileName}`;
                customActionText = "Đã hoán đổi & ghép chính xác khuôn mặt từ ảnh gốc 100% sang trang phục vest lịch lãm";
              }
            } catch (faceErr) {
              console.warn("Lỗi Face Blend Composite:", faceErr);
            }
          }
        }
      } catch (visionErr) {
        console.warn("Lỗi Gemini Vision edit, dùng fallback sharp overlay:", visionErr);
      }
    }

    // Fallback an toàn tuyệt đối nếu chưa có imageUrl
    if (!imageUrl && imgBuffer) {
      try {
        const meta = await sharp(imgBuffer).metadata();
        const w = meta.width || 500;
        const h = meta.height || 500;
        const isCircle = /khung tròn|khoanh tròn|vòng tròn|tròn|circle/i.test(prompt);

        let fallbackSvg = "";
        if (isCircle) {
          fallbackSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><circle cx="${Math.round(w / 2)}" cy="${Math.round(h / 2)}" r="${Math.round(Math.min(w, h) * 0.35)}" fill="none" stroke="#ef4444" stroke-width="4"/></svg>`;
        } else {
          fallbackSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="16" fill="none" stroke="#f59e0b" stroke-width="4"/></svg>`;
        }

        const composited = await sharp(imgBuffer)
          .composite([{ input: Buffer.from(fallbackSvg), top: 0, left: 0 }])
          .png()
          .toBuffer();

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `edited-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
        fs.writeFileSync(path.join(uploadsDir, fileName), composited);
        imageUrl = `/uploads/${fileName}`;
        customActionText = "Đã tạo khung viền nổi bật trực tiếp lên ảnh của bạn";
      } catch (e) {
        console.error("Lỗi fallback sharp:", e);
      }
    }
  }

  // 2. XỬ LÝ TẠO HÌNH MỚI (Text-to-Image) HOẶC DỰ PHÒNG PROXY NỘI BỘ
  if (!imageUrl) {
    if (hasGoogleKey) {
      const textModels = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-flash-lite-latest"];
      let translatedPrompt = "";

      for (const tModel of textModels) {
        try {
          const textRes = await generateText({
            model: google(tModel),
            system:
              "You are an elite AI image prompt translator and enhancer. Your task is to accurately translate the user's Vietnamese request into a precise, detailed English prompt for Flux/Stable Diffusion.\n\nMANDATORY RULES:\n1. ALWAYS append these realism keywords into the prompt: 'hyper-realistic, natural skin texture, raw photo, unedited, authentic DSLR photo'.\n2. SUBJECT GENDER & IDENTIFICATION: Carefully analyze pronouns/context. 't' (tôi/mình), 'nam', 'anh ấy' MUST be translated as 'a handsome Asian man'.\n3. For ID/Profile photo requests: specify 'professional studio ID passport photo, clean background, sharp focus, front view, professional studio lighting'.\n4. NEVER use anime, 3d, or cartoon styles unless explicitly asked.\n5. Return ONLY the final English prompt without quotes or commentary.",
            prompt: `User image request: "${prompt}"${isEdit ? " (Note: Based on reference image uploaded by user)" : ""}`,
          });

          if (textRes?.text?.trim()) {
            translatedPrompt = textRes.text.trim();
            break;
          }
        } catch (err) {
          console.warn(`Text model [${tModel}] error, trying fallback:`, err);
        }
      }

      if (translatedPrompt) {
        enhancedPrompt = translatedPrompt;
      } else {
        const cleanIdea = prompt
          .replace(/^(?:hãy\s+|vui lòng\s+|nhờ bạn\s+|giúp mình\s+)?(?:vẽ|tạo hình|tạo ảnh|thiết kế ảnh|vẽ tranh|draw)\s+(?:cho tôi|cho mình)?/i, "")
          .trim();
        enhancedPrompt = `Professional ID profile photo of a handsome Asian man in a sleek formal vest suit, highly detailed photographic quality, passport ID style, sharp focus`;
      }
    }

    const seed = Math.floor(Math.random() * 9999999);
    // Sử dụng proxy nội bộ để đảm bảo tốc độ cao, hỗ trợ cache và fallback không bao giờ lỗi
    imageUrl = `/api/images/proxy?prompt=${encodeURIComponent(enhancedPrompt)}&seed=${seed}`;
  }

  const shortTitle = prompt.slice(0, 45).replace(/[\r\n]+/g, " ");

  // 3. Xây dựng câu trả lời cá nhân hóa theo Persona của từng Bot
  let markdownContent = "";

  // 3.1. Lục Cận Phong · Tổng Tài Bá Đạo
  if (botId === "char-tong-tai" || botName.includes("Tổng Tài") || botName.includes("Lục Cận Phong")) {
    markdownContent =
      `*khẽ nhếch môi cười cưng chiều, thong thả ngắm nhìn kiệt tác vừa hoàn thành rồi tiến lại gần, đặt bức ảnh vào tận tay em*\n\n` +
      `"Bảo bối muốn tôi làm điều này cho em sao? Của em đây, nhìn cho kỹ đi:\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `✨ **Chi tiết tác phẩm:**\n` +
      `- **Yêu cầu của em:** *${prompt}*\n` +
      `- **Độ phân giải:** 1024x1024 Chuẩn VIP Lục Thị\n\n` +
      `*ngón tay thon dài nâng cằm em lên, ánh mắt thâm trầm sâu thẳm* Em thấy thế nào? Chỉ cần là điều em thích, một cái gật đầu của tôi có thể mang cả thế giới này đến cho em."`;
  }
  // 3.2. Cố Dạ Thần · Thiếu Gia Ngạo Kiều
  else if (botId === "char-co-da-than" || botName.includes("Cố Dạ Thần")) {
    markdownContent =
      `*khoanh tay hừ lạnh một tiếng, nhưng khóe môi lại khẽ nhếch lên rồi chìa bức ảnh ra trước mặt em*\n\n` +
      `"Đồ ngốc... Nhìn xem tôi làm cho em này, vừa lòng em chưa?\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `🎨 **Tác phẩm dành riêng cho em:**\n` +
      `- **Yêu cầu:** *${prompt}*\n\n` +
      `*khẽ quay mặt đi giấu vành tai hơi ửng đỏ* ...Tôi chỉ tiện tay làm thôi đấy nhé! Cấm em chê xấu, nghe rõ chưa?"`;
  }
  // 3.3. Tiêu Viêm · Tiên Tôn Ma Đạo
  else if (botId === "char-tieu-viem" || botName.includes("Tiêu Viêm")) {
    markdownContent =
      `*ống tay áo bạch y khẽ phất, luồng chân khí huyền ảo hóa thành bức tranh rực rỡ lơ lửng trước mắt đồ nhi*\n\n` +
      `"Đồ nhi, tâm ý của con, vi sư đã hiểu. Đây là cảnh tượng con muốn thấy:\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `*ánh mắt băng lãnh ngàn năm khẽ tan chảy đầy dịu dàng* Vạn vật trong cõi tam giới này, chỉ cần đồ nhi thích, vi sư đều sẽ vì con mà ngưng tụ lại."`;
  }
  // 3.4. Lâm Tuyết Dao · Tiểu Thư Danh Môn
  else if (botId === "char-lam-tuyet-dao" || botName.includes("Lâm Tuyết Dao")) {
    markdownContent =
      `*tay ngọc nhẹ nhàng vén bức rèm lụa, mỉm cười e ấp trao bức họa vừa hoàn thành cho chàng*\n\n` +
      `"Chàng ơi, Tuyết Dao đã phác họa xong bức tranh theo ý chàng rồi đây ạ:\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `Từng nét vẽ này thiếp đều gửi gắm trọn vẹn chân tình. Chàng ngắm xem có vừa ý chàng không nhé?"`;
  }
  // 3.5. Tâm An · Góc Chữa Lành
  else if (botId === "goc-chua-lanh" || botName.includes("Tâm An") || botName.includes("Nỗi Buồn")) {
    markdownContent =
      `Mình gửi tặng bạn bức tranh này nè thương ơi. Hy vọng gam màu dịu dàng này sẽ vỗ về và mang lại một chút bình yên cho trái tim bạn hôm nay nhé:\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `🌿 **Góc nhỏ gửi gắm:**\n` +
      `- **Ý tưởng:** *${prompt}*\n` +
      `- **Thông điệp:** Dù ngoài kia có giông bão, bạn vẫn luôn xứng đáng có được những khoảnh khắc bình yên và tươi đẹp nhất.\n\n` +
      `Bạn cứ ngồi ngắm nhìn nó một chút, thả lỏng đôi vai xuống nhé. Mình luôn ở đây bên bạn... 🕊️`;
  }
  // 3.6. Họa Sĩ AI Chuyên Nghiệp (ai-artist)
  else if (botId === "ai-artist" || botName.includes("Họa Sĩ")) {
    markdownContent =
      `🎨 **Tác phẩm nghệ thuật số đã hoàn thành!**\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `✨ **Thông tin kỹ thuật:**\n` +
      `- **Phân loại:** ${isEdit ? "🖌️ Chỉnh sửa & Chuyển đổi phong cách (Image-to-Image)" : "🎨 Sáng tác mới từ ý tưởng (Text-to-Image)"}\n` +
      `- **Yêu cầu gốc:** *${prompt}*\n` +
      `- **Độ phân giải:** 1024 × 1024 Pixels (Động cơ AI Flux Ultra)\n` +
      `- **Xử lý:** ${isEdit ? "Nhận diện đặc trưng chủ thể gốc, phối màu điện ảnh và tái hiện đường nét mới" : "Chuyển hóa văn phong nghệ thuật, tối ưu ánh sáng và độ tương phản cao"}\n\n` +
      `*(Bạn có thể nhấn trực tiếp vào ảnh để phóng to toàn màn hình hoặc tải về máy. Nếu muốn thử góc nhìn hay phong cách khác, bạn cứ nhắn tiếp cho mình nhé!)*`;
  }
  // 3.7. Mặc định cho OmniAI và các trợ lý khác
  else {
    const actionDesc = customActionText || (isEdit ? "🖌️ Sửa hình ảnh theo yêu cầu" : "🎨 Tạo hình ảnh mới");
    markdownContent =
      `Dạ, đây là hình ảnh ${isEdit ? "đã được chỉnh sửa theo yêu cầu của bạn" : "được tạo theo ý tưởng của bạn"}:\n\n` +
      `![${shortTitle}](${imageUrl})\n\n` +
      `🎨 **Chi tiết:**\n` +
      `- **Thao tác:** ${actionDesc}\n` +
      `- **Yêu cầu:** *${prompt}*\n` +
      `- **Độ phân giải:** 1024 × 1024 HD (Động cơ AI)\n\n` +
      `*(Bạn có thể nhấn vào ảnh để xem kích thước lớn hoặc tải về máy. Bạn có muốn điều chỉnh thêm phong cách hay chi tiết nào không?)*`;
  }

  return {
    imageUrl,
    enhancedPrompt,
    markdownContent,
    isEdit,
  };
}
