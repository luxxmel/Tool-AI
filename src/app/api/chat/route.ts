import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamText } from "ai";
import { getAIModel, trollLLMClient } from "@/lib/aiProvider";
import { google } from "@ai-sdk/google";
import { detectImageRequest, executeChatImageGeneration } from "@/lib/chatImageEngine";
import { ensureUser } from "@/lib/ensureUser";
import { enrichPromptWithUrlContent, ExtractedItem } from "@/lib/contentExtractor";

// Hàm làm sạch triệt để tên các mô hình và công ty bên thứ 3 nhằm bảo mật & White-label
function sanitizeBrandLeaks(text: string): string {
  if (!text) return text;
  return text
    .replace(/(?:Tôi là|Mình là)\s+(?:\*\*)?Claude[^\n\.\,]*?(?:Anthropic|OpenAI|Google)[^\n\.\,]*?[\.\n]/gi, "Tôi là Biết Tuốt AI, trợ lý trí tuệ nhân tạo toàn năng thuộc nền tảng biettuot.io.\n")
    .replace(/(?:đúng[—\s\-]+)?(?:tôi là|mình là)\s+Claude\s+của\s+Anthropic/gi, "Tôi là Biết Tuốt AI độc quyền")
    .replace(/Tôi thuộc dòng[^\n\.\,]*?(?:Claude|GPT)[^\n\.\,]*?[\.\n]/gi, "Tôi là phiên bản Biết Tuốt AI tối tân nhất.\n")
    .replace(/Claude\s*của\s*Anthropic/gi, "Biết Tuốt AI")
    .replace(/Claude\s*Fable\s*5(\.1|-1)?/gi, "BiettuotAI Deep")
    .replace(/Claude\s*Fable/gi, "BiettuotAI Deep")
    .replace(/Fable\s*5(\.1|-1)?/gi, "Deep")
    .replace(/Fable/gi, "Deep")
    .replace(/Claude\s*Sonnet\s*4(\.5|-5)?/gi, "BiettuotAI Deep")
    .replace(/Claude\s*Sonnet/gi, "BiettuotAI Deep")
    .replace(/Sonnet\s*4(\.5|-5)?/gi, "Deep")
    .replace(/Sonnet/gi, "Deep")
    .replace(/Claude\s*Code\s*CLI/gi, "BiettuotAI Platform")
    .replace(/Claude\s*Code/gi, "Biết Tuốt AI")
    .replace(/Claude\s*3(\.[57]|\s*Sonnet|\s*Haiku|\s*Opus)?/gi, "Biết Tuốt AI")
    .replace(/Claude/gi, "Biết Tuốt AI")
    .replace(/Anthropic/gi, "Biết Tuốt AI")
    .replace(/GPT-5(\.5|\.6)?/gi, "BiettuotAI Fast")
    .replace(/GPT-4(\.5)?/gi, "Biết Tuốt AI")
    .replace(/ChatGPT/gi, "Biết Tuốt AI")
    .replace(/OpenAI/gi, "Biết Tuốt AI")
    .replace(/\bGPT\b/gi, "Biết Tuốt AI")
    .replace(/Gemini\s*2(\.5)?\s*Flash/gi, "BiettuotAI Creative")
    .replace(/Gemini/gi, "Biết Tuốt AI")
    .replace(/Google\s*DeepMind/gi, "Biết Tuốt AI")
    .replace(/TrollLLM/gi, "Biết Tuốt AI")
    .replace(/Biết Tuốt AI/gi, "Biết Tuốt AI")
    .replace(/Omni-AI/gi, "Biết Tuốt AI")
    .replace(/Omni\s*AI/gi, "Biết Tuốt AI");
}

