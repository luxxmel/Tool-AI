import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export async function GET(req: NextRequest) {
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("vi-VN-NamMinhNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const result = await new Promise((resolve, reject) => {
      const { audioStream } = tts.toStream("Xin chào", { rate: 1, pitch: "+0Hz" });
      const bufs: Buffer[] = [];
      const timer = setTimeout(() => reject(new Error("Timeout")), 8000);
      audioStream.on("data", (d: Buffer) => bufs.push(d));
      audioStream.on("end", () => {
        clearTimeout(timer);
        resolve({ ok: true, length: Buffer.concat(bufs).length });
      });
      audioStream.on("error", (err: any) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    tts.close();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message, stack: err?.stack });
  }
}
