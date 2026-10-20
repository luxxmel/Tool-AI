import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// Làm sạch văn bản để giọng đọc diễn cảm, mượt mà và tự nhiên nhất
function cleanTextForEmotionalSpeech(text: string): string {
  if (!text) return "";

  // 1. Kiểm tra nếu có lời thoại trong ngoặc kép "..." hoặc “...”
  const quotes = text.match(/["“][\s\S]*?["”]/g);
  let baseText = "";
  if (quotes && quotes.length > 0) {
    // Chỉ lấy lời thoại trong ngoặc kép
    baseText = quotes.map((q) => q.replace(/["“”]/g, "").trim()).join(", ");
  } else {
    // Nếu không có ngoặc kép, loại bỏ toàn bộ các ghi chú hành động / cử chỉ / miêu tả
    baseText = text
      .replace(/\*[\s\S]*?\*/g, " ")
      .replace(/_[\s\S]*?_/g, " ")
      .replace(/\([^)]*?\)/g, " ")
      .replace(/\[[^\]]*?\]/g, " ")
      .replace(/【[^】]*?】/g, " ")
      .replace(/<[^>]*?>/g, " ");
  }

  return baseText
    // Bỏ link markdown [nội dung](url) -> nội dung
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Bỏ định dạng markdown và các dấu ngoặc kép trích dẫn
    .replace(/[*#`_~>\"“”'‘’«»]/g, " ")
    // Bỏ các ký hiệu icon, emoji để giọng đọc không bị vấp
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
      ""
    )
    // Thay dấu ba chấm hoặc gạch ngang bằng dấu phẩy tạo khoảng nghỉ thở tự nhiên
    .replace(/\.{3,}/g, ", ")
    .replace(/—/g, ", ")
    // Chuẩn hóa khoảng trắng
    .replace(/\s+/g, " ")
    .trim();
}

// Hàm sinh giọng đọc Neural với handshake ổn định và tự động thử lại
async function synthesizeNeuralWithRetry(
  text: string,
  voice: string,
  rate: number,
  pitch: string
): Promise<Buffer> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      // Chờ 120ms để WebSocket hoàn tất đăng ký speech.config trước khi gửi SSML
      await new Promise((r) => setTimeout(r, 120));

      const buf = await new Promise<Buffer>((resolve, reject) => {
        const { audioStream } = tts.toStream(text, { rate, pitch });
        const bufs: Buffer[] = [];
        const timer = setTimeout(() => {
          if (bufs.length > 0) resolve(Buffer.concat(bufs));
          else reject(new Error("Timeout khi tạo giọng đọc Neural"));
        }, 15000);

        audioStream.on("data", (d: Buffer) => bufs.push(d));
        audioStream.on("end", () => {
          clearTimeout(timer);
          resolve(Buffer.concat(bufs));
        });
        audioStream.on("error", (err: any) => {
          clearTimeout(timer);
          if (bufs.length > 0) {
            resolve(Buffer.concat(bufs));
          } else {
            reject(err);
          }
        });
      });

      if (buf && buf.length > 0) return buf;
    } catch (err: any) {
      console.warn(`Neural TTS attempt ${attempt} failed:`, err?.message || err);
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      try {
        tts.close();
      } catch {}
    }
  }
  throw new Error("Không thể tạo giọng đọc Neural sau 2 lần thử");
}

