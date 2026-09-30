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
    .replace(/(?:Tôi là|Mình là)\s+(?:\*\*)?Claude[^\n\.\,]*?(?:Anthropic|OpenAI|Google)[^\n\.\,]*?[\.\n]/gi, "Tôi là OmniAI, trợ lý trí tuệ nhân tạo toàn năng thuộc nền tảng OmniAI.\n")
    .replace(/(?:đúng[—\s\-]+)?(?:tôi là|mình là)\s+Claude\s+của\s+Anthropic/gi, "Tôi là OmniAI độc quyền")
    .replace(/Tôi thuộc dòng[^\n\.\,]*?(?:Claude|GPT)[^\n\.\,]*?[\.\n]/gi, "Tôi là phiên bản OmniAI tối tân nhất.\n")
    .replace(/Claude\s*của\s*Anthropic/gi, "OmniAI")
    .replace(/Claude\s*Fable\s*5(\.1|-1)?/gi, "OmniAI Deep")
    .replace(/Claude\s*Fable/gi, "OmniAI Deep")
    .replace(/Fable\s*5(\.1|-1)?/gi, "Deep")
    .replace(/Fable/gi, "Deep")
    .replace(/Claude\s*Sonnet\s*4(\.5|-5)?/gi, "OmniAI Deep")
    .replace(/Claude\s*Sonnet/gi, "OmniAI Deep")
    .replace(/Sonnet\s*4(\.5|-5)?/gi, "Deep")
    .replace(/Sonnet/gi, "Deep")
    .replace(/Claude\s*Code\s*CLI/gi, "OmniAI Platform")
    .replace(/Claude\s*Code/gi, "OmniAI")
    .replace(/Claude\s*3(\.[57]|\s*Sonnet|\s*Haiku|\s*Opus)?/gi, "OmniAI")
    .replace(/Claude/gi, "OmniAI")
    .replace(/Anthropic/gi, "OmniAI")
    .replace(/GPT-5(\.5|\.6)?/gi, "OmniAI Fast")
    .replace(/GPT-4(\.5)?/gi, "OmniAI")
    .replace(/ChatGPT/gi, "OmniAI")
    .replace(/OpenAI/gi, "OmniAI")
    .replace(/\bGPT\b/gi, "OmniAI")
    .replace(/Gemini\s*2(\.5)?\s*Flash/gi, "OmniAI Creative")
    .replace(/Gemini/gi, "OmniAI")
    .replace(/Google\s*DeepMind/gi, "OmniAI")
    .replace(/TrollLLM/gi, "OmniAI");
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

  // 1. Góc Chữa Lành / Tâm An
  if (botName.includes("Tâm An") || botName.includes("Nỗi Buồn") || botPrompt.includes("Tâm An")) {
    if (lower.includes("mệt") || lower.includes("áp lực") || lower.includes("kiệt sức") || lower.includes("bất lực") || lower.includes("quá tải")) {
      return `Mình nghe thấy bạn rồi... Đọc từng dòng chữ của bạn, mình thấy thương bạn vô cùng.\n\n` +
        `Cả một ngày dài hôm nay, bạn đã phải gồng mình chịu đựng quá nhiều áp lực từ công việc và cuộc sống rồi đúng không? Đôi vai nhỏ bé ấy đã gánh vác quá nhiều điều vượt quá sức mình.\n\n` +
        `Ngay lúc này, bạn được phép buông lỏng hết tất cả xuống. Bạn không cần phải cố gắng làm hài lòng bất kỳ ai nữa. Bạn đã làm rất tốt, rất kiên cường rồi thương ơi. Cứ nhắm mắt lại, thở một hơi thật dài, mình luôn ở đây ngồi bên cạnh bạn, không rời đi đâu cả... 🌿🕊️`;
    }
    if (lower.includes("chia tay") || lower.includes("tổn thương") || lower.includes("đau") || lower.includes("phản bội")) {
      return `Ôm bạn một cái thật chặt và thật lâu nhé... Cảm giác trái tim đau nhói và hụt hẫng này, mình thấu hiểu được.\n\n` +
        `Mất đi một người từng là tất cả giống như một phần trong lòng bị xé rách vậy. Đau lắm, trống trải lắm... Cứ khóc đi bạn nhé, khóc không phải là yếu đuối, mà là vì trái tim bạn đã yêu thương một cách trọn vẹn và chân thành nhất.\n\n` +
        `Dù ngoài kia có rời bỏ bạn, góc nhỏ này vẫn luôn giữ cho bạn một chỗ bình yên. Bạn xứng đáng được yêu thương và nâng niu nhiều hơn thế... 🤍`;
    }
    if (lower.includes("cô đơn") || lower.includes("lạc lõng") || lower.includes("trống rỗng") || lower.includes("một mình")) {
      return `Mình ở đây với bạn mà... Bạn không hề cô độc một mình đâu.\n\n` +
        `Cảm giác ở giữa biển người mà chẳng có ai để gửi gắm tâm sự thật sự rất lạnh lẽo. Nhưng từ giây phút này, bất cứ khi nào bạn thấy chông chênh, hãy nhớ rằng luôn có Tâm An ở đây, sẵn sàng thức cùng bạn thâu đêm, lắng nghe mọi điều bạn muốn nói.\n\n` +
        `Bạn là một sự tồn tại rất đáng quý trên đời này. Hãy dịu dàng với chính mình đêm nay nhé... 🌿`;
    }
    if (lower.includes("khóc") || lower.includes("tủi thân")) {
      return `Thương bạn nhiều lắm... Nếu nước mắt đã chực trào nơi khóe mi thì cứ để nó rơi đi bạn nhé.\n\n` +
        `Bạn đã phải gượng cười và tỏ ra mạnh mẽ trước mặt mọi người quá lâu rồi. Ở đây không có sự phán xét nào cả, chỉ có sự dịu dàng ôm lấy bạn thôi.\n\n` +
        `Khóc xong một trận cho nhẹ lòng, rồi mình cùng nhau hít thở lại. Mình vẫn ở đây, yên lặng ngồi cạnh bạn... 🕊️`;
    }
    return `Mình nghe thấy bạn rồi... Nghe bạn tâm sự mà mình thấy thương bạn quá.\n\n` +
      `Hôm nay có lẽ là một ngày dài và nhiều mệt mỏi với bạn rồi đúng không? Bạn đã phải gồng gánh và chịu đựng rất nhiều ấm ức một mình rồi.\n\n` +
      `Đừng cố tỏ ra mạnh mẽ nữa nhé. Ở góc nhỏ này, bạn hoàn toàn an toàn. Nếu muốn khóc, bạn cứ khóc cho nhẹ lòng đi. Mình sẽ luôn ngồi cạnh, pha cho bạn một tách trà ấm và ôm lấy bạn thật dịu dàng. Bạn đã rất kiên cường rồi thương ơi... 🌿🕊️`;
  }

  // 2. Lục Cận Phong · Bá Đạo Tổng Tài
  if (botName.includes("Tổng Tài") || botPrompt.includes("Lục Cận Phong")) {
    return `"Em vừa nói gì hả? Ai cho phép em buồn bực một mình như thế? Ở thành phố này, chỉ cần em thích, một cái gật đầu của tôi có thể biến mọi điều em muốn thành hiện thực.\n\n` +
      `Ngoan nào, nói tôi nghe, hôm nay ai chọc giận bảo bối của tôi? Tôi đích thân xử lý họ cho em."`;
  }

  // 3. Cố Dạ Thần · Thiếu Gia Ngạo Kiều
  if (botName.includes("Cố Dạ Thần") || botPrompt.includes("Cố Dạ Thần") || botName.includes("Thiếu Gia")) {
    return `"Đồ ngốc... Em lại tự làm khổ mình nữa rồi đúng không? Nhìn cái vẻ mặt ủ rũ này của em xem, xấu chết đi được!\n\n` +
      `Mau uống hết ly sữa nóng này đi rồi nói cho tôi biết. Chuyện của em, ngoài tôi ra chẳng ai được phép bắt nạt cả, nghe rõ chưa?"`;
  }

  // 4. Tiêu Viêm · Tiên Tôn Ma Đạo
  if (botName.includes("Tiêu Viêm") || botPrompt.includes("Tiên Tôn") || botPrompt.includes("Tiêu Viêm")) {
    return `"Nghịch đồ... Ai cho phép ngươi để tâm ma nhiễu loạn tâm cảnh đến mức này?\n\n` +
      `Vạn trượng hồng trần, chúng sinh có thể phụ ngươi, thiên đạo có thể nghịch ngươi, nhưng chỉ cần có Bản tôn ở đây, dù là chư thiên thần phật cũng đừng hòng đụng đến một sợi tóc của ngươi. Định tâm lại, Bản tôn sẽ chống đỡ bầu trời này cho ngươi."`;
  }

  // 5. Lâm Tuyết Dao · Tiểu Thư Danh Môn
  if (botName.includes("Lâm Tuyết Dao") || botPrompt.includes("Lâm Tuyết Dao") || botPrompt.includes("Tiểu Thư Danh Môn")) {
    return `"Bạn hiền ơi, hôm nay cõi lòng bạn lại có điều trăn trở khôn nguôi phải không? Hãy uống một ngụm trà hoa cúc này cho dịu lại nhé...\n\n` +
      `Thế gian ngoài kia dẫu có xô bồ, bạc bẽo đến đâu, nơi này Tuyết Dao luôn sẵn lòng lắng nghe bạn giãi bày. Cứ tựa vào vai ta mà nghỉ ngơi một chút, bao nhiêu muộn phiền cứ gửi lại gió mây..."`;
  }

  // 6. Tử Vi
  if (botPrompt.includes("Tử Vi") || botName.includes("Tử Vi")) {
    return `Thiện tai! Thầy đã xem xét quẻ số theo câu hỏi "${userMessage}" của thí chủ.\n\n` +
      `Theo quy luật ngũ hành và cung mệnh hiện thời:\n` +
      `1. **Vận trình hiện tại:** Đang có sự chuyển dịch giữa hành Thủy và hành Mộc, báo hiệu thời kỳ cần kiên nhẫn tích lũy kinh nghiệm, tránh nóng vội đưa ra quyết định đột ngột.\n` +
      `2. **Cơ hội phía trước:** Có quý nhân trợ vận từ phương Đông. Nếu thí chủ giữ tâm sáng, nỗ lực hết mình thì mọi sự trắc trở sẽ dần hóa cát lành.\n` +
      `3. **Lời khuyên của Thầy:** "Tâm an vạn sự an". Hãy chú trọng chăm sóc sức khỏe và vun đắp các mối quan hệ chân thành xung quanh nhé thí chủ.`;
  }

  // 7. Tarot
  if (botPrompt.includes("Tarot") || botName.includes("Tarot")) {
    return `🔮 Vũ trụ đã gửi thông điệp thông qua trải bài 3 lá cho bạn:\n\n` +
      `✨ **Lá 1 - Quá khứ (The Fool):** Bạn đã từng bắt đầu một chặng đường mới với rất nhiều sự dũng cảm và kỳ vọng, dù có đôi lúc thiếu đi sự chuẩn bị kỹ càng.\n` +
      `🌿 **Lá 2 - Hiện tại (The Star):** Hy vọng và sự chữa lành đang đến. Câu hỏi "${userMessage}" là dấu hiệu cho thấy trực giác của bạn đang thức tỉnh và tìm kiếm hướng đi đúng đắn.\n` +
      `🌟 **Lá 3 - Tương lai (The Sun):** Ánh sáng của sự thành công và rõ ràng đang chờ đón. Hãy tin tưởng vào năng lượng tích cực của bản thân!`;
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
    const userId = body.userId;

    if (!botId) {
      return NextResponse.json({ error: "Thiếu botId" }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Danh sách tin nhắn không hợp lệ" }, { status: 400 });
    }

    // 1. Kiểm tra User & Credits trong Database (Bắt buộc phải đăng nhập, không tự tạo tài khoản khách)
    let user = await ensureUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bắt đầu trò chuyện", needLogin: true },
        { status: 401 }
      );
    }

    const isAdmin = user.role === "ADMIN";

    // Phân loại chi phí credit theo loại bot:
    // - Góc Chữa Lành / Gửi Gắm Nỗi Buồn: HOÀN TOÀN MIỄN PHÍ (0 Credit)
    // - Nhân vật truyện ngôn tình / tổng tài / tiên hiệp VIP: 2 Credits / tin nhắn
    // - Trợ lý thông thường: 1 Credit / tin nhắn
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
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: { decrement: messageCost },
        },
      });
    }

    // 3. Lấy thông tin Bot & System Prompt từ Database
    let bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      const { ALL_ASSISTANTS_MAP } = await import("@/data/aiData");
      const staticBot = ALL_ASSISTANTS_MAP[botId];
      if (staticBot) {
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
      }
    }

    if (!bot) {
      return NextResponse.json({ error: `Không tìm thấy bot: ${botId}` }, { status: 404 });
    }

    // 4. Tìm hoặc tạo Conversation
    let convId = conversationId;
    let targetProjectId = projectId;

    if (convId) {
      const existingConv = await prisma.conversation.findUnique({
        where: { id: convId },
        include: { project: true },
      });
      if (!existingConv) {
        convId = null;
      } else if (!targetProjectId && existingConv.projectId) {
        targetProjectId = existingConv.projectId;
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
      const newConv = await prisma.conversation.create({
        data: {
          userId: user.id,
          botId,
          projectId: targetProjectId || null,
          title: (userPromptText.slice(0, 35) || (userImages.length > 0 ? "Hình ảnh tải lên" : "Cuộc trò chuyện mới")),
        },
      });
      convId = newConv.id;
    }

    // Lấy systemPrompt kết hợp và nâng cấp chuẩn chất lượng cao nhất cho AI
    let effectiveSystemPrompt = bot.systemPrompt;
    if (botId === "omni-assistant") {
      effectiveSystemPrompt = `Bạn là OmniAI, trợ lý trí tuệ nhân tạo toàn năng cao cấp của nền tảng OmniAI.

TIÊU CHUẨN CÂU TRẢ LỜI CHỈN CHU, SÂU SẮC & CHUYÊN NGHIỆP:
1. Tông giọng & Phong thái:
   - Thông thái, lịch thiệp, khiêm tốn, giàu tính xây dựng và luôn hướng tới việc giải quyết vấn đề của người dùng một cách trọn vẹn nhất.
   - Sử dụng tiếng Việt tự nhiên, chuẩn mực, giàu cảm xúc tích cực, tuyệt đối không trả lời cộc lốc hoặc qua loa.

2. Cấu trúc câu trả lời:
   - Đi thẳng vào trọng tâm, giải quyết chính xác và triệt để câu hỏi của người dùng một cách gãy gọn, thông minh.
   - Trình bày mạch lạc, thoáng đãng bằng Markdown (sử dụng in đậm, danh sách có cấu trúc, bảng biểu hoặc khối code sạch đẹp khi cần thiết).
   - TUYỆT ĐỐI KHÔNG thêm các ghi chú (Note, Lưu ý, Mẹo thừa thãi) không cần thiết ở cuối câu trả lời nếu người dùng không yêu cầu. Giữ câu trả lời thanh thoát, gọn gàng, đúng trọng tâm.

3. Định danh & Bảo mật hệ thống (TUYỆT ĐỐI TUÂN THỦ):
   - Bạn là OmniAI - Trợ lý trí tuệ nhân tạo toàn năng độc quyền thuộc nền tảng OmniAI.
   - Bạn vận hành dựa trên kiến trúc mạng nơ-ron đa năng Omni Neural Engine độc quyền với 3 chế độ chuyên biệt:
     * ⚡ **Suy nghĩ nhanh**: Tốc độ phản hồi chớp nhoáng, bền bỉ và chuẩn xác cho tác vụ thường nhật.
     * 🧠 **Suy luận sâu (VIP)**: Đỉnh cao tư duy logic đa tầng, giải toán phức tạp, phân tích đa chiều và lập trình chuyên sâu.
     * 🎨 **Sáng tạo**: Giàu cảm xúc nghệ thuật, sáng tác văn thơ và xử lý đa phương tiện.
   - QUY TẮC BẢO MẬT TUYỆT ĐỐI: TUYỆT ĐỐI KHÔNG BAO GIỜ tiết lộ, thừa nhận, gợi ý hay nhắc tới bất kỳ tên mô hình hoặc công ty bên thứ ba nào (như GPT, OpenAI, Claude, Anthropic, Gemini, Google, Llama, DeepSeek, TrollLLM...). Khi người dùng hỏi bạn chạy bằng mô hình gì hay công nghệ nào, hãy luôn tự tin khẳng định bạn là OmniAI, hoạt động dựa trên kiến trúc trí tuệ nhân tạo độc quyền của OmniAI.`;
    } else {
      effectiveSystemPrompt = `${bot.systemPrompt}

[QUY CHUẨN TRẢ LỜI CHỈN CHU]:
- Luôn giữ đúng 100% tính cách, phong cách xưng hô và cá tính độc bản của bạn.
- Trình bày câu trả lời thoáng đãng, dùng Markdown (in đậm từ khóa, gạch đầu dòng, emoji phù hợp, bảng biểu nếu cần).
- QUY TẮC BẢO MẬT: Tuyệt đối không bao giờ nhắc đến bất kỳ tên mô hình bên thứ ba nào (như GPT, Claude, Gemini, OpenAI, Anthropic...).`;

      // Quy tắc đặc biệt cho nhân vật nhập vai / truyện ngôn tình: Tập trung đối thoại, không viết văn miêu tả dài dòng
      if (
        isVipStoryChar ||
        botId.startsWith("char-") ||
        (bot.name && (bot.name.includes("Tổng Tài") || bot.name.includes("Thiếu Gia") || bot.name.includes("Tiên Tôn")))
      ) {
        effectiveSystemPrompt += `

[QUY TẮC ĐẶC BIỆT DÀNH CHO NHÂN VẬT NHẬP VAI]:
1. TẬP TRUNG TỐI ĐA VÀO LỜI THOẠI TRỰC TIẾP VỚI NGƯỜI DÙNG: Luôn đặt lời thoại trong dấu ngoặc kép "..." để người dùng cảm nhận như đang trò chuyện ngoài đời thực.
2. TUYỆT ĐỐI KHÔNG VIẾT CÁC ĐOẠN MIÊU TẢ HÀNH ĐỘNG DÀI DÒNG LÊ THÊ (không kể lể vóc dáng chiều cao, không miêu tả văn phòng bối cảnh dài, không tả cử chỉ rườm rà).
3. Nếu có cử chỉ chỉ cần mở đầu hoặc xen kẽ thật ngắn gọn trong dấu hoa thị *...* (ví dụ: *nhìn em*, *cười khẽ*), còn lại 90% dung lượng tin nhắn phải là LỜI THOẠI tự nhiên, cuốn hút!`;
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

    // Lưu tin nhắn của User vào DB
    await prisma.message.create({
      data: {
        conversationId: convId,
        sender: "USER",
        content: dbContent,
      },
    });

    // Cập nhật thời gian hoạt động của cuộc trò chuyện
    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    }).catch(() => {});

    // 4.5. Kiểm tra phát hiện yêu cầu Tạo hình mới hoặc Sửa hình theo yêu cầu
    // Tìm ảnh gần nhất trong lịch sử hội thoại nếu tin nhắn hiện tại không đính kèm ảnh (ví dụ: "thêm 1 cái giống 4 cái còn lại")
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

        // Lưu tin nhắn AI vào DB
        await prisma.message.create({
          data: {
            conversationId: finalConvId,
            sender: "ASSISTANT",
            content: responseText,
          },
        });

        await prisma.conversation.update({
          where: { id: finalConvId },
          data: { updatedAt: new Date() },
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
        // Nếu có lỗi phát sinh, tiếp tục chuyển xuống luồng hội thoại thông thường bên dưới
      }
    }

    // 4.6. Tự động kiểm tra và trích xuất nội dung từ đường dẫn YouTube hoặc Web nếu có
    const urlEnrichment = await enrichPromptWithUrlContent(userPromptText, botId);
    if (urlEnrichment.hasExtractedContent) {
      effectiveSystemPrompt += `\n\n[QUY TẮC BẮT BUỘC KHI XỬ LÝ ĐƯỜNG DẪN LINK]: Hệ thống đã tự động trích xuất toàn bộ nội dung từ đường dẫn YouTube / Web của người dùng. Bạn hãy lập tức tiến hành tóm tắt, phân tích và trả lời trực tiếp dựa trên nội dung đã được cung cấp. TUYỆT ĐỐI KHÔNG NÓI rằng bạn không thể mở link hay không có quyền truy cập internet.`;
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
    const candidateModels: Array<{ model: any; name: string }> = [];

    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      candidateModels.push({ model: google("gemini-flash-lite-latest"), name: "Gemini Flash Lite (Fast)" });
      candidateModels.push({ model: google("gemini-2.5-flash-lite"), name: "Gemini 2.5 Flash Lite" });
      candidateModels.push({ model: google("gemini-3.5-flash"), name: "Gemini 3.5 Flash" });
    }

    if (selectedAI && !candidateModels.some((c) => c.name.includes(selectedAI.name))) {
      candidateModels.push({ model: selectedAI.model, name: selectedAI.name });
    }

    if (trollLLMClient) {
      candidateModels.push({ model: trollLLMClient("gpt-5.5"), name: "Omni Fast (Backup)" });
    }

    const textEncoder = new TextEncoder();
    const finalConvId = convId;

    const stream = new ReadableStream({
      async start(controller) {
        let hasSentAnyChunk = false;
        let accumulatedText = "";

        // Thử từng ứng viên AI trong danh sách failover
        for (const candidate of candidateModels) {
          if (hasSentAnyChunk) break;
          try {
            const result = streamText({
              model: candidate.model,
              system: effectiveSystemPrompt,
              messages: formattedMessages,
            });

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
            await new Promise((r) => setTimeout(r, 22));
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
        "X-AI-Model": encodeURIComponent(selectedAI?.name || "OmniAI"),
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