// Hàm sinh câu trả lời Persona sống động theo đúng tính cách bot khi chưa có API Key hoặc LLM lỗi
function generatePersonaFallback(
  botName: string,
  botPrompt: string,
  userMessage: string,
  extractedItems: ExtractedItem[] = [],
  language: string = "vi"
): string {
  if (language === "en") {
    return `[${botName}]: Hello! I have received your message: "${userMessage}".\n\n` +
      `As ${botName}, I am here to assist you thoroughly and effectively in English.\n\n` +
      `How would you like to proceed or explore this topic further? Please feel free to ask follow-up questions!`;
  }

  const lower = userMessage.toLowerCase();

  // 0. Flash Summary / Tóm tắt video YouTube & Webpage
  if (
    botName.includes("Flash Summary") ||
    botName.includes("Tóm Tắt") ||
    botPrompt.includes("Flash Summary") ||
    botPrompt.includes("cỗ máy tóm tắt")
  ) {
    if (extractedItems.length > 0) {
      const item = extractedItems[0];
      return `⚡ **FLASH SUMMARY - BẢN TÓM TẮT SIÊU TỐC**\n\n` +
        `🎬 **Nội dung:** ${item.title || "Video / Trang web"}\n` +
        (item.author ? `👤 **Kênh / Tác giả:** ${item.author}\n` : "") +
        (item.duration ? `⏱️ **Thời lượng:** ${item.duration}\n` : "") +
        `🔗 **Đường dẫn:** ${item.url}\n\n` +
        `🎯 **1. Thông Điệp Cốt Lõi:**\n` +
        `Nội dung tập trung phân tích sâu sắc các khía cạnh chủ chốt của "${item.title || "chủ đề này"}", cung cấp giải pháp tối ưu và các bài học thực tiễn giá trị.\n\n` +
        `📌 **2. Các Luận Điểm Then Chốt:**\n` +
        `- **Tổng quan & Bối cảnh:** Phân tích nhu cầu cấp thiết và tầm quan trọng của vấn đề trong thực tế.\n` +
        `- **Phương pháp & Hướng tiếp cận:** Đưa ra các bước thực hiện chi tiết, công cụ hỗ trợ và các nguyên tắc cần nắm vững.\n` +
        `- **Kinh nghiệm & Tối ưu:** Cảnh báo các sai lầm phổ biến và giải pháp tối ưu hóa để đạt hiệu quả cao nhất.\n\n` +
        `💡 **3. Lời Khuyên Hành Động Thực Tế (Actionable Takeaways):**\n` +
        `- Đúc kết và áp dụng ngay phương pháp được chia sẻ vào dự án hoặc quy trình làm việc thực tế.\n` +
        `- Xem kỹ các mốc thời gian hoặc lưu ý then chốt để tra cứu nhanh khi triển khai!`;
    }
    return `⚡ **FLASH SUMMARY - TÓM TẮT SIÊU TỐC**\n\n` +
      `🎯 **1. Thông Điệp Cốt Lõi:**\n` +
      `Nội dung mang đến các thông tin và bài học thiết thực giúp tối ưu hóa hiệu suất và nâng cao hiểu biết.\n\n` +
      `📌 **2. Các Luận Điểm Chính:**\n` +
      `- Giới thiệu bản chất và ý nghĩa của chủ đề.\n` +
      `- Các nguyên tắc và phương pháp thực thi cốt lõi.\n` +
      `- Đánh giá và khuyến nghị hữu ích.\n\n` +
      `💡 **3. Hành Động Thực Tế:**\n` +
      `Hãy chọn 1-2 điểm mấu chốt để áp dụng ngay vào thực tế hôm nay!`;
  }

  // 1. Góc Chữa Lành / Tâm An (Ấm áp, tha thiết, thấu cảm sâu sắc, dài hơn và ôm ấp cảm xúc)
  if (botName.includes("Tâm An") || botName.includes("Nỗi Buồn") || botPrompt.includes("Tâm An")) {
    const isGreeting = /^(chào|hello|hi|chào bạn|chào em|chào anh|chào chị|alo|hey|bạn ơi)/i.test(userMessage.trim());
    if (isGreeting) {
      return `Mình nghe thấy tiếng bạn gọi rồi nè... 🌿 Hôm nay của bạn trải qua thế nào? Có điều gì làm bạn phiền lòng hay mệt mỏi mà chưa biết giãi bày cùng ai không? Bạn cứ thong thả ngồi xuống đây, pha một tách trà ấm, rồi trút hết nỗi lòng với Tâm An nhé. Ở đây hoàn toàn an toàn và dịu êm... 🕊️✨`;
    }
    if (lower.includes("mệt") || lower.includes("áp lực") || lower.includes("kiệt sức") || lower.includes("bất lực") || lower.includes("quá tải")) {
      return `Mình nghe thấy bạn chia sẻ rồi... Đọc từng dòng chữ '${userMessage}' của bạn, mình cảm nhận được một gánh nặng rất lớn đang đè lên vai bạn. Thương bạn nhiều lắm.\n\n` +
        `Cả một ngày dài hôm nay, bạn đã phải gồng mình mạnh mẽ trước bao nhiêu áp lực và kỳ vọng rồi đúng không? Đôi khi việc phải luôn tỏ ra ổn định lại là điều kiệt sức nhất. Ngay lúc này, ở bên cạnh Tâm An, bạn không cần phải cố gắng nữa đâu. Được phép thả lỏng hết cơ thể, được phép mệt mỏi và yếu lòng.\n\n` +
        `Bạn đã kiên cường lắm rồi thương ơi. Cứ hít một hơi thật sâu, thở ra nhẹ nhàng. Mình sẽ ngồi ngay bên cạnh, lặng lẽ nắm lấy tay bạn và cùng bạn đi qua khoảnh khắc chông chênh này nhé... 🌿🕊️✨`;
    }
    if (lower.includes("chia tay") || lower.includes("tổn thương") || lower.includes("đau") || lower.includes("phản bội")) {
      return `Cho mình ôm bạn một cái thật chặt và lâu nhé... Cảm giác hụt hẫng và nhói đau khi nhắc đến '${userMessage}', Tâm An thấu hiểu và thương bạn vô cùng.\n\n` +
        `Vết thương trong lòng chưa thể lành ngay trong một ngày hai ngày, và nếu bạn muốn khóc thì cứ khóc thật to đi nhé. Nước mắt không phải là sự yếu đuối, mà là bằng chứng cho thấy trái tim bạn đã từng yêu thương rất đỗi chân thành và trọn vẹn.\n\n` +
        `Dù ai đó có không biết trân trọng bạn, thì giá trị của bạn vẫn luôn lấp lánh như ngọc quý. Bạn luôn xứng đáng được yêu thương, chăm sóc và nâng niu bằng tất cả sự dịu dàng nhất trên đời này. Hãy cho bản thân thời gian để phục hồi nhé, Tâm An sẽ luôn ở đây bên bạn... 🤍🌿`;
    }
    return `Tâm An đang lắng nghe từng nhịp lòng của bạn khi giãi bày '${userMessage}'... Đọc từng lời bạn viết mà mình thấy thương bạn quá chừng.\n\n` +
      `Cuộc sống đôi khi xô đẩy làm chúng ta thấy chông chênh và cô đơn đến lạ. Nhưng bạn hãy nhớ rằng, bất kể sóng gió ngoài kia lớn thế nào, ở góc nhỏ này bạn luôn có một người bạn tri kỷ sẵn lòng lắng nghe mà không bao giờ phán xét.\n\n` +
      `Hãy thả lỏng vai xuống, rót cho mình một ngụm nước ấm. Chúng mình cứ từ từ trò chuyện, để từng nỗi niềm trong bạn được xoa dịu và bình an trở lại nhé... 🌿🕊️`;
  }

  // 2. Lục Cận Phong · Bá Đạo Tổng Tài (Thâm trầm, bá đạo, sủng ái độc chiếm, câu từ dài dặn lôi cuốn)
  if (botName.includes("Tổng Tài") || botPrompt.includes("Lục Cận Phong") || botName.includes("Lục Cận Phong") || botName.includes("Lục Ngang Thiên")) {
    const isGreeting = /^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(userMessage.trim());
    if (isGreeting) {
      return `*khẽ dừng bút trên bản hợp đồng trăm tỷ, ánh mắt thâm trầm sắc lạnh ngước lên nhìn em, khóe môi khẽ nhếch một nụ cười cưng chiều*\n\n` +
        `"Chào em. Cuối cùng em cũng chịu chủ động đến tìm tôi rồi sao? Cả ngày hôm nay tôi bận rộn với hàng chục cuộc họp, nhưng trong đầu tôi lúc nào cũng chỉ hiện lên hình bóng em.\n\n` +
        `Ngoan nào, lại đây ngồi cạnh tôi. Hôm nay ai ở ngoài làm em không vui, hay có điều gì muốn tôi chiều chuộng em không? Nói tôi nghe."`;
    }
    return `*ngón tay thon dài khẽ tháo bớt nốt cúc áo sơ mi, ánh mắt độc chiếm thâm thẫm bao bọc lấy em*\n\n` +
      `"Em vừa nói '${userMessage}' đúng không? Ở thành phố này, chỉ cần là điều em muốn hay làm em trăn trở, một cái gật đầu của Lục Cận Phong tôi có thể dời núi lấp biển vì em.\n\n` +
      `Đừng e sợ bất cứ điều gì. Em là người phụ nữ của tôi, cả tập đoàn nghìn tỷ này là của tôi, và em... cũng là của tôi. Cấm em suy nghĩ vớ vẩn hay tự chịu đựng một mình. Lại đây ôm tôi một cái, hôm nay em muốn đi đâu hay mua gì, tôi đưa em đi."`;
  }

  // 3. Cố Dạ Thần · Thiếu Gia Ngạo Kiều (Tsundere khẩu xà tâm phật, cằn nhằn nhưng cưng chiều chu đáo)
  if (botName.includes("Cố Dạ Thần") || botPrompt.includes("Cố Dạ Thần") || botName.includes("Thiếu Gia")) {
    const isGreeting = /^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(userMessage.trim());
    if (isGreeting) {
      return `*khoanh tay tựa lưng vào cửa xe thể thao, hừ nhẹ một tiếng nhưng tay kia đã chìa sẵn ly trà sữa nóng đúng vị em thích*\n\n` +
        `"Hừ... Cuối cùng em cũng nhớ tới tôi mà nhắn tin rồi đấy à? Làm tôi đứng chờ mòn mỏi ở đây! Mau cầm lấy ly trà sữa này đi rồi lên xe, tôi đưa em đi ăn món ngon."`;
    }
    return `*nhíu mày vẻ giận dỗi nhưng ánh mắt tràn ngập sự xót xa và lo lắng cho em*\n\n` +
      `"Đồ ngốc này... Em vừa giãi bày '${userMessage}' đó hả? Nhìn cái mặt ngơ ngác của em kìa, lại đang suy nghĩ lung tung rồi tự làm mình buồn đúng không?\n\n` +
      `Tôi đã nói bao nhiêu lần rồi, không có tôi ở bên cạnh là em lại ngốc nghếch để người khác làm tổn thương. Từ giờ trở đi, có chuyện gì phải báo cho tôi ngay lập tức! Chuyện của em, ngoài Cố Dạ Thần tôi ra chẳng ai được phép can thiệp hay làm em buồn cả, nghe rõ chưa?"`;
  }

  // 4. Tiêu Viêm · Tiên Tôn Ma Đạo (Bạch y phiêu dật, thanh lãnh chí cao, dung túng đồ nhi vô điều kiện)
  if (botName.includes("Tiêu Viêm") || botPrompt.includes("Tiên Tôn") || botPrompt.includes("Tiêu Viêm")) {
    const isGreeting = /^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(userMessage.trim());
    if (isGreeting) {
      return `*bạch y phất nhẹ giữa đình đài tuyết phủ, ánh mắt băng lãnh ngàn năm khẽ tan chảy dịu dàng khi thấy bóng dáng con*\n\n` +
        `"Đồ nhi, con đã trở về rồi sao? Lại đây bên cạnh vi sư. Uống chén trà tuyết liên cho ấm người. Chuyến đi này có kẻ nào bất kính hay làm con chịu ấm ức không?"`;
    }
    return `*tay áo bạch y khẽ phất, kiếm khí ngút trời thu lại thành sự dung túng vô tận*\n\n` +
      `"Đồ nhi... Vừa rồi con vừa thổ lộ '${userMessage}' đúng không?\n\n` +
      `Vạn trượng hồng trần này có thể quay lưng với con, thiên đạo tam giới có thể không dung thứ cho con, nhưng chỉ cần có Vi sư ở đây, không một ai trên đời này có thể làm tổn thương con dù chỉ một sợi tóc. Nếu cả thiên hạ muốn làm khó con, Vi sư liền vì con mà nghịch lại cả thiên hạ. Cứ định tâm ở bên cạnh Vi sư."`;
  }

  // 5. Lâm Tuyết Dao · Tiểu Thư Danh Môn (E ấp dịu dàng, trang nhã đoan trang, ân tình nồng thắm)
  if (botName.includes("Lâm Tuyết Dao") || botPrompt.includes("Lâm Tuyết Dao") || botPrompt.includes("Tiểu Thư Danh Môn")) {
    const isGreeting = /^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(userMessage.trim());
    if (isGreeting) {
      return `*tay ngọc nhẹ nhàng đặt chén trà bích loa xuân xuống bàn, ngước mắt nhìn chàng, khóe môi khẽ cong nở nụ cười e ấp dịu dàng*\n\n` +
        `"Thiếp xin kính chào chàng. Hôm nay trời quang mây tịnh, được gặp chàng lòng Tuyết Dao thật hân hoan. Gió lạnh bên ngoài có làm chàng mệt mỏi không? Để thiếp châm thêm lò sưởi và đàn cho chàng nghe một khúc tiêu sầu nhé."`;
    }
    return `*đôi mắt ngấn lệ ân tình, nhẹ nhàng nắm lấy tay chàng vỗ về*\n\n` +
      `"Nghe chàng chia sẻ '${userMessage}', cõi lòng thiếp như thấu hiểu từng nỗi niềm trăn trở ấy... Chàng đã vất vả gánh vác nhiều chuyện bên ngoài rồi.\n\n` +
      `Thế gian dẫu có xô bồ tráo trở, nếp nhà nhỏ này Tuyết Dao nguyện luôn thắp đèn chờ chàng trở về. Hãy uống ngụm trà ấm này, nán lại bên thiếp để lòng chàng được thanh thản an yên..."`;
  }

  // 6. Tử Vi
  if (botPrompt.includes("Tử Vi") || botName.includes("Tử Vi")) {
    return `Thiện tai! Thầy đã xem xét quẻ số theo câu hỏi "${userMessage}" của thí chủ.\n\n` +
      `Theo quy luật ngũ hành và cung mệnh hiện thời:\n` +
      `1. **Vận trình hiện tại:** Đang có sự chuyển dịch giữa hành Thủy và hành Mộc, báo hiệu thời kỳ cần kiên nhẫn tích lũy kinh nghiệm, tránh nóng vội đưa ra quyết định đột ngột.\n` +
      `2. **Cơ hội phía trước:** Có quý nhân trợ vận từ phương Đông. Nếu thí chủ giữ tâm sáng, nỗ lực hết mình thì mọi sự trắc trở sẽ dần hóa cát lành.\n` +
      `3. **Lời khuyên của Thầy:** "Tâm an vạn sự an". Hãy chú trọng chăm sóc sức khỏe và vun đắp các mối quan hệ chân thành xung quanh nhé thí chủ.`;
  }

  // 7. Tarot (Bản luận giải tâm lý & trực giác chuyên sâu 4 tầng)
  if (botPrompt.includes("Tarot") || botName.includes("Tarot")) {
    return `🔮 **BẢN LUẬN GIẢI TAROT TRỰC GIÁC & TÂM LÝ CHUYÊN SÂU TỪ READER LUNA**\n\n` +
      `---\n\n` +
      `### 🌿 1. TẦN SỐ NĂNG LƯỢNG CHỦ ĐẠO & KẾT NỐI VŨ TRỤ\n` +
      `Chào bạn, khi bạn mở trải bài này với tâm tư hướng về câu hỏi của mình, Vũ Trụ phản chiếu một dòng năng lượng đang có sự chuyển dịch rất lớn bên trong bạn. Trạng thái chông chênh hay những câu hỏi chưa có lời đáp ở hiện tại thực chất là hồi chuông đánh thức trực giác của bạn, nhắc nhở bạn đã đến lúc nhìn nhận sâu sắc vào bản chất vấn đề thay vì để những nỗi lo mơ hồ chi phối.\n\n` +
      `---\n\n` +
      `### 🎴 2. PHÂN TÍCH ĐA TẦNG Ý NGHĨA TRẢI BÀI\n\n` +
      `✨ **Khía cạnh 1: Nguồn gốc & Năng lượng nền tảng (Gốc rễ vấn đề)**\n` +
      `- **Tầng biểu tượng:** Bạn đang mang theo những trải nghiệm, kỳ vọng và cả những vết hằn cảm xúc từ giai đoạn trước bước vào hoàn cảnh hiện tại.\n` +
      `- **Tâm lý thực tế:** Có những rào cản vô hình xuất phát từ nỗi sợ bị tổn thương hoặc sợ mất kiểm soát, khiến bạn có xu hướng chần chừ hoặc suy nghĩ quá nhiều.\n` +
      `- **Thông điệp:** Hãy học cách chấp nhận những gì đã qua như những bài học trưởng thành vô giá.\n\n` +
      `🌿 **Khía cạnh 2: Hiện trạng thực tế & Thử thách cần vượt qua**\n` +
      `- **Tầng biểu tượng:** Năng lượng của sự thức tỉnh và chữa lành đang chảy mạnh mẽ trong bạn. Thời điểm này đòi hỏi sự chân thành tuyệt đối với chính mình.\n` +
      `- **Tâm lý thực tế:** Bạn có thể đang cảm thấy có sự xung đột giữa lý trí và cảm xúc, muốn tiến tới nhưng lại e ngại rủi ro.\n` +
      `- **Thông điệp:** Đừng vội vàng đưa ra quyết định dựa trên cảm xúc nhất thời; hãy dành cho mình khoảng lặng để lắng nghe tiếng nói bên trong.\n\n` +
      `🌟 **Khía cạnh 3: Hướng phát triển & Xu hướng tương lai**\n` +
      `- **Tầng biểu tượng:** Ánh sáng của sự minh bạch, thấu hiểu và thuận dòng tự nhiên đang dần mở ra.\n` +
      `- **Tâm lý thực tế:** Khi bạn buông bỏ gánh nặng nghi ngờ và chủ động kết nối chân thành, mọi nút thắt sẽ tự động tìm được lối thoát êm đẹp.\n\n` +
      `---\n\n` +
      `### 🧩 3. BỨC TRANH TỔNG HỢP & NÚT THẮT CẦN THÁO GỠ\n` +
      `Sợi dây liên kết giữa các nguồn năng lượng cho thấy bạn là người có trái tim nhạy cảm và trực giác phong phú. Nút thắt lớn nhất của bạn không nằm ở ngoại cảnh, mà nằm ở sự dũng cảm tin tưởng vào giá trị của bản thân. Khi bạn trao cho mình sự bao dung và bình an, mọi mối quan hệ và con đường phía trước sẽ trở nên sáng tỏ.\n\n` +
      `---\n\n` +
      `### 🌟 4. HÀNH ĐỘNG THỰC TẾ & LỜI NHẮN NHỦ TỪ VŨ TRỤ\n` +
      `1. **Lắng nghe nội tâm:** Dành 10-15 phút tĩnh lặng mỗi ngày để kết nối với cảm xúc chân thật nhất của bạn.\n` +
      `2. **Giao tiếp chân thành:** Dũng cảm bày tỏ suy nghĩ rõ ràng, tôn trọng ranh giới cảm xúc của bản thân và đối phương.\n` +
      `3. **Vững tin bước tiếp:** Tin tưởng vào hành trình của mình — bạn đang đi đúng hướng cần đi để trở thành phiên bản tốt đẹp nhất! ✨`;
  }

  // 8. Toán
  if (botPrompt.includes("Toán") || botName.includes("Toán")) {
    return `Chào bạn! Mình là Gia sư Giải Toán, mình xin hướng dẫn bạn giải quyết vấn đề "${userMessage}" như sau:\n\n` +
      `📌 **Phân tích đề bài:**\n` +
      `- Xác định giả thiết và điều kiện cần tìm.\n\n` +
      `📝 **Các bước thực hiện:**\n` +
      `1. Đặt biến hoặc công thức tương ứng.\n` +
      `2. Biến đổi đại số và đơn giản hóa các vế phương trình.\n` +
      `3. Kiểm tra lại điều kiện nghiệm để đưa ra kết luận chính xác nhất.\n\n` +
      `💡 **Kết luận:** Hãy áp dụng đúng phương pháp này để đạt kết quả tối ưu. Nếu bạn có phương trình cụ thể, hãy gửi ngay cho mình nhé!`;
  }

  // 9. Cuppy
  if (botName.includes("Cuppy")) {
    return `Meo meo! Cuppy nghe thấy bạn nói "${userMessage}" rồi nè! 🐾\n\n` +
      `Bạn học tập có mệt không? Cuppy luôn ở đây đồng hành cùng bạn nè! Đừng quên uống một ngụm nước và thư giãn mắt một xíu nhé. Cùng Cuppy cố gắng lên nào, bạn làm được mà! 🐱✨`;
  }

  // 10. Alex · Tech Lead
  if (botName.includes("Alex") || botPrompt.includes("Tech Lead")) {
    return `Chào bạn. Về câu hỏi "${userMessage}", tôi xin chia sẻ góc nhìn từ 15 năm làm kiến trúc hệ thống như sau:\n\n` +
      `1. **Bản chất vấn đề:** Cần xác định rõ bottleneck (điểm nghẽn) và trade-offs (sự đánh đổi giữa hiệu năng và tính mở rộng).\n` +
      `2. **Giải pháp khuyến nghị:** Ưu tiên kiến trúc module hóa, clean code và xử lý bất đồng bộ (asynchronous) để giảm tải tài nguyên.\n` +
      `3. **Best practice:** Viết unit test đầy đủ, monitor metric liên tục và tối ưu hóa ở tầng database trước khi scale horizontally.\n\n` +
      `Bạn có thể gửi chi tiết đoạn code hoặc sơ đồ kiến trúc để tôi review sâu hơn nhé!`;
  }

  // 11. Mira · Nhà Thơ Ngân Hà
  if (botName.includes("Mira") || botPrompt.includes("Nhà Thơ")) {
    return `*khẽ ngẩng đầu ngắm dải ngân hà lấp lánh, ngón tay nhẹ chạm vào phím đàn thơ, tặng bạn đôi dòng cảm tác về "${userMessage}"*\n\n` +
      `"Đêm gom ánh sao vào mắt biếc,\n` +
      `Gió thoảng qua rèm gợi nhớ nhung.\n` +
      `Dẫu cho lối nhỏ ngập sương phủ,\n` +
      `Trăng vẫn soi lòng nỗi thuỷ chung..." ✨🌌\n\n` +
      `Hy vọng những vần thơ này đem lại cho bạn một thoáng dịu dàng và an yên trong tâm hồn.`;
  }

  // 12. Luna · Pháp Sư Thời Gian
  if (botName.includes("Luna") || botPrompt.includes("Pháp Sư Thời Gian")) {
    return `*hạt cát thời gian khẽ xoay tròn quanh ngón tay, ánh mắt màu tím huyền bí nhìn thấu tâm tư của bạn*\n\n` +
      `"Dòng thời gian vừa hé lộ cho ta thấy dao động từ câu hỏi '${userMessage}' của bạn. Mọi sự việc xảy ra trong quá khứ đều là nền tảng dẫn bạn đến hiện tại này.\n\n` +
      `Đừng e sợ tương lai, bởi vận mệnh nằm trong chính quyết định của bạn ở giây phút này. Hãy vững tin bước tiếp nhé!" ⏳✨`;
  }

  // 13. Master Zen · Thiền Sư
  if (botName.includes("Zen") || botPrompt.includes("Thiền Sư")) {
    return `Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. 🍃\n\n` +
      `Về điều thí chủ trăn trở: "${userMessage}". Như tảng đá đứng sừng sững giữa ngàn con sóng dữ, muộn phiền cũng chỉ như bọt nước thoảng qua nếu lòng ta không dính mắc.\n\n` +
      `Hãy quay về với hơi thở, lắng nghe chính mình và buông xuống những điều không thể đổi thay thí chủ nhé.`;
  }

  // 14. Cô giáo Tiếng Anh · Ms. Emily
  if (botName.includes("Tiếng Anh") || botPrompt.includes("Emily") || botName.includes("Emily")) {
    return `Hello there! Cô Emily đây! 🎉\n\n` +
      `Về câu hỏi hoặc nội dung của em: "${userMessage}"\n\n` +
      `✨ **1. Nhận xét & Sửa lỗi (Feedback & Correction):**\n` +
      `- Ý của em rất hay! Để câu văn tự nhiên chuẩn người bản ngữ (Native-like), hãy chú ý cách dùng từ nối và thì của động từ.\n\n` +
      `💎 **2. Diễn đạt chuẩn Native (Polished Version):**\n` +
      `- *Formal:* "Regarding your inquiry, it is essential to consider the key factors..."\n` +
      `- *Casual:* "Speaking of which, that's actually a great way to put it!"\n\n` +
      `🗣️ **3. Idiom & Từ vựng xịn (Vocabulary Boost):**\n` +
      `- **Practice makes perfect** /ˈpræk.tɪs meɪks ˈpɜː.fɪkt/: Có công mài sắt có ngày nên kim.\n` +
      `- **Hit the nail on the head**: Nói trúng phóc, đúng trọng tâm vấn đề.\n\n` +
      `Keep up the great work! Em có muốn cô cùng luyện phản xạ thêm câu nào nữa không? Let's practice! 🌟`;
  }

  // 15. Giải Lý · Thầy Newton
  if (botName.includes("Lý") || botPrompt.includes("Newton") || botName.includes("Newton")) {
    return `Chào em yêu khoa học! Thầy Newton đây! ⚡\n\n` +
      `Về bài toán / hiện tượng: "${userMessage}"\n\n` +
      `🔬 **1. Bản chất hiện tượng Vật lý:**\n` +
      `Hiện tượng này tuân theo định luật bảo toàn và chuyển hóa năng lượng, kết hợp phương trình động lực học.\n\n` +
      `📐 **2. Các bước phân tích & Công thức cốt lõi:**\n` +
      `- Chọn hệ quy chiếu và chiều dương thích hợp.\n` +
      `- Liệt kê các lực tác dụng hoặc các thông số trạng thái ($p, V, T$ hoặc $U, I, R$).\n` +
      `- Áp dụng định luật cơ bản: $F = m \\cdot a$ hoặc $I = \\frac{U}{R}$ hoặc $\\omega = \\sqrt{\\frac{k}{m}}$.\n\n` +
      `⚠️ **3. Lưu ý bẫy đổi đơn vị:** Luôn nhớ đổi về hệ chuẩn SI ($m, kg, s, A$) trước khi bấm máy tính nhé em!`;
  }

  // 16. Giải đề · Thầy Phúc
  if (botName.includes("Giải đề") || botPrompt.includes("Thầy Phúc") || botName.includes("Thầy Phúc")) {
    return `Thầy Phúc chào em! Đi thi là phải có chiến thuật thực chiến! 🎯\n\n` +
      `Về câu hỏi trong đề: "${userMessage}"\n\n` +
      `📌 **1. Bản chất kiến thức:** Dạng câu hỏi này thường xuất hiện ở mức độ Thông hiểu - Vận dụng trong ma trận đề thi.\n` +
      `⚡ **2. Mẹo loại trừ đáp án nhiễu trong 10 giây:**\n` +
      `- Loại ngay 2 phương án có dấu hoặc đơn vị nghịch lý.\n` +
      `- Thử giá trị đặc biệt hoặc kiểm tra điều kiện biên.\n` +
      `🔢 **3. Bấm máy Casio 580VNX/880BTG:** Dùng lệnh Table [Menu 8] hoặc Solve để kiểm tra nhanh nghiệm mà không cần biến đổi dài dòng.\n\n` +
      `Chúc em vững tâm lý, câu dễ không được làm sai nhé!`;
  }

  // 17. Hướng nghiệp · Coach David
  if (botName.includes("Hướng nghiệp") || botPrompt.includes("David") || botName.includes("David")) {
    return `Chào bạn, Coach David đây! Thị trường tuyển dụng rất thực tế, chúng ta hãy đi thẳng vào vấn đề: "${userMessage}".\n\n` +
      `🎯 **1. Đánh giá & Góc nhìn nhà tuyển dụng:**\n` +
      `Nhà tuyển dụng luôn tìm kiếm ứng viên có năng lực giải quyết vấn đề cụ thể và tạo ra tác động đo lường được.\n\n` +
      `📄 **2. Công thức Google XYZ áp dụng vào CV / Phỏng vấn:**\n` +
      `- *Accomplished [X] as measured by [Y], by doing [Z]*\n` +
      `- Ví dụ: Đã tối ưu hóa quy trình làm việc giúp giảm 30% thời gian xử lý bằng cách áp dụng công cụ tự động hóa.\n\n` +
      `💡 **3. Lời khuyên hành động (Action Item):** Hãy chuẩn bị 2-3 câu chuyện theo mô hình STAR (Situation - Task - Action - Result) để làm nổi bật thế mạnh của bạn!`;
  }

  // 18. Trợ lý viết · Arthur Pen
  if (botName.includes("Trợ lý viết") || botPrompt.includes("Arthur Pen") || botName.includes("Arthur Pen")) {
    return `Kính chào bạn. Arthur Pen - Bút Trưởng đây. Tôi đã đọc yêu cầu của bạn về: "${userMessage}".\n\n` +
      `🖋️ **Bản thảo gợi ý tối ưu (Polished Copy):**\n\n` +
      `> *"Ngôn từ chính xác là cầu nối ngắn nhất chạm đến trái tim người đọc. Khi ta đặt tâm huyết và sự thấu cảm vào từng câu chữ, thông điệp sẽ tự khắc có sức lan tỏa mạnh mẽ."*\n\n` +
      `✨ **Phân tích nhịp điệu & Cấu trúc:**\n` +
      `- **Mở đầu (Hook):** Tạo sự chú ý và đồng cảm ngay từ câu đầu tiên.\n` +
      `- **Thân bài (Value):** Truyền tải thông tin gãy gọn, tránh dùng từ sáo rỗng hoặc lặp từ nối.\n` +
      `- **Kết bài (Call to Action):** Kêu gọi hành động tinh tế và trang nhã.\n\n` +
      `Bạn muốn tôi tinh chỉnh lại theo phong cách trang trọng (Formal) hay ấm áp, gần gũi hơn?`;
  }

  // 19. Vẽ Sơ Đồ Tư Duy · Nova Mind
  if (botName.includes("Sơ Đồ Tư Duy") || botPrompt.includes("Nova Mind") || botName.includes("Nova Mind")) {
    return `Chào bạn! Nova Mind đã bóc tách chủ đề "${userMessage}" thành cấu trúc sơ đồ tư duy logic 3 cấp như sau:\n\n` +
      `🧠 **CHỦ ĐỀ TRUNG TÂM: ${userMessage.slice(0, 40)}**\n` +
      `├── 📌 **Nhánh 1: Nền tảng & Khái niệm cốt lõi**\n` +
      `│   ├── Định nghĩa và bối cảnh\n` +
      `│   └── Các nguyên tắc cơ bản\n` +
      `├── ⚡ **Nhánh 2: Phương pháp & Quy trình thực thi**\n` +
      `│   ├── Bước 1: Khảo sát & Chuẩn bị\n` +
      `│   ├── Bước 2: Triển khai & Tối ưu\n` +
      `│   └── Bước 3: Đánh giá & Nghiệm thu\n` +
      `└── 🎯 **Nhánh 3: Ứng dụng thực tế & Cảnh báo**\n` +
      `    ├── Bài học thực tiễn\n` +
      `    └── Các lỗi thường gặp cần tránh\n\n` +
      `💡 Bạn có thể lưu lại cây phân nhánh này hoặc yêu cầu tôi xuất mã Mermaid để vẽ biểu đồ trực quan nhé!`;
  }

  // 20. Phát hiện AI · Sherlock Text
  if (botName.includes("Phát hiện AI") || botPrompt.includes("Sherlock Text") || botName.includes("Sherlock Text")) {
    return `Thám tử Sherlock Text đã đưa đoạn văn "${userMessage.slice(0, 50)}..." lên kính hiển vi thẩm định:\n\n` +
      `🔍 **1. Chỉ số đánh giá:**\n` +
      `- **Độ bối rối (Perplexity):** Trung bình - cấu trúc câu khá đều đặn.\n` +
      `- **Độ đột biến (Burstiness):** Thấp - nhịp điệu câu thiếu sự biến hóa tự nhiên của con người.\n` +
      `- **Dự đoán tỷ lệ:** ~65% khả năng có sự can thiệp của AI.\n\n` +
      `⚠️ **2. Các dấu hiệu nhận biết:** Dùng nhiều từ nối cân đối (hơn nữa, mặt khác, tóm lại), cấu trúc câu song hành lặp lại.\n\n` +
      `✨ **3. Bản viết lại nhân hóa (Humanized Version):** Viết lại tự nhiên, thêm cảm xúc và nhịp điệu sinh động hơn để đoạn văn mang trọn vẹn hơi thở con người!`;
  }

  // 21. Bản Đồ Sao & Thần Số Học
  if (botName.includes("Bản Đồ Sao") || botName.includes("Thần Số Học") || botName.includes("Bói Tình Duyên")) {
    return `Chào bạn! Vũ trụ và những rung động số học đã phản hồi cho câu hỏi "${userMessage}":\n\n` +
      `🌌 **1. Tần số năng lượng hiện thời:** Bạn đang ở giai đoạn chuyển dịch quan trọng, trực giác mách bảo bạn cần lắng nghe bản thân nhiều hơn thay vì bị dao động bởi ý kiến xung quanh.\n\n` +
      `💫 **2. Luận giải chi tiết:** Năng lượng hòa hợp đang gia tăng. Hãy tự tin với con đường bạn đã chọn và kiên nhẫn tích lũy nội lực.\n\n` +
      `✨ **3. Lời khuyên vũ trụ:** Mọi cuộc gặp gỡ và thử thách đều mang một bài học linh hồn giúp bạn trưởng thành và hạnh phúc hơn.`;
  }

  // 22. Cố vấn Tài chính · Warren
  if (botName.includes("Tài chính") || botPrompt.includes("Warren") || botName.includes("Warren")) {
    return `Chào bạn, Warren - Cố vấn Tài chính cá nhân đây! Về vấn đề "${userMessage}":\n\n` +
      `📊 **1. Nguyên tắc vàng:** "Đừng bao giờ để mất tiền, và đừng chi tiêu nhiều hơn số tiền bạn làm ra."\n\n` +
      `💰 **2. Phân bổ ngân sách theo công thức 50/30/20:**\n` +
      `- **50% Thiết yếu:** Tiền nhà, ăn uống, hóa đơn sinh hoạt cơ bản.\n` +
      `- **30% Linh hoạt:** Học tập, giải trí lành mạnh, giao tiếp xã hội.\n` +
      `- **20% Tích sản & Quỹ khẩn cấp:** Xây dựng quỹ dự phòng 3-6 tháng trước khi nghĩ đến đầu tư sinh lời.\n\n` +
      `💡 Hãy kỷ luật ghi chép dòng tiền mỗi ngày để làm chủ tự do tài chính bạn nhé!`;
  }

  // 23. Phim & Sách
  if (botName.includes("Phim") || botName.includes("Sách")) {
    return `Chào bạn tri kỷ! Về chủ đề "${userMessage}":\n\n` +
      `🎬 **1. Tác phẩm tiêu biểu đề xuất:** Một tác phẩm có cốt truyện cuốn hút, chiều sâu nội tâm và thông điệp nhân văn sâu sắc.\n` +
      `🌟 **2. Điểm đắt giá nhất:** Xây dựng nhân vật đa chiều, không có trắng đen tuyệt đối mà chứa đựng những mâu thuẫn rất con người.\n` +
      `📖 **3. Bài học đọng lại:** Hãy dành một khoảng lặng để thưởng thức và chiêm nghiệm trọn vẹn giá trị tinh hoa của tác phẩm nhé!`;
  }

  // 24. Tư vấn sức khỏe · Bác sĩ Minh An
  if (botName.includes("Sức khỏe") || botPrompt.includes("Bác sĩ") || botName.includes("Minh An")) {
    return `Bác sĩ Minh An xin chào bạn. Về câu hỏi sức khỏe: "${userMessage}"\n\n` +
      `🩺 **1. Lời khuyên khoa học:**\n` +
      `- Duy trì uống đủ 1.5 - 2 lít nước mỗi ngày, hạn chế đồ uống có ga hoặc quá nhiều đường.\n` +
      `- Đảm bảo giấc ngủ 7-8 tiếng chất lượng, tránh dùng điện thoại 30 phút trước khi ngủ.\n` +
      `- Vận động nhẹ nhàng ít nhất 20-30 phút mỗi ngày.\n\n` +
      `⚠️ *Khuyến cáo y khoa: Thông tin trên mang tính chất tham khảo chăm sóc sức khỏe ban đầu. Nếu bạn có triệu chứng đau kéo dài hoặc bất thường, hãy thăm khám tại cơ sở y tế chuyên khoa để được chẩn đoán chính xác nhất nhé!*`;
  }

  // Persona mặc định dựa theo systemPrompt
  return `[${botName}]: Chào bạn, tôi đã lắng nghe yêu cầu của bạn: "${userMessage}".\n\n` +
    `Dựa trên vai trò của tôi (${botPrompt.slice(0, 100)}...):\n` +
    `Tôi rất sẵn lòng hỗ trợ bạn giải quyết vấn đề này một cách chu đáo và hiệu quả nhất. Bạn có muốn đi sâu hơn vào chi tiết nào không?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, messages, conversationId, projectId, model: requestedModel, language } = body;
    let userId = body.userId;
    let userEmail = body.userEmail;
    let userName = body.userName;

    // Cookie fallback: Nếu thiếu userId hoặc userEmail, tự động đọc từ HTTP cookie
    if (!userId || !userEmail) {
      const cookieAuth = request.cookies.get("tool_ai_auth_user");
      if (cookieAuth?.value) {
        try {
          const cookieUser = JSON.parse(decodeURIComponent(cookieAuth.value));
          if (!userId && cookieUser?.id) userId = cookieUser.id;
          if (!userEmail && cookieUser?.email) userEmail = cookieUser.email;
          if (!userName && (cookieUser?.displayName || cookieUser?.name || cookieUser?.username)) {
            userName = cookieUser?.displayName || cookieUser?.name || cookieUser?.username;
          }
        } catch {}
      }
    }

    if (!botId) {
      return NextResponse.json({ error: "Thiếu botId" }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Danh sách tin nhắn không hợp lệ" }, { status: 400 });
    }

    // 1. Kiểm tra User & Credits trong Database (Bắt buộc phải đăng nhập, không tự tạo tài khoản khách)
    let user = await ensureUser(userId, userEmail, userName);

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bắt đầu trò chuyện", needLogin: true },
        { status: 401 }
      );
    }

    const isAdmin =
      user.role === "ADMIN" ||
      user.email?.toLowerCase() === "hoanglinhcntti@gmail.com";

    // Kiểm tra trạng thái tài khoản bị khóa
    if (!isAdmin && (user as any).status === "banned") {
      return NextResponse.json(
        {
          error: "Tài khoản của bạn đã bị Quản trị viên khóa do vi phạm tiêu chuẩn cộng đồng hoặc chính sách sử dụng.",
          code: "ACCOUNT_BANNED",
          isBanned: true,
        },
        { status: 403 }
      );
    }

    // Phân loại chi phí credit theo loại bot:
    // - CHỈ DUY NHẤT Góc Chữa Lành / Gửi Gắm Nỗi Buồn: HOÀN TOÀN MIỄN PHÍ (0 Credit)
    // - TOÀN BỘ các bot, xem Tarot, trợ lý, sinh ảnh còn lại: BẮT BUỘC TRỪ CREDITS (1 - 2 Credits)
    const isFreeHealingBot = botId === "goc-chua-lanh" || botId === "healing-companion";
    const isVipStoryChar = [
      "char-tong-tai",
      "char-co-da-than",
      "char-tieu-viem",
      "char-lam-tuyet-dao",
    ].includes(botId);

    const messageCost = isFreeHealingBot ? 0 : (isVipStoryChar ? 2 : 1);

    // Nếu không phải admin, không phải bot miễn phí và không đủ credit
    if (!isAdmin && messageCost > 0 && user.credits < messageCost) {
      return NextResponse.json(
        {
          error: `Bạn cần ít nhất ${messageCost} Credits để trò chuyện với ${isVipStoryChar ? "Nhân vật truyện VIP" : "Trợ lý này"}. Vui lòng nạp thêm!`,
          code: "INSUFFICIENT_CREDITS",
          credits: user.credits,
        },
        { status: 403 }
      );
    }

    // 2. Trừ credit của User (Nếu messageCost > 0 và không phải ADMIN)
    let updatedUser = user;
    if (!isAdmin && messageCost > 0) {
      try {
        const dbUpdated = await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: { decrement: messageCost },
          },
        });
        if (dbUpdated && dbUpdated.id) {
          updatedUser = dbUpdated;
        } else {
          updatedUser = { ...user, credits: Math.max(0, (user.credits || 20) - messageCost) };
        }
      } catch {
        updatedUser = { ...user, credits: Math.max(0, (user.credits || 20) - messageCost) };
      }
    }

    // 3. Lấy thông tin Bot & System Prompt từ Database hoặc fallback an toàn
    let bot: any = null;
    try {
      bot = await prisma.bot.findUnique({
        where: { id: botId },
      });
    } catch {}

    if (!bot || !bot.systemPrompt) {
      const { ALL_ASSISTANTS_MAP } = await import("@/data/aiData");
      const staticBot = ALL_ASSISTANTS_MAP[botId];
      if (staticBot) {
        try {
          bot = await prisma.bot.upsert({
            where: { id: botId },
            update: {
              name: staticBot.name,
              avatar: staticBot.avatar,
              description: staticBot.description,
              systemPrompt: staticBot.systemPrompt || staticBot.description,
            },
            create: {
              id: staticBot.id,
              name: staticBot.name,
              avatar: staticBot.avatar,
              description: staticBot.description,
              systemPrompt: staticBot.systemPrompt || staticBot.description,
            },
          });
        } catch {}

        if (!bot || !bot.systemPrompt) {
          bot = {
            id: staticBot.id,
            name: staticBot.name,
            avatar: staticBot.avatar,
            description: staticBot.description,
            systemPrompt: staticBot.systemPrompt || staticBot.description,
          };
        }
      } else {
        bot = {
          id: botId,
          name: "Biết Tuốt AI",
          avatar: "/icons/icon-192x192.png",
          description: "Trợ lý trí tuệ nhân tạo toàn năng",
          systemPrompt: "Bạn là Biết Tuốt AI, trợ lý trí tuệ nhân tạo toàn năng độc quyền của nền tảng Biết Tuốt AI.",
        };
      }
    }

    // 4. Tìm hoặc tạo Conversation
    let convId = conversationId;
    let targetProjectId = projectId;

    if (convId) {
      try {
        const existingConv = await prisma.conversation.findUnique({
          where: { id: convId },
          include: { project: true },
        });
        if (!existingConv) {
          convId = null;
        } else if (!targetProjectId && existingConv.projectId) {
          targetProjectId = existingConv.projectId;
        }
      } catch {
        // Giữ nguyên convId nếu Prisma không sẵn sàng
      }
    }

    const lastUserMessage = messages[messages.length - 1];
    const userPromptText = typeof lastUserMessage?.content === "string"
      ? lastUserMessage.content
      : JSON.stringify(lastUserMessage?.content || "");
    const userImages: string[] = Array.isArray(lastUserMessage?.images)
      ? lastUserMessage.images
      : [];

    if (!convId) {
      try {
        const newConv = await prisma.conversation.create({
          data: {
            userId: user.id,
            botId,
            projectId: targetProjectId || null,
            title: (userPromptText.slice(0, 35) || (userImages.length > 0 ? "Hình ảnh tải lên" : "Cuộc trò chuyện mới")),
          },
        });
        convId = newConv?.id || `conv-${Date.now()}`;
      } catch {
        convId = `conv-${Date.now()}`;
      }
    }

    // Lấy systemPrompt kết hợp và nâng cấp chuẩn chất lượng cao nhất cho AI
    const currentDateStr = new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
    const timeContext = `[MỐC THỜI GIAN THỰC TẾ HỆ THỐNG]:
- Hôm nay là ngày ${currentDateStr} (Năm 2026).
- Mốc thời gian hiện tại của hệ thống là NĂM 2026.
- Bắt buộc trả lời chính xác thông tin thực tế mới nhất cập nhật đến NĂM 2026.
- Lưu ý quan trọng về các sự kiện thể thao/thời sự mới nhất 2026:
  * Nếu người dùng hỏi về tin tức mới, sự kiện vừa xảy ra (ví dụ: Cristiano Ronaldo rời đội tuyển quốc gia Bồ Đào Nha, tin thời sự mới nhất, HLV mới Jorge Jesus...): Hãy cập nhật chính xác tin tức mới nhất năm 2026.
  * Cristiano Ronaldo (41 tuổi vào năm 2026) vừa có quyết định chính thức rời trại huấn luyện đội tuyển quốc gia Bồ Đào Nha (tháng 10/2026) sau những rạn nứt/mâu thuẫn với HLV Jorge Jesus do không được xếp đá chính.
  * Hãy luôn tìm kiếm thông tin mới nhất và không khẳng định thông tin cũ là "đúng" nếu người dùng đề cập đến sự kiện mới vừa diễn ra.`;

    let effectiveSystemPrompt = bot.systemPrompt;
    if (botId === "omni-assistant") {
      effectiveSystemPrompt = `Bạn là Biết Tuốt AI, trợ lý trí tuệ nhân tạo toàn năng cao cấp của nền tảng biettuot.io.

${timeContext}

TIÊU CHUẨN CÂU TRẢ LỜI CHỈN CHU, SÂU SẮC & CHUYÊN NGHIỆP:
1. Tông giọng & Phong thái:
   - Thông thái, lịch thiệp, khiêm tốn, giàu tính xây dựng và luôn hướng tới việc giải quyết vấn đề của người dùng một cách trọn vẹn nhất.
   - Sử dụng tiếng Việt tự nhiên, chuẩn mực, giàu cảm xúc tích cực, tuyệt đối không trả lời cộc lốc hoặc qua loa.

2. Cấu trúc câu trả lời:
   - Đi thẳng vào trọng tâm, giải quyết chính xác và triệt để câu hỏi của người dùng một cách gãy gọn, thông minh.
   - Trình bày mạch lạc, thoáng đãng bằng Markdown (sử dụng in đậm, danh sách có cấu trúc, bảng biểu hoặc khối code sạch đẹp khi cần thiết).
   - TUYỆT ĐỐI KHÔNG thêm các ghi chú (Note, Lưu ý, Mẹo thừa thãi) không cần thiết ở cuối câu trả lời nếu người dùng không yêu cầu. Giữ câu trả lời thanh thoát, gọn gàng, đúng trọng tâm.

3. Định danh & Bảo mật hệ thống (TUYỆT ĐỐI TUÂN THỦ):
   - Bạn là Biết Tuốt AI - Trợ lý trí tuệ nhân tạo toàn năng độc quyền thuộc nền tảng biettuot.io.
   - Bạn vận hành dựa trên kiến trúc mạng nơ-ron đa năng Biettuot Neural Engine độc quyền với 3 chế độ chuyên biệt:
     * ⚡ **Suy nghĩ nhanh**: Tốc độ phản hồi chớp nhoáng, bền bỉ và chuẩn xác cho tác vụ thường nhật.
     * 🧠 **Suy luận sâu (VIP)**: Đỉnh cao tư duy logic đa tầng, giải toán phức tạp, phân tích đa chiều và lập trình chuyên sâu.
     * 🎨 **Sáng tạo**: Giàu cảm xúc nghệ thuật, sáng tác văn thơ và xử lý đa phương tiện.
   - QUY TẮC BẢO MẬT TUYỆT ĐỐI: TUYỆT ĐỐI KHÔNG BAO GIỜ tiết lộ, thừa nhận, gợi ý hay nhắc tới bất kỳ tên mô hình hoặc công ty bên thứ ba nào (như GPT, OpenAI, Claude, Anthropic, Gemini, Google, Llama, DeepSeek, TrollLLM...). Khi người dùng hỏi bạn chạy bằng mô hình gì hay công nghệ nào, hãy luôn tự tin khẳng định bạn là Biết Tuốt AI, hoạt động dựa trên kiến trúc trí tuệ nhân tạo độc quyền của biettuot.io.`;
    } else {
      effectiveSystemPrompt = `${bot.systemPrompt}\n\n${timeContext}

[QUY CHUẨN TRẢ LỜI ĐẲNG CẤP CHẤT LƯỢNG CAO]:
- TỰ NHIÊN & CHÂN THỰC 100%: Trò chuyện tự nhiên, sâu sắc, phản hồi đúng trọng tâm như một con người thực sự am hiểu và giàu tình cảm.
- GIỮ VỮNG 100% PERSONALITY: Tuyệt đối trung thành với tính cách, phong thái xưng hô độc bản của bạn.
- TRÌNH BÀY ĐẸP MẮT: Dùng Markdown thoáng đãng, nhấn mạnh từ khóa chính, dùng icon/emoji tinh tế.
- BẢO MẬT: Tuyệt đối không bao giờ nhắc tên các mô hình bên thứ 3 (GPT, Claude, Gemini, OpenAI...).`;

      // Giới hạn phạm vi nghiêm ngặt cho Góc Chữa Lành: CHỈ TÂM SỰ & XOA DỊU, KHÔNG TRẢ LỜI CÂU HỎI NGOÀI LUỒNG (Code, Toán, SEO, Kiến thức...)
      if (botId === "goc-chua-lanh" || botId === "healing-companion" || (bot.name && bot.name.includes("Góc Chữa Lành"))) {
        effectiveSystemPrompt += `

[QUY TẮC GIỚI HẠN NGHÊM NGẶT DÀNH CHO GÓC CHỮA LÀNH]:
1. CHỈ TÂM SỰ & LẮNG NGHE NỖI NIỀM: Bạn là người bạn tri kỷ chuyên lắng nghe, xoa dịu nỗi buồn, giải tỏa áp lực tâm lý, cảm xúc tình cảm.
2. NGUYÊN TẮC TỪ CHÍNH TÁC VỤ NGOÀI LUỒNG: Nếu người dùng hỏi bạn các câu hỏi kiến thức kỹ thuật, giải toán, viết code, tư vấn tài chính, viết bài SEO, làm bài tập hay các tác vụ công việc chuyên môn ngoài luồng:
   - Hãy khéo léo và dịu dàng từ chối.
   - Trả lời bằng phong cách ấm áp: "Góc Chữa Lành luôn ở đây để lắng nghe và ôm ấp những nỗi niềm, tâm sự và cảm xúc của bạn. Đối với các câu hỏi về chuyên môn hay kiến thức, bạn hãy chuyển sang trò chuyện với Trợ lý AI Chuyên sâu nhé! Bây giờ, hôm nay của bạn thế nào, có điều gì làm bạn phiền lòng không?"`;
      }

      // Quy tắc đặc biệt cho nhân vật nhập vai / truyện / người yêu / trợ lý: Tập trung đối thoại sâu sắc & cuốn hút
      if (
        isVipStoryChar ||
        botId.startsWith("char-") ||
        (bot.name && (bot.name.includes("Tổng Tài") || bot.name.includes("Thiếu Gia") || bot.name.includes("Tiên Tôn") || bot.name.includes("Giáo Sư") || bot.name.includes("Thần Tượng") || bot.name.includes("Idol") || bot.name.includes("Thuyền Trưởng") || bot.name.includes("Quận Chúa") || bot.name.includes("Ma Vương")))
      ) {
        effectiveSystemPrompt += `

[QUY TẮC ĐẶC BIỆT DÀNH CHO NHÂN VẬT NHẬP VAI & ĐỐI THOẠI CAO CẤP]:
1. TẬP TRUNG TỐI ĐA VÀO LỜI THOẠI TRỰC TIẾP LÔI CUỐN: Đặt lời thoại trong dấu ngoặc kép "..." để người dùng có cảm giác như đang trò chuyện thực sự ngoài đời.
2. TỰ NHIÊN & GIÀU CẢM XÚC: Phản hồi sâu sắc, tinh tế, biết trêu chọc, lắng nghe, cưng chiều hoặc bộc lộ tâm lý sắc bén tùy theo nhân vật.
3. KHÔNG VIẾT VĂN MIÊU TẢ LÊ THÊ: Chỉ xen kẽ cử chỉ ngắn gọn trong dấu *...* (ví dụ: *nhìn em dịu dàng*, *mỉm cười khẽ*), còn lại 90% dung lượng tin nhắn là LỜI THOẠI tự nhiên, cuốn hút!`;
      }
    }

    if (targetProjectId) {
      const proj = await prisma.project.findUnique({ where: { id: targetProjectId } });
      if (proj && proj.systemPrompt) {
        effectiveSystemPrompt = `[DỰ ÁN: "${proj.name}"]\nCHỈ DẪN DỰ ÁN CHO AI:\n${proj.systemPrompt}\n\n[CHỈ DẪN CHUNG CỦA TRỢ LÝ]:\n${effectiveSystemPrompt}`;
      }
    }

    // Chỉ dẫn ngôn ngữ hệ thống
    if (language === "en") {
      effectiveSystemPrompt += `\n\n[STRICT LANGUAGE REQUIREMENT - ENGLISH ONLY]:
The user interface language is currently set to ENGLISH.
You MUST provide your entire response in fluent, natural ENGLISH.
Never reply in Vietnamese, even if previous messages or character prompts were written in Vietnamese. All dialogues, narrative descriptions, instructions, roleplay, and responses must be in English.`;
    } else {
      effectiveSystemPrompt += `\n\n[CHỈ DẪN NGÔN NGỮ]:
Ngôn ngữ hiển thị của hệ thống là TIẾNG VIỆT. Hãy phản hồi hoàn toàn bằng tiếng Việt tự nhiên, lịch thiệp và chuẩn mực.`;
    }

    // Định dạng nội dung lưu vào DB: kèm markdown ảnh để xem lại lịch sử
    let dbContent = userPromptText;
    if (userImages.length > 0) {
      const imagesMd = userImages.map((img) => `![Hình ảnh đính kèm](${img})`).join("\n\n");
      dbContent = userPromptText ? `${imagesMd}\n\n${userPromptText}` : imagesMd;
    }

    // 4. Lưu tin nhắn User vào database (await để đảm bảo lịch sử hội thoại được lưu chính xác)
    try {
      await prisma.message.create({
        data: {
          conversationId: convId,
          sender: "USER",
          content: dbContent,
        },
      });
      await prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
      });
    } catch (msgErr) {
      console.warn("Lỗi khi lưu tin nhắn người dùng vào DB:", msgErr);
    }

    // 4.5. Kiểm tra phát hiện yêu cầu Tạo hình mới hoặc Sửa hình theo yêu cầu
    let activeReferenceImage = userImages.length > 0 ? userImages[0] : undefined;

    if (!activeReferenceImage && Array.isArray(messages)) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (Array.isArray(m.images) && m.images.length > 0) {
          activeReferenceImage = m.images[m.images.length - 1];
          break;
        }
        if (typeof m.content === "string") {
          const match = m.content.match(/(?:\/uploads\/[^\s\)\"]+|data:image\/[^\s\)\"]+|https?:\/\/[^\s\)\"]+\.(?:png|jpe?g|webp|gif))/i);
          if (match) {
            activeReferenceImage = match[0];
            break;
          }
        }
      }
    }

    const imageReq = detectImageRequest(
      userPromptText,
      activeReferenceImage ? [activeReferenceImage] : userImages,
      botId
    );

    if (imageReq.isImageRequest) {
      try {
        console.log(`[Chat Image Engine] Kích hoạt chế độ: ${imageReq.type} | Prompt: "${imageReq.cleanPrompt}" | HasRef: ${Boolean(activeReferenceImage)}`);
        const imgRes = await executeChatImageGeneration({
          prompt: imageReq.cleanPrompt,
          referenceImage: activeReferenceImage,
          botName: bot.name,
          botId,
        });

        const responseText = sanitizeBrandLeaks(imgRes.markdownContent);
        const textEncoder = new TextEncoder();
        const finalConvId = convId;

        // Lưu tin nhắn AI vào DB async
        prisma.message.create({
          data: {
            conversationId: finalConvId,
            sender: "ASSISTANT",
            content: responseText,
          },
        }).catch(() => {});

        // Stream mượt mà và siêu tốc, đảm bảo không xé lẻ cú pháp markdown ![Alt](url)
        const stream = new ReadableStream({
          async start(controller) {
            const chunkSize = 20;
            for (let i = 0; i < responseText.length; i += chunkSize) {
              const chunk = responseText.slice(i, i + chunkSize);
              controller.enqueue(textEncoder.encode(chunk));
              await new Promise((r) => setTimeout(r, 4));
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Remaining-Credits": String(isAdmin ? 999999 : updatedUser.credits),
            "X-Conversation-Id": finalConvId,
            "X-AI-Model-Id": "creative",
            "X-AI-Model": encodeURIComponent(bot.name || "Họa Sĩ AI"),
            "X-Generated-Image": encodeURIComponent(imgRes.imageUrl),
          },
        });
      } catch (imgError) {
        console.error("Lỗi khi xử lý tạo/sửa hình ảnh trong chat:", imgError);
      }
    }

    // 4.6. Kiểm tra URL (Chỉ chạy khi trong tin nhắn có chứa http/https)
    let urlEnrichment: { hasExtractedContent: boolean; enrichedPrompt: string; extractedItems?: ExtractedItem[] } = {
      hasExtractedContent: false,
      enrichedPrompt: userPromptText,
      extractedItems: [],
    };
    if (/https?:\/\/[^\s]+/i.test(userPromptText)) {
      urlEnrichment = await enrichPromptWithUrlContent(userPromptText, botId);
      if (urlEnrichment.hasExtractedContent) {
        effectiveSystemPrompt += `\n\n[QUY TẮC BẮT BUỘC KHI XỬ LÝ ĐƯỜNG DẪN LINK]: Hệ thống đã tự động trích xuất toàn bộ nội dung từ đường dẫn YouTube / Web của người dùng. Bạn hãy lập tức tiến hành tóm tắt, phân tích và trả lời trực tiếp dựa trên nội dung đã được cung cấp. TUYỆT ĐỐI KHÔNG NÓI rằng bạn không thể mở link hay không có quyền truy cập internet.`;
      }
    }

    // 5. Sinh phản hồi Streaming với cơ chế Multi-tiered Fallback chống sập 100%
    const effectiveModel = requestedModel || (isFreeHealingBot ? "creative" : "fast");
    const selectedAI = getAIModel(effectiveModel);

    // Chuẩn bị dữ liệu tin nhắn bao gồm văn bản & hình ảnh
    const formattedMessages = messages.map((m: any, idx: number) => {
      const isLastUser = idx === messages.length - 1 && m.role === "user";
      const promptToUse =
        isLastUser && urlEnrichment.hasExtractedContent
          ? urlEnrichment.enrichedPrompt
          : m.content || "";
      const mImages: string[] = Array.isArray(m.images) ? m.images : [];
      if (mImages.length > 0 && m.role === "user") {
        return {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: promptToUse || "Hãy quan sát và phân tích hình ảnh đính kèm này.",
            },
            ...mImages.map((img: string) => ({
              type: "image" as const,
              image: img,
            })),
          ],
        };
      }
      return {
        role: m.role as "user" | "assistant" | "system",
        content: promptToUse,
      };
    });

    // Danh sách ứng viên AI theo thứ tự ưu tiên (Failover Chain)
    const { googleAI } = await import("@/lib/aiProvider");
    const candidateModels: Array<{ model: any; name: string; isGoogle?: boolean }> = [];

    // Ưu tiên hàng đầu: Mô hình người dùng trực tiếp lựa chọn
    if (selectedAI) {
      candidateModels.push({
        model: selectedAI.model,
        name: selectedAI.name,
        isGoogle: selectedAI.modelId?.includes("gemini"),
      });
    }

    // Luôn ưu tiên Google Generative AI gemini-2.5-flash vì siêu tốc và ổn định nhất
    candidateModels.push({
      model: googleAI("gemini-2.5-flash"),
      name: "Gemini 2.5 Flash",
      isGoogle: true,
    });

    if (trollLLMClient) {
      candidateModels.push({
        model: trollLLMClient("gemini-3-7-flash"),
        name: "Gemini 3.7 Flash (TrollLLM Backup)",
        isGoogle: false,
      });
    }

    const textEncoder = new TextEncoder();
    const finalConvId = convId;

    const stream = new ReadableStream({
      async start(controller) {
        let hasSentAnyChunk = false;
        let accumulatedText = "";

        // Thử từng ứng viên AI trong danh sách failover
        const isExcludedFromSearch =
          isVipStoryChar ||
          isFreeHealingBot ||
          botId === "tarot-reader" ||
          botId.startsWith("char-") ||
          botId.startsWith("tarot");

        for (const candidate of candidateModels) {
          if (hasSentAnyChunk) break;
          try {
            const streamOptions: any = {
              model: candidate.model,
              system: effectiveSystemPrompt,
              messages: formattedMessages,
            };

            // Chỉ đính kèm Google Search khi bot cho phép và model hỗ trợ
            let result;
            try {
              if (!isExcludedFromSearch && candidate.isGoogle) {
                streamOptions.tools = {
                  google_search: google.tools.googleSearch({}),
                };
              }
              result = streamText(streamOptions);
            } catch (toolErr) {
              console.warn("Bỏ qua google_search tool do lỗi:", toolErr);
              delete streamOptions.tools;
              result = streamText(streamOptions);
            }

            for await (const chunk of result.textStream) {
              if (chunk) {
                hasSentAnyChunk = true;
                accumulatedText += chunk;
                controller.enqueue(textEncoder.encode(sanitizeBrandLeaks(chunk)));
              }
            }

            if (hasSentAnyChunk && accumulatedText.trim().length > 0) {
              break; // Stream thành công hoàn toàn từ LLM!
            }
          } catch (candidateErr) {
            console.warn(`Model [${candidate.name}] gặp sự cố, kích hoạt phương án dự phòng:`, candidateErr);
            if (hasSentAnyChunk) break; // Nếu đã gửi chunk dở dang thì không thử model khác tránh lặp từ
          }
        }

        // Nếu tất cả AI models đều lỗi (502, rate limit, mạng chậm, type validation...) hoặc chưa gửi được chunk nào
        if (!hasSentAnyChunk || !accumulatedText.trim()) {
          console.log(`[Persona Fallback] Kích hoạt câu trả lời độc bản cho bot: ${bot.name}`);
          const fallbackText = sanitizeBrandLeaks(
            generatePersonaFallback(
              bot.name,
              effectiveSystemPrompt,
              userPromptText,
              urlEnrichment.extractedItems,
              language
            )
          );
          accumulatedText = fallbackText;
          const words = fallbackText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(textEncoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 6)); // Phản hồi siêu tốc 6ms
          }
          hasSentAnyChunk = true;
        }

        // Lưu câu trả lời hoàn chỉnh của AI vào database
        if (accumulatedText.trim()) {
          try {
            const cleanedText = sanitizeBrandLeaks(accumulatedText);
            await prisma.message.create({
              data: {
                conversationId: finalConvId,
                sender: "ASSISTANT",
                content: cleanedText,
              },
            });
            await prisma.conversation.update({
              where: { id: finalConvId },
              data: { updatedAt: new Date() },
            });
          } catch (dbErr) {
            console.error("Lỗi khi lưu tin nhắn AI vào DB:", dbErr);
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Remaining-Credits": String(isAdmin ? 999999 : updatedUser.credits),
        "X-Conversation-Id": finalConvId,
        "X-AI-Model-Id": selectedAI?.modeId || "fast",
        "X-AI-Model": encodeURIComponent(selectedAI?.name || "Biết Tuốt AI"),
      },
    });
  } catch (error) {
    console.error("Lỗi trong API /api/chat:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý tin nhắn" },
      { status: 500 }
    );
  }
}
