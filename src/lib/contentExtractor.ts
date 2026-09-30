/**
 * Bộ trích xuất nội dung thông minh từ link YouTube và các trang web
 * Giúp AI có thể "đọc và xem" nội dung link để tóm tắt chính xác 100%
 */

export interface ExtractedItem {
  type: "youtube" | "web";
  url: string;
  title?: string;
  author?: string;
  content: string;
  duration?: string;
  keywords?: string[];
}

/**
 * Trích xuất Video ID từ đường link YouTube (hỗ trợ watch, shorts, share link youtu.be, embed...)
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  const match = cleaned.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Lấy tất cả URLs có trong đoạn văn bản của người dùng
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<>"'()]+)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

/**
 * Định dạng giây thành phút:giây hoặc giờ:phút:giây
 */
function formatDuration(secondsStr?: string): string {
  if (!secondsStr) return "";
  const totalSec = parseInt(secondsStr, 10);
  if (isNaN(totalSec) || totalSec <= 0) return "";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h} giờ ${m} phút ${s} giây`;
  }
  return `${m} phút ${s} giây`;
}

/**
 * Trích xuất chi tiết nội dung video YouTube (Tiêu đề, Kênh, Thời lượng, Toàn bộ phần miêu tả & mốc thời gian)
 */
export async function fetchYouTubeDetails(videoId: string, originalUrl: string): Promise<ExtractedItem | null> {
  let title = "";
  let author = "";
  let description = "";
  let duration = "";
  let keywords: string[] = [];

  // 1. Thử lấy thông tin chính thức từ YouTube oEmbed API (Rất nhanh và chuẩn xác)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) author = data.author_name;
    }
  } catch (err) {
    console.warn("[ContentExtractor] oEmbed fetch failed or timed out:", err);
  }

  // 2. Fetch trang xem video YouTube để bóc tách ytInitialPlayerResponse (chứa full mô tả, timestamps, keywords)
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(watchUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (match && match[1]) {
        try {
          const playerData = JSON.parse(match[1]);
          const details = playerData.videoDetails;
          if (details) {
            if (!title && details.title) title = details.title;
            if (!author && details.author) author = details.author;
            if (details.shortDescription) description = details.shortDescription;
            if (details.lengthSeconds) duration = formatDuration(details.lengthSeconds);
            if (Array.isArray(details.keywords)) keywords = details.keywords;
          }
        } catch (jsonErr) {
          console.warn("[ContentExtractor] Failed to parse ytInitialPlayerResponse JSON:", jsonErr);
        }
      }
    }
  } catch (pageErr) {
    console.warn("[ContentExtractor] Failed to scrape YouTube watch page:", pageErr);
  }

  // 3. Nếu description vẫn trống hoặc quá ngắn, thử dùng Jina Reader làm phương án dự phòng
  if (!description || description.length < 50) {
    try {
      const jinaRes = await fetch(`https://r.jina.ai/https://www.youtube.com/watch?v=${videoId}`, {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: "text/plain" },
      });
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (jinaText && jinaText.length > 100) {
          // Lọc bớt header navigation của jina
          const cleaned = jinaText.replace(/Warning: Target URL returned error[^\n]*/g, "").trim();
          if (cleaned.length > description.length) {
            description = cleaned.slice(0, 4000);
          }
        }
      }
    } catch {
      // bỏ qua fallback
    }
  }

  if (!title && !description) {
    return null;
  }

  let formattedContent = `### 🎬 THÔNG TIN CHI TIẾT VIDEO YOUTUBE:\n`;
  formattedContent += `- **Tiêu đề video**: ${title || "Video YouTube"}\n`;
  if (author) formattedContent += `- **Kênh / Người đăng**: ${author}\n`;
  if (duration) formattedContent += `- **Thời lượng**: ${duration}\n`;
  formattedContent += `- **Đường link gốc**: ${originalUrl}\n`;
  if (keywords.length > 0) {
    formattedContent += `- **Chủ đề / Từ khóa**: ${keywords.slice(0, 10).join(", ")}\n`;
  }
  formattedContent += `\n#### 📜 NỘI DUNG CHI TIẾT & MÔ TẢ TỪ VIDEO:\n`;
  formattedContent += description ? description.slice(0, 5000) : "Video không có phần mô tả dài.";

  return {
    type: "youtube",
    url: originalUrl,
    title,
    author,
    duration,
    keywords,
    content: formattedContent,
  };
}

/**
 * Trích xuất nội dung văn bản từ một trang web bất kỳ
 */