// Chia văn bản thành từng câu ngắn tự nhiên (dưới 160 ký tự) theo dấu chấm câu cho Google fallback
function splitTextIntoSentences(text: string, maxLength: number = 160): string[] {
  if (text.length <= maxLength) return [text];

  const rawSentences = text.match(/[^.!?\n;]+[.!?\n;]+|[^.!?\n;]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + " " + trimmed).trim().length <= maxLength) {
      currentChunk = (currentChunk + " " + trimmed).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      if (trimmed.length > maxLength) {
        const parts = trimmed.split(/([,:]|\s+)/);
        let partChunk = "";
        for (const part of parts) {
          if ((partChunk + part).length <= maxLength) {
            partChunk += part;
          } else {
            if (partChunk.trim()) chunks.push(partChunk.trim());
            partChunk = part;
          }
        }
        if (partChunk.trim()) {
          currentChunk = partChunk.trim();
        }
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

// Fallback: Google Translate TTS nếu Neural gặp sự cố mạng bất khả kháng
async function fetchGoogleTTSChunk(chunk: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    chunk
  )}&tl=vi&client=tw-ob`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://translate.google.com/",
    },
  });

  if (!res.ok) {
    throw new Error(`Google TTS status: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function resolveVoiceConfig(voiceParam: string) {
  const v = (voiceParam || "").toLowerCase();

  // 1. Giọng Bá Đạo Tổng Tài / Ma Vương / Chiến Thần (Trầm khàn uy quyền, điện ảnh, nam thần lồng tiếng phim)
  if (
    v === "tong_tai" ||
    v === "ma_vuong" ||
    v === "chien_than" ||
    v === "sat_thu" ||
    v.includes("tong_tai") ||
    v.includes("trieu_vo_than") ||
    v.includes("luc_ngang_thien") ||
    v.includes("ma_ton") ||
    v.includes("thac_bat_da") ||
    v.includes("du_ma_hai")
  ) {
    return {
      selectedVoice: "vi-VN-NamMinhNeural",
      voiceRate: 0.90,
      voicePitch: "-7Hz",
    };
  }

  // 2. Giọng Công Tử / Giáo Sư / Bác Sĩ Tâm Lý / Thư Sinh (Thanh tao, điềm tĩnh, ấm áp dịu dàng chuẩn phim tình cảm)
  if (
    v === "thu_sinh" ||
    v === "giao_su" ||
    v === "bac_si" ||
    v === "cong_tu" ||
    v.includes("mac_tu_khiem") ||
    v.includes("bui_chi_dien") ||
    v.includes("dinh_khac_nam") ||
    v.includes("mo_dung_ta") ||
    v.includes("ho_nguyet_bach")
  ) {
    return {
      selectedVoice: "vi-VN-NamMinhNeural",
      voiceRate: 0.94,
      voicePitch: "-2Hz",
    };
  }

  // 3. Giọng Nam Trẻ Năng Động / Biker / Idol / Thể Thao (Rõ ràng, dứt khoát, hào sảng)
  if (
    v === "nam_tre" ||
    v === "idol" ||
    v === "biker" ||
    v === "the_thao" ||
    v === "hai_tac" ||
    v.includes("giang_da") ||
    v.includes("bach_nhuy_bang") ||
    v.includes("tran_vinh_quan") ||
    v.includes("lam_phong_chau") ||
    v.includes("co_yen_thanh")
  ) {
    return {
      selectedVoice: "vi-VN-NamMinhNeural",
      voiceRate: 1.02,
      voicePitch: "+0Hz",
    };
  }

  // 4. Giọng Nữ Ngọt Ngào / Bạn Gái / Quận Chúa E Ốp (Dễ thương, nũng nịu, ngọt ngào trong trẻo)
  if (
    v === "female_sweet" ||
    v === "nu_ngot" ||
    v === "ban_gai" ||
    v === "quan_chua" ||
    v.includes("nha_an") ||
    v.includes("tieu_duyet_nhi")
  ) {
    return {
      selectedVoice: "vi-VN-HoaiMyNeural",
      voiceRate: 0.98,
      voicePitch: "+4Hz",
    };
  }

  // 5. Giọng Nữ Soái Tỷ / Nữ Hoàng Băng Giá / Cyberpunk (Sắc lạnh, kiêu kỳ, bản lĩnh quý cô tổng tài)
  if (
    v === "nu_soai_ty" ||
    v === "bang_gia" ||
    v === "cyberpunk" ||
    v === "nu_hoang" ||
    v.includes("vuong_tue_tuyet") ||
    v.includes("ha_lan_tuyet")
  ) {
    return {
      selectedVoice: "vi-VN-HoaiMyNeural",
      voiceRate: 0.93,
      voicePitch: "-3Hz",
    };
  }

  // 6. Giọng Nữ Cổ Trang / Thục Nữ / Mỹ Nhân Tỳ Bà (Dịu dàng, thanh thoát, đượm nét thơ phim cổ trang)
  if (
    v === "co_trang" ||
    v === "thuc_nu" ||
    v === "ty_ba" ||
    v.includes("chu_tue_nguyet") ||
    v.includes("duong_tam_tieu")
  ) {
    return {
      selectedVoice: "vi-VN-HoaiMyNeural",
      voiceRate: 0.92,
      voicePitch: "+1Hz",
    };
  }

  // 7. Giọng Nam Chung mặc định
  if (
    v === "male" ||
    v === "nam" ||
    v.includes("namminh")
  ) {
    return {
      selectedVoice: "vi-VN-NamMinhNeural",
      voiceRate: 0.94,
      voicePitch: "-4Hz",
    };
  }

  // 8. Giọng Nữ Chuẩn Truyền Cảm Phim (Mặc định)
  return {
    selectedVoice: "vi-VN-HoaiMyNeural",
    voiceRate: 0.95,
    voicePitch: "+0Hz",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawText = searchParams.get("text") || "";
    const voiceParam = searchParams.get("voice") || "female";
    const clean = cleanTextForEmotionalSpeech(rawText);

    if (!clean) {
      return new NextResponse("Text is required", { status: 400 });
    }

    const { selectedVoice, voiceRate, voicePitch } = resolveVoiceConfig(voiceParam);
    const textToSynthesize = clean.slice(0, 420);

    // 1. Thử sinh âm thanh với Microsoft Neural Voice
    try {
      const buf = await synthesizeNeuralWithRetry(
        textToSynthesize,
        selectedVoice,
        voiceRate,
        voicePitch
      );
      if (buf && buf.length > 0) {
        return new NextResponse(new Uint8Array(buf), {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
            "X-TTS-Engine": "Microsoft-Neural",
          },
        });
      }
    } catch (neuralError) {
      console.warn("Microsoft Neural TTS GET fallback:", neuralError);
    }

    // 2. Fallback sang Google Translate TTS
    const googleChunks = splitTextIntoSentences(clean.slice(0, 350), 140).slice(0, 3);
    const fallbackBuffers: Buffer[] = [];
    for (const chunk of googleChunks) {
      try {
        const buf = await fetchGoogleTTSChunk(chunk);
        fallbackBuffers.push(buf);
      } catch (err) {
        console.error("Lỗi Google TTS fallback chunk:", chunk, err);
      }
    }

    if (fallbackBuffers.length === 0) {
      return new NextResponse("Failed to generate speech", { status: 500 });
    }

    const combined = Buffer.concat(fallbackBuffers);
    return new NextResponse(new Uint8Array(combined), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-TTS-Engine": "Google-Fallback",
      },
    });
  } catch (error: any) {
    console.error("TTS GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text || "";
    const voiceParam = body.voice || "female";
    const clean = cleanTextForEmotionalSpeech(rawText);

    if (!clean) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const { selectedVoice, voiceRate, voicePitch } = resolveVoiceConfig(voiceParam);
    const textToSynthesize = clean.slice(0, 420);

    // 1. Thử sinh âm thanh với Microsoft Neural Voice
    try {
      const buf = await synthesizeNeuralWithRetry(
        textToSynthesize,
        selectedVoice,
        voiceRate,
        voicePitch
      );
      if (buf && buf.length > 0) {
        return new NextResponse(new Uint8Array(buf), {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
            "X-TTS-Engine": "Microsoft-Neural",
          },
        });
      }
    } catch (neuralError) {
      console.warn("Microsoft Neural TTS POST fallback:", neuralError);
    }

    // 2. Fallback sang Google Translate TTS
    const googleChunks = splitTextIntoSentences(clean.slice(0, 350), 140).slice(0, 3);
    const fallbackBuffers: Buffer[] = [];
    for (const chunk of googleChunks) {
      try {
        const buf = await fetchGoogleTTSChunk(chunk);
        fallbackBuffers.push(buf);
      } catch (err) {
        console.error("Lỗi Google TTS fallback chunk:", chunk, err);
      }
    }

    if (fallbackBuffers.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 }
      );
    }

    const combined = Buffer.concat(fallbackBuffers);
    return new NextResponse(new Uint8Array(combined), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-TTS-Engine": "Google-Fallback",
      },
    });
  } catch (error: any) {
    console.error("TTS POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
