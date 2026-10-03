import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getAIModel, trollLLMClient } from "@/lib/aiProvider";
import { prisma } from "@/lib/prisma";
import { enrichPromptWithUrlContent } from "@/lib/contentExtractor";
import { ensureUser } from "@/lib/ensureUser";

const PRO_TOOLS = ["tiktok_script", "ad_copy", "shopee_seo", "seo_article", "pod_prompt", "digital_product"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text, options = {}, userId, language = "vi" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập nội dung văn bản" }, { status: 400 });
    }

    const cost = PRO_TOOLS.includes(action) ? 2 : 1;
    const user = await ensureUser(userId);
    let isAdmin = false;

    if (user) {
      isAdmin = user.role === "ADMIN";
      if (!isAdmin && user.credits < cost) {
        return NextResponse.json(
          {
            error: `Tài khoản của bạn còn ${user.credits} Credits, cần ${cost} Credits để dùng công cụ chuyên sâu này. Vui lòng nạp thêm Credits!`,
            code: "INSUFFICIENT_CREDITS",
            credits: user.credits,
          },
          { status: 403 }
        );
      }
    }

    const selectedAI = getAIModel(options.model || "gemini-2.5-flash");
    if (!selectedAI) {
      return NextResponse.json({ error: "Chưa cấu hình API Key AI nào trong hệ thống" }, { status: 500 });
    }

    let systemPrompt = "Bạn là trợ lý AI thông minh, hỗ trợ xử lý ngôn ngữ và tài liệu chính xác, chuyên nghiệp bằng tiếng Việt.";
    let userPrompt = text;

    if (action === "summarize") {
      const mode = options.mode || "bullets";
      if (mode === "short") {
        systemPrompt = "Bạn là chuyên gia tóm tắt văn bản. Hãy đọc kỹ văn bản và tóm tắt thành 3 đến 5 câu súc tích nhất, nắm bắt trọn vẹn thông điệp cốt lõi.";
      } else if (mode === "bullets") {
        systemPrompt = "Bạn là chuyên gia phân tích tài liệu. Hãy tóm tắt văn bản thành các gạch đầu dòng rõ ràng, mạch lạc, làm nổi bật các sự kiện, số liệu và luận điểm quan trọng nhất.";
      } else if (mode === "action_items") {
        systemPrompt = "Bạn là trợ lý quản lý dự án. Hãy trích xuất toàn bộ các hành động cần làm (Action Items), hạn chót (nếu có), và người phụ trách từ văn bản đã cho.";
      }

      const urlEnrichment = await enrichPromptWithUrlContent(text);
      if (urlEnrichment.hasExtractedContent) {
        systemPrompt += "\n[LƯU Ý]: Toàn bộ nội dung từ đường link YouTube / Web đã được hệ thống bóc tách đầy đủ. Tuyệt đối không từ chối, hãy tóm tắt trực tiếp dựa trên nội dung đã cung cấp.";
        userPrompt = urlEnrichment.enrichedPrompt;
      } else {
        userPrompt = `Nội dung cần tóm tắt:\n\n${text}`;
      }
    } else if (action === "rewrite") {
      const tone = options.tone || "professional";
      const toneDescriptions: Record<string, string> = {
        professional: "trang trọng, lịch thiệp, phù hợp môi trường công sở và đối tác doanh nghiệp",
        persuasive: "thuyết phục, lôi cuốn, kích thích hành động, phù hợp bài viết bán hàng hoặc đề xuất",
        casual: "thân thiện, gần gũi, tự nhiên như trò chuyện hàng ngày trên mạng xã hội",
        concise: "cực kỳ súc tích, lược bỏ từ thừa, đi thẳng vào trọng tâm vấn đề",
      };
      const toneGuide = toneDescriptions[tone] || toneDescriptions.professional;
      systemPrompt = `Bạn là biên tập viên ngôn ngữ chuyên nghiệp. Hãy viết lại văn bản sau theo phong cách: ${toneGuide}. Đảm bảo giữ nguyên ý nghĩa gốc nhưng nâng tầm diễn đạt, chuẩn ngữ pháp tiếng Việt.`;
      userPrompt = `Văn bản gốc cần viết lại:\n\n${text}`;
    } else if (action === "tiktok_script") {
      const niche = options.niche || "ecommerce";
      const tone = options.tone || "relatable";
      systemPrompt = `Bạn là Đạo diễn & Biên kịch Video Ngắn triệu view hàng đầu trên TikTok, Reels và YouTube Shorts, chuyên tạo nội dung lan truyền và chuyển đổi bán hàng (Affiliate Marketing / TikTok Shop).
Nhiệm vụ của bạn là tạo một kịch bản video ngắn hoàn chỉnh, giữ chân người xem từ giây đầu tiên đến giây cuối cùng, tối ưu tỷ lệ click vào giỏ hàng hoặc link affiliate.

Cấu trúc kịch bản yêu cầu:
1. 🎯 **Ý tưởng & Định vị Video**: Tiêu đề giật gân, thời lượng lý tưởng (30-60 giây), nhóm đối tượng mục tiêu.
2. ⚡ **3 Giây Đầu Quyết Định (The Hook)**: Đưa ra 3 phương án Hook khác nhau (Hook thị giác, Hook nỗi đau, Hook gây sốc) đạt tỷ lệ giữ chân >70%.
3. 🎬 **Bảng Kịch Bản Chi Tiết Phân Cảnh (Storyboard Table)**:
   - Cột 1: Giây (0-3s, 3-10s, 10-25s, 25-45s, 45-60s)
   - Cột 2: Hình ảnh / Góc quay / Hành động diễn viên (B-roll & Visual Action)
   - Cột 3: Lời thoại / Voiceover (Được ngắt nhịp sống động, chỉ rõ từ cần nhấn mạnh)
   - Cột 4: Chữ hiện trên màn hình (Text On Screen) & Hiệu ứng âm thanh (SFX)
4. 🛒 **Lời Kêu Gọi Hành Động (CTA Chốt Đơn)**: Tự nhiên, kích thích bấm vào giỏ hàng góc trái hoặc bình luận ngay.
5. 🏷️ **Bộ Hashtags Thịnh Hành**: 6-8 hashtag đúng tệp khách hàng.`;
      userPrompt = `Chủ đề / Sản phẩm video: "${text}"\nNgách nội dung: ${niche}\nPhong cách / Giọng điệu: ${tone}`;

    } else if (action === "ad_copy") {
      const framework = options.framework || "AIDA";
      const platform = options.platform || "Facebook";
      systemPrompt = `Bạn là Chuyên gia Copywriting quảng cáo bán hàng đỉnh cao, chuyên viết bài quảng cáo triệu đô cho Facebook Ads, TikTok Ads và Google Ads.
Nhiệm vụ của bạn là viết bộ mẫu quảng cáo có tỷ lệ chuyển đổi (Conversion Rate) cao nhất theo mô hình: ${framework}.

Cấu trúc bài viết yêu cầu:
1. 💥 **3 Tiêu Đề Giật Tít (Headlines)**: Đánh trúng nỗi đau cấp bách, kích thích tò mò và chạm vào cảm xúc khách hàng.
2. 📝 **Bài Viết Quảng Cáo Chính** theo mô hình ${framework}:
   - Chạm đúng "điểm đau" (Pain Point) và vấn đề khách hàng đang gặp phải
   - Giới thiệu giải pháp và lợi ích vượt trội (Lợi ích khách hàng nhận được > Tính năng kỹ thuật)
   - Bằng chứng xã hội (Social Proof / Uy tín cam kết)
   - Lời đề nghị không thể từ chối (Ưu đãi giới hạn, Quà tặng độc quyền, Cam kết hoàn tiền 100%)
   - Kêu gọi hành động khẩn cấp (Urgency CTA)
3. 🎨 **Gợi Ý Định Dạng Media Đi Kèm**: Ý tưởng hình ảnh hoặc video ngắn chạy ads hiệu quả nhất.`;
      userPrompt = `Sản phẩm / Dịch vụ cần quảng cáo: "${text}"\nNền tảng chạy ads: ${platform}\nCấu trúc: ${framework}`;

    } else if (action === "shopee_seo") {
      const platform = options.platform || "Shopee";
      systemPrompt = `Bạn là Chuyên gia Tối ưu hóa Gian hàng Thương mại Điện tử (eCommerce SEO Specialist) cho ${platform}, Lazada và TikTok Shop.
Nhiệm vụ của bạn là tối ưu toàn diện bài đăng sản phẩm để đạt chuẩn SEO Top 1 tìm kiếm và tối đa tỷ lệ chốt đơn (CR).

Cấu trúc bài đăng chuẩn sàn:
1. 🏷️ **Tiêu Đề Chuẩn SEO Sàn**: Cấu trúc: [Tên sản phẩm] + [Thương hiệu] + [Đặc điểm nổi bật / Công dụng chính] + [Kích thước / Dung tích / Màu sắc] + [Quà tặng kèm nếu có]. Độ dài tối ưu 80-120 ký tự.
2. 💎 **5 Điểm Nổi Bật (Key Selling Points)**: Trình bày dạng bullet points ngắn gọn, giải quyết triệt để sự do dự của khách hàng.
3. 📋 **Mô Tả Sản Phẩm Chi Tiết**:
   - Vấn đề sản phẩm giải quyết
   - Thông số kỹ thuật & Chi tiết thành phần/chất liệu
   - Hướng dẫn sử dụng & Bảo quản đúng cách
   - Cam kết của Shop (Hàng chính hãng, đổi trả 7 ngày, kiểm tra hàng trước khi nhận)
4. 🔍 **Bộ Từ Khóa LSI & Hashtags Đẩy Top**: 10-15 từ khóa tìm kiếm phổ biến nhất của người mua hàng.`;
      userPrompt = `Sản phẩm cần tối ưu: "${text}"\nSàn TMĐT: ${platform}`;

    } else if (action === "seo_article") {
      const articleType = options.articleType || "review_affiliate";
      systemPrompt = `Bạn là Cây bút Viết bài Chuẩn SEO & Tiếp thị Liên kết (SEO Content & Affiliate Specialist) đẳng cấp cao.
Nhiệm vụ của bạn là tạo một bài viết dài, chuyên sâu, tự nhiên, vượt qua các công cụ quét AI, đạt điểm SEO On-page 100 và tối ưu để đặt các liên kết tiếp thị liên kết (Affiliate Links).

Cấu trúc bài viết:
1. 🏆 **Tiêu Đề H1 Hấp Dẫn & Chuẩn SEO** (Chứa từ khóa chính, tạo tò mò click CTR cao).
2. 📌 **Thẻ Meta Description** (150-160 ký tự, tóm tắt đắt giá).
3. 📑 **Dàn Ý Chi Tiết (Heading Structure H2, H3)**.
4. ✍️ **Nội Dung Bài Viết Hoàn Chỉnh**:
   - Mở bài chạm đúng vấn đề người đọc đang tìm kiếm.
   - Thân bài phân tích chuyên sâu, so sánh khách quan, có dẫn chứng cụ thể.
   - Các khung Callout nổi bật (Mẹo hay, Lưu ý quan trọng).
    - Đánh dấu rõ vị trí [ĐẶT LINK AFFILIATE TẠI ĐÂY] với văn bản mỏ neo (Anchor Text) tối ưu.
    - Kết bài & Đưa ra lời khuyên lựa chọn tốt nhất.
5. 💡 **Chiến Lược Tối Ưu Hóa & Tiếp Thị**: Gợi ý các mạng tiếp thị liên kết và chiến lược phân phối nội dung đa kênh.`;
      userPrompt = `Từ khóa chính / Chủ đề bài viết: "${text}"\nThể loại bài viết: ${articleType}`;

    } else if (action === "pod_prompt") {
      const style = options.style || "vintage_tshirt";
      systemPrompt = `Bạn là Giám đốc Nghệ thuật & Chuyên gia Thiết kế Print-on-Demand (POD) trên Merch by Amazon, Etsy, Teespring và Redbubble.
Nhiệm vụ của bạn là tạo bộ câu lệnh (Prompts) Midjourney v6 và DALL-E 3 chuyên nghiệp để sinh ra các thiết kế đồ họa áo thun, cốc ly, tranh canvas đạt tiêu chuẩn in ấn thương mại cao cấp.

Yêu cầu xuất ra:
1. 🎨 **Master Prompt Midjourney v6**: Mô tả chi tiết chủ thể, phong cách (${style}), đường nét sắc sảo, kỹ thuật vector, "isolated on clean white background", tỷ lệ khung hình thích hợp (--ar 1:1 hoặc --ar 4:5), ánh sáng và màu sắc rực rỡ, sẵn sàng để in ấn độ phân giải cao.
2. 🚫 **Negative Prompt**: Loại bỏ chữ thừa nhòe, viền bẩn, lỗi biến dạng, chi tiết mờ.
3. 👕 **Ý Tưởng Mockup Sản Phẩm Bán Chạy**: Gợi ý màu áo nền hợp nhất (Black / White / Heather Grey) và các sản phẩm phái sinh (Hoodie, Sticker, Tote bag).
4. 🏷️ **Bộ Tiêu Đề & 13 Tags Chuẩn SEO Cho Etsy / Amazon**: Giúp thiết kế lên top tìm kiếm của người mua quốc tế.`;
      userPrompt = `Ý tưởng thiết kế POD: "${text}"\nPhong cách mỹ thuật: ${style}`;

    } else if (action === "digital_product") {
      const productFormat = options.productFormat || "ebook";
      systemPrompt = `Bạn là Chuyên gia Xây dựng Bản Thiết Kế Sản Phẩm Số & Kinh Doanh Trực Tuyến (Digital Products Architect).
Nhiệm vụ của bạn là thiết kế toàn bộ bản kế hoạch chi tiết (Blueprint) cho một sản phẩm số có giá trị cao (Ebook, Khóa học mini, Bộ mẫu Template) để người dùng có thể đóng gói và phát hành tự động trên Gumroad, Shopee hoặc website riêng.

Bản thiết kế gồm:
1. 💰 **Định Vị & Mức Giá Bán Đề Xuất**: Mức giá mở bán (Early-bird), giá niêm yết chính thức và doanh thu tiềm năng với 100 đơn đầu tiên.
2. 🎯 **Tên Sản Phẩm Hút Khách (Catchy Title & Subtitle)**: Nhấn mạnh vào kết quả người mua đạt được trong thời gian ngắn.
3. 📚 **Mục Lục & Khung Nội Dung Chi Tiết (Toàn Bộ Các Chương / Module)**:
   - Module 1: Nền tảng & Tư duy cốt lõi
   - Module 2 - 4: Các bước thực chiến từng bước (Step-by-step framework)
   - Module 5: Khắc phục sự cố & Tối ưu hóa nâng cao
   - Các bài tập thực hành & Template đi kèm mỗi module.
4. 🎁 **3 Món Quà Tặng Độc Quyền (Bonuses)**: Khiến khách hàng cảm thấy "mua một được mười".
5. 🚀 **Kế Hoạch Bán Hàng 7 Ngày (Launch Plan)**: Cách đăng bài trên Threads, Facebook, TikTok để có những khách hàng đầu tiên.`;
      userPrompt = `Chủ đề chuyên môn / Kỹ năng muốn đóng gói: "${text}"\nĐịnh dạng sản phẩm: ${productFormat}`;

    } else if (action === "prompt_craft") {
      const targetAI = options.targetAI || "ChatGPT";
      systemPrompt = `Bạn là kỹ sư Prompt hàng đầu (Master Prompt Engineer). Nhiệm vụ của bạn là lấy ý tưởng thô từ người dùng và xây dựng thành một Master Prompt hoàn chỉnh, có cấu trúc chặt chẽ cho ${targetAI}.
Cấu trúc prompt cần bao gồm:
1. [Vai trò / Persona]
2. [Bối cảnh / Context]
3. [Nhiệm vụ cụ thể / Task]
4. [Ràng buộc & Quy tắc / Constraints]
5. [Định dạng đầu ra mong muốn / Output Format]
6. [Ví dụ minh họa mẫu / Few-shot Examples (nếu cần)]
Trình bày prompt trong khối code để người dùng dễ sao chép và sử dụng ngay.`;
    } else {
      return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
    }

    if (language === "en") {
      systemPrompt += `\n\n[STRICT LANGUAGE REQUIREMENT - ENGLISH ONLY]:
The user's application language is set to ENGLISH.
You MUST generate your entire response, headings, tables, examples, scripts, copy, and recommendations completely in ENGLISH.
Do not use Vietnamese in the output.`;
    }

    // Danh sách các model dự phòng để tự động chuyển tiếp khi gặp lỗi API Quota Rate-Limit
    const candidateModels: Array<{ model: any; name: string }> = [
      { model: selectedAI.model, name: selectedAI.name }
    ];

    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      if (selectedAI.modelId !== "gemini-3.7-flash") {
        candidateModels.push({ model: google("gemini-3.7-flash"), name: "Gemini 3.7 Flash" });
      }
      if (selectedAI.modelId !== "gemini-2.5-flash") {
        candidateModels.push({ model: google("gemini-2.5-flash"), name: "Gemini 2.5 Flash" });
      }
    }

    if (trollLLMClient) {
      candidateModels.push({ model: trollLLMClient("gemini-3-7-flash"), name: "Omni Deep (Backup)" });
    }

    let resultText = "";
    let lastError: any = null;

    for (const candidate of candidateModels) {
      try {
        const res = await generateText({
          model: candidate.model,
          system: systemPrompt,
          prompt: userPrompt,
        });
        if (res.text && res.text.trim()) {
          resultText = res.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Tool API Failover] Model ${candidate.name} gặp sự cố:`, err?.message || err);
      }
    }

    if (!resultText) {
      throw lastError || new Error("Tất cả các dịch vụ AI tạm thời không phản hồi. Vui lòng thử lại sau giây lát.");
    }

    let remainingCredits: number | undefined = undefined;
    if (user) {
      if (isAdmin) {
        remainingCredits = 999999;
      } else {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: cost } },
        });
        remainingCredits = updated.credits;
      }
    }

    return NextResponse.json({
      result: resultText,
      originalLength: text.length,
      processedLength: resultText.length,
      remainingCredits,
    });
  } catch (error: any) {
    console.error("Lỗi khi xử lý công cụ AI:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể xử lý yêu cầu lúc này" },
      { status: 500 }
    );
  }
}