export async function fetchWebpageDetails(url: string): Promise<ExtractedItem | null> {
  // Thử cào trực tiếp trước
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (res.ok) {
      const html = await res.text();
      // Lấy Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";

      // Lấy meta description
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";

      // Dọn dẹp HTML lấy nội dung chính
      let cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanText.length > 150) {
        let formatted = `### 🌐 NỘI DUNG TRANG WEB ĐÃ TRÍCH XUẤT:\n`;
        formatted += `- **Tiêu đề**: ${title || url}\n`;
        formatted += `- **Link bài viết**: ${url}\n`;
        if (metaDesc) formatted += `- **Tóm lược ban đầu**: ${metaDesc}\n`;
        formatted += `\n#### 📄 NỘI DUNG BÀI VIẾT:\n`;
        formatted += cleanText.slice(0, 4500);

        return {
          type: "web",
          url,
          title,
          content: formatted,
        };
      }
    }
  } catch (err) {
    console.warn(`[ContentExtractor] Direct fetch failed for ${url}:`, err);
  }

  // Fallback: Jina Reader cho các trang chặn bot hoặc SPA/React
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "text/plain" },
    });
    if (jinaRes.ok) {
      const jinaText = await jinaRes.text();
      if (jinaText && jinaText.length > 100) {
        return {
          type: "web",
          url,
          content: `### 🌐 NỘI DUNG BÀI VIẾT TỪ TRANG WEB (${url}):\n\n${jinaText.slice(0, 4500)}`,
        };
      }
    }
  } catch {
    // bỏ qua fallback
  }

  return null;
}

/**
 * Kiểm tra xem người dùng có gửi link không, nếu có thì tự động trích xuất nội dung
 * và đóng gói thành context rõ ràng cho AI tiến hành tóm tắt ngay lập tức.
 */
export async function enrichPromptWithUrlContent(
  userPromptText: string,
  botId?: string
): Promise<{
  enrichedPrompt: string;
  hasExtractedContent: boolean;
  extractedItems: ExtractedItem[];
}> {
  const urls = extractUrlsFromText(userPromptText);
  if (urls.length === 0) {
    return {
      enrichedPrompt: userPromptText,
      hasExtractedContent: false,
      extractedItems: [],
    };
  }

  const extractedItems: ExtractedItem[] = [];

  // Giới hạn xử lý tối đa 2 URLs đầu tiên để tốc độ phản hồi nhanh nhất
  const targetUrls = urls.slice(0, 2);

  for (const url of targetUrls) {
    const ytId = extractYouTubeId(url);
    if (ytId) {
      const ytData = await fetchYouTubeDetails(ytId, url);
      if (ytData) extractedItems.push(ytData);
    } else {
      const webData = await fetchWebpageDetails(url);
      if (webData) extractedItems.push(webData);
    }
  }

  if (extractedItems.length === 0) {
    return {
      enrichedPrompt: userPromptText,
      hasExtractedContent: false,
      extractedItems: [],
    };
  }

  // Ghép toàn bộ nội dung đã bóc tách vào prompt
  const extractedBlocks = extractedItems.map((item) => item.content).join("\n\n---\n\n");

  const promptGuidance = `
[HỆ THỐNG ĐÃ TRÍCH XUẤT THÀNH CÔNG NỘI DUNG TỪ ĐƯỜNG DẪN BÊN DƯỚI]:
${extractedBlocks}

===================================================================
[CHỈ DẪN QUAN TRỌNG DÀNH CHO AI]:
1. Toàn bộ nội dung video/trang web đã được hệ thống bóc tách đầy đủ ở trên.
2. TUYỆT ĐỐI KHÔNG NÓI rằng bạn không thể truy cập internet hay không xem được đường link!
3. Hãy lập tức tóm tắt và phân tích nội dung trên theo định dạng rõ ràng, chuyên nghiệp:
   - 🎯 **Thông Điệp Cốt Lõi**: Tóm lược ý nghĩa/chủ đề chính trong 1-2 câu súc tích.
   - 📌 **Các Ý Chính & Luận Điểm Quan Trọng**: Liệt kê 3 - 5 ý đắt giá nhất (kèm mốc thời gian nếu có).
   - 💡 **Bài Học & Hành Động Thực Tế (Actionable Takeaways)**: Người xem/đọc có thể áp dụng được gì ngay.
4. Trả lời bằng tiếng Việt chuẩn mực, mạch lạc, trực diện và hữu ích.
===================================================================

[YÊU CẦU CỦA NGƯỜI DÙNG]:
${userPromptText}
`;

  return {
    enrichedPrompt: promptGuidance.trim(),
    hasExtractedContent: true,
    extractedItems,
  };
}
